const CODE_VERIFIER_KEY = 'spotify_code_verifier';
const SPOTIFY_AUTH_KEY = 'spotify_auth';

function createRandomString(length) {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let text = '';
  for (let i = 0; i < length; i++) {
    text += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return text;
}

function base64UrlEncode(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function generateCodeChallenge(codeVerifier) {
  const encoder = new TextEncoder();
  const data = encoder.encode(codeVerifier);
  const digest = await window.crypto.subtle.digest('SHA-256', data);
  return base64UrlEncode(digest);
}

function getClientId() {
  const clientId = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  if (!clientId) {
    throw new Error('Missing VITE_SPOTIFY_CLIENT_ID environment variable');
  }
  return clientId;
}

function getRedirectUri() {
  const redirectUri = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;
  if (!redirectUri) {
    throw new Error('Missing VITE_SPOTIFY_REDIRECT_URI environment variable');
  }

  try {
    const url = new URL(redirectUri);
    const isHttps = url.protocol === 'https:';
    const isLoopbackHttp =
      url.protocol === 'http:' &&
      (url.hostname === '127.0.0.1' || url.hostname === '[::1]');

    if (!isHttps && !isLoopbackHttp) {
      throw new Error(
        'Invalid redirect URI: must use HTTPS or a loopback IP (http://127.0.0.1 or http://[::1]).'
      );
    }
  } catch (err) {
    throw new Error(err.message || 'Invalid VITE_SPOTIFY_REDIRECT_URI');
  }

  return redirectUri;
}

export async function startSpotifyLogin() {
  const clientId = getClientId();
  const redirectUri = getRedirectUri();

  console.log('[Spotify] startSpotifyLogin context', {
    location: window.location.href,
    origin: window.location.origin,
    existingVerifierLength:
      (window.sessionStorage.getItem(CODE_VERIFIER_KEY) || '').length,
  });

  const codeVerifier = createRandomString(64);
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  window.sessionStorage.setItem(CODE_VERIFIER_KEY, codeVerifier);

  console.log('[Spotify] Starting login', {
    clientId: clientId ? clientId.slice(0, 5) + '...' : null,
    redirectUri,
    codeVerifierLength: codeVerifier.length,
    storedVerifierLength:
      (window.sessionStorage.getItem(CODE_VERIFIER_KEY) || '').length,
  });

  const params = new URLSearchParams({
    client_id: clientId,
    response_type: 'code',
    redirect_uri: redirectUri,
    code_challenge_method: 'S256',
    code_challenge: codeChallenge,
    scope: 'user-read-email user-read-private user-library-read',
  });

  window.location.assign(
    `https://accounts.spotify.com/authorize?${params.toString()}`
  );
}

async function exchangeCodeForToken(code) {
  const clientId = getClientId();
  const redirectUri = getRedirectUri();
  const storedBefore = window.sessionStorage.getItem(CODE_VERIFIER_KEY) || '';
  const codeVerifier = window.sessionStorage.getItem(CODE_VERIFIER_KEY);

  console.log('[Spotify] Exchanging code for token', {
    code: code ? code.substring(0, 10) + '...' : null,
    clientId: clientId ? clientId.slice(0, 5) + '...' : null,
    redirectUri,
    origin: window.location.origin,
    hasCodeVerifier: !!codeVerifier,
    codeVerifierLength: codeVerifier ? codeVerifier.length : 0,
    storedBeforeLength: storedBefore.length,
  });

  if (!codeVerifier) {
    throw new Error('Missing PKCE code verifier. Please start the login flow again.');
  }

  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: 'authorization_code',
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
  });

  let data;
  try {
    data = await response.json();
  } catch (e) {
    data = null;
  }

  if (!response.ok) {
    console.error('Spotify token exchange failed', {
      status: response.status,
      statusText: response.statusText,
      body: data,
      debug: {
        redirectUri,
        clientId: clientId ? clientId.slice(0, 5) + '...' : null,
      },
    });

    const message =
      (data && (data.error_description || data.error)) ||
      'Failed to exchange authorization code for tokens';

    throw new Error(message);
  }

  if (!data) {
    throw new Error('Failed to parse Spotify token response');
  }

  const expiresInMs = (data.expires_in || 3600) * 1000;
  const expiresAt = Date.now() + expiresInMs - 60000;

  const auth = {
    accessToken: data.access_token,
    refreshToken: data.refresh_token || null,
    expiresAt,
  };

  console.log('[Spotify] Token exchange success', {
    hasAccessToken: !!auth.accessToken,
    hasRefreshToken: !!auth.refreshToken,
    expiresAt,
  });

  window.localStorage.setItem(SPOTIFY_AUTH_KEY, JSON.stringify(auth));

  return auth;
}

export function getStoredSpotifyAuth() {
  const raw = window.localStorage.getItem(SPOTIFY_AUTH_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

export function clearSpotifyAuth() {
  window.localStorage.removeItem(SPOTIFY_AUTH_KEY);
  window.sessionStorage.removeItem(CODE_VERIFIER_KEY);
}

export async function fetchSpotifyProfile(accessToken) {
  console.log('[Spotify] Fetching Spotify profile');
  const response = await fetch('https://api.spotify.com/v1/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    console.error('[Spotify] Failed to fetch profile', {
      status: response.status,
      statusText: response.statusText,
    });
    throw new Error('Failed to fetch Spotify profile');
  }

  const profile = await response.json();
  console.log('[Spotify] Spotify profile fetched', {
    email: profile && profile.email,
    id: profile && profile.id,
  });

  return profile;
}

export async function handleSpotifyCallback(code) {
  console.log('[Spotify] handleSpotifyCallback start', {
    code: code ? code.substring(0, 10) + '...' : null,
  });

  const auth = await exchangeCodeForToken(code);
  console.log('[Spotify] handleSpotifyCallback after token', {
    hasAccessToken: !!auth.accessToken,
  });

  const profile = await fetchSpotifyProfile(auth.accessToken);
  console.log('[Spotify] handleSpotifyCallback after profile', {
    email: profile && profile.email,
  });

  const stored = {
    ...auth,
    profile,
  };

  window.localStorage.setItem(SPOTIFY_AUTH_KEY, JSON.stringify(stored));
  window.sessionStorage.removeItem(CODE_VERIFIER_KEY);

  console.log('[Spotify] handleSpotifyCallback done');

  // Ensure we always leave the callback page after a successful login
  try {
    if (typeof window !== 'undefined') {
      window.location.assign('/home');
    }
  } catch (e) {
    // ignore navigation errors
  }

  return stored;
}
