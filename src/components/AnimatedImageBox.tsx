import { motion, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

type Variant = 'section' | 'card';

export function AnimatedImageBox({
  src,
  alt,
  className,
  imgClassName,
  variant = 'section',
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  variant?: Variant;
}) {
  const reduceMotion = useReducedMotion();
  const zoom = variant === 'card' ? 1.03 : 1.05;

  return (
    <motion.div className={cn('relative h-full w-full overflow-hidden', className)} initial={false}>
      <motion.img
        src={src}
        alt={alt}
        loading="lazy"
        className={cn('h-full w-full object-cover', imgClassName)}
        whileHover={reduceMotion ? undefined : { scale: zoom }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      />
    </motion.div>
  );
}
