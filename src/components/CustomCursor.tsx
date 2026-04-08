import { useEffect, useRef } from 'react';
import './CustomCursor.css';

const INTERACTIVE =
  'a, button, [role="button"], input, textarea, select, label[for], summary, .cursor-hover';

const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const cursor = cursorRef.current;
    if (!cursor) return;

    const handleMouseMove = (e: MouseEvent) => {
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;

      const el = e.target as Element | null;
      const isInteractive = !!el?.closest(INTERACTIVE);
      cursor.toggleAttribute('data-hover', isInteractive);
    };

    const handleMouseDown = () => cursor.setAttribute('data-pressed', '');
    const handleMouseUp = () => cursor.removeAttribute('data-pressed');

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return <div ref={cursorRef} id="cursor-brush" aria-hidden />;
};

export default CustomCursor;
