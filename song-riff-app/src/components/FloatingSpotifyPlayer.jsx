import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';

/**
 * FloatingSpotifyPlayer
 * - Renders a floating Spotify iframe from a plain URL (no track metadata required)
 *
 * Props:
 * - containerRef: ref to the main layout container (for positioning)
 * - targetRef: ref to either left or right column element
 * - trackUrl: plain Spotify track URL (e.g. https://open.spotify.com/track/12345)
 */
const FloatingSpotifyPlayer = ({ containerRef, targetRef, trackUrl }) => {
  const boxRef = useRef(null);
  const [pos, setPos] = useState({ left: 0, top: 0, visible: false });

  if (!trackUrl) return null;

  // Convert normal Spotify link → embed link
  const embedUrl = trackUrl.replace(
    "open.spotify.com/track",
    "open.spotify.com/embed/track"
  );

  const computePosition = () => {
    const container = containerRef?.current;
    const target = targetRef?.current;
    const box = boxRef?.current;
    if (!container || !target || !box) return;

    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    const left = targetRect.left - containerRect.left;
    const top = targetRect.top - containerRect.top - 10; // place above column

    setPos({ left, top, visible: true });
  };

  useLayoutEffect(() => {
    computePosition();
    window.addEventListener('resize', computePosition);
    return () => window.removeEventListener('resize', computePosition);
  }, [targetRef, containerRef]);

  return (
    <div
      ref={boxRef}
      className="floating-spotify-player"
      style={{
        position: 'absolute',
        left: pos.left,
        top: pos.top,
        transform: 'translateY(-100%)',
        visibility: pos.visible ? 'visible' : 'hidden',
        zIndex: 999,
      }}
    >
      <iframe
        src={embedUrl}
        width="300"
        height="80"
        frameBorder="0"
        allow="encrypted-media"
      ></iframe>
    </div>
  );
};

export default FloatingSpotifyPlayer;
