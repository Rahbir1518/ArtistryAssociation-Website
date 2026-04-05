import { motion } from 'framer-motion';
import { Sparkle } from 'lucide-react';
import { cn } from '@/lib/utils';

type Variant = 'section' | 'card';

const floatClass: Record<Variant, string> = {
  section: 'animate-image-float-sm',
  card: 'animate-image-float-xs',
};

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
  const isCard = variant === 'card';

  return (
    <motion.div className={cn('relative h-full w-full overflow-hidden', className)} initial={false}>
      <motion.img
        src={src}
        alt={alt}
        className={cn(
          'h-full w-full object-cover img-cinematic',
          floatClass[variant],
          imgClassName
        )}
        whileHover={{ scale: 1.03 }}
        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      />
      <Sparkle
        className={cn(
          'pointer-events-none absolute text-artistry-gold opacity-80',
          isCard ? 'right-2 top-2 h-4 w-4' : 'right-3 top-3 h-5 w-5'
        )}
        strokeWidth={1.75}
        aria-hidden
      />
    </motion.div>
  );
}
