import { useEffect, useRef, useCallback } from 'react';
import './CustomCursor.css';

interface Stroke {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  life: number;
  decay: number;
  type: number; // 0=circle, 1=triangle, 2=square
}

const CustomCursor = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const strokesRef = useRef<Stroke[]>([]);
  const hueRef = useRef(0);
  const animationIdRef = useRef<number | undefined>(undefined);

  const createStroke = useCallback((x: number, y: number, speedMultiplier = 1): Stroke => {
    return {
      x,
      y,
      size: Math.random() * 15 + 5,
      speedX: (Math.random() * 3 - 1.5) * speedMultiplier,
      speedY: (Math.random() * 3 - 1.5) * speedMultiplier,
      color: `hsl(${hueRef.current}, 100%, 50%)`,
      life: 1.0,
      decay: Math.random() * 0.02 + 0.01,
      type: Math.floor(Math.random() * 3),
    };
  }, []);

  const drawStroke = useCallback((ctx: CanvasRenderingContext2D, stroke: Stroke) => {
    ctx.fillStyle = stroke.color;
    ctx.globalAlpha = stroke.life;
    ctx.beginPath();

    if (stroke.type === 0) {
      // Circle
      ctx.arc(stroke.x, stroke.y, stroke.size, 0, Math.PI * 2);
    } else if (stroke.type === 1) {
      // Triangle
      ctx.moveTo(stroke.x, stroke.y - stroke.size);
      ctx.lineTo(stroke.x + stroke.size, stroke.y + stroke.size);
      ctx.lineTo(stroke.x - stroke.size, stroke.y + stroke.size);
      ctx.closePath();
    } else {
      // Square
      ctx.rect(stroke.x - stroke.size / 2, stroke.y - stroke.size / 2, stroke.size, stroke.size);
    }

    ctx.fill();
    ctx.globalAlpha = 1.0;
  }, []);

  useEffect(() => {
    const cursor = cursorRef.current;
    const canvas = canvasRef.current;
    if (!canvas || !cursor) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      // Move custom cursor
      cursor.style.left = `${e.clientX}px`;
      cursor.style.top = `${e.clientY}px`;

      // Add paint strokes
      for (let i = 0; i < 3; i++) {
        strokesRef.current.push(createStroke(e.clientX, e.clientY));
      }
      hueRef.current = (hueRef.current + 2) % 360;
    };

    // Mouse down handler - explode paint
    const handleMouseDown = (e: MouseEvent) => {
      for (let i = 0; i < 20; i++) {
        const stroke = createStroke(e.clientX, e.clientY);
        stroke.speedX = (Math.random() - 0.5) * 10;
        stroke.speedY = (Math.random() - 0.5) * 10;
        strokesRef.current.push(stroke);
      }
      cursor.style.transform = 'translate(-50%, -50%) scale(0.5)';
      cursor.style.backgroundColor = '#4DFFF3';
    };

    // Mouse up handler
    const handleMouseUp = () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(1)';
      cursor.style.backgroundColor = 'var(--highlight-orange)';
    };

    // Animation loop
    const animatePaint = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      strokesRef.current = strokesRef.current.filter((stroke) => {
        // Update stroke
        stroke.x += stroke.speedX;
        stroke.y += stroke.speedY;
        if (stroke.size > 0.2) stroke.size -= 0.1;
        stroke.life -= stroke.decay;

        // Draw stroke
        drawStroke(ctx, stroke);

        // Keep if still alive
        return stroke.life > 0 && stroke.size > 0.2;
      });

      animationIdRef.current = requestAnimationFrame(animatePaint);
    };

    // Start animation
    animatePaint();

    // Add event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, [createStroke, drawStroke]);

  return (
    <>
      <div ref={cursorRef} id="cursor-brush" />
      <canvas ref={canvasRef} id="splat-canvas" />
    </>
  );
};

export default CustomCursor;
