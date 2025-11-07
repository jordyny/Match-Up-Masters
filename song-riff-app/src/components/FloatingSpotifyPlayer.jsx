import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import SpotifyPlayer from './SpotifyPlayer';

/**
 * FloatingSpotifyPlayer
 * - Renders a single Spotify iframe that is absolutely positioned inside the riff container
 * - Moves between left/right column anchors without unmounting to keep playback alive
 *
 * Props:
 * - containerRef: ref to the container element used for absolute positioning context
 * - targetRef: ref to the target column wrapper to center above
 * - track: spotify track data to render in the iframe
 */
const FloatingSpotifyPlayer = ({ containerRef, targetRef, track }) => {
  const boxRef = useRef(null);
  const [pos, setPos] = useState({ left: 0, top: 0, visible: false, anchor: 'left' });

  const computePosition = () => {
    const container = containerRef?.current;
    const target = targetRef?.current;
    const box = boxRef?.current;
    if (!container || !target || !box) return;

    const containerRect = container.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();

    const centerX = targetRect.left + targetRect.width / 2;
    const containerCenterX = containerRect.left + containerRect.width / 2;
    const topY = targetRect.top; // above the entire pane and selected lyric box

    // Determine which column we are targeting to set flush alignment
    const isRightColumn = centerX >= containerCenterX;
    const leftEdge = targetRect.left - containerRect.left;
    const rightEdge = targetRect.right - containerRect.left;

    // For left column: anchor left edge. For right column: anchor right edge.
    let left = isRightColumn ? rightEdge : leftEdge;
    // Clamp within container bounds to avoid flying off-screen
    left = Math.max(0, Math.min(left, containerRect.width));
    const top = topY - containerRect.top - 8; // 8px spacing above
    const anchor = isRightColumn ? 'right' : 'left';
    const width = Math.round(targetRect.width / 2);

    setPos({ left, top, visible: true, anchor, width });
  };

  useLayoutEffect(() => {
    computePosition();
    const onResize = () => computePosition();
    const onScroll = () => computePosition();
    window.addEventListener('resize', onResize);
    window.addEventListener('scroll', onScroll, { passive: true });

    const container = containerRef?.current;
    if (container) container.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('resize', onResize);
      window.removeEventListener('scroll', onScroll);
      if (container) container.removeEventListener('scroll', onScroll);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, targetRef]);

  useEffect(() => {
    computePosition();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track]);

  useEffect(() => {
    const container = containerRef?.current;
    if (!container) return;
    const onTransitionEnd = () => computePosition();
    container.addEventListener('transitionend', onTransitionEnd);
    return () => container.removeEventListener('transitionend', onTransitionEnd);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerRef, targetRef]);

  if (!track) return null;

  return (
    <div
      ref={boxRef}
      className="floating-spotify-player"
      style={{
        position: 'absolute',
        transform: pos.anchor === 'right' ? 'translate(-100%, -100%)' : 'translate(0, -100%)',
        left: pos.left,
        top: pos.top,
        width: pos.width || undefined,
        zIndex: 50,
        pointerEvents: 'auto',
        visibility: pos.visible ? 'visible' : 'hidden',
        transition: 'left 250ms ease, top 250ms ease'
      }}
    >
      <SpotifyPlayer spotify={track} />
    </div>
  );
};

export default FloatingSpotifyPlayer;
