import { motion } from 'framer-motion';

interface ShiningTextProps {
  children: string;
  className?: string;
  delay?: number;
}

export const ShiningText = ({ children, className = '', delay = 0 }: ShiningTextProps) => {
  return (
    <motion.span
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      animate={{
        backgroundPosition: ['200% center', '-200% center'],
      }}
      transition={{
        delay,
        duration: 3,
        repeat: Infinity,
        ease: 'linear',
      }}
      className={`bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent ${className}`}
      style={{
        backgroundSize: '200% 100%',
      } as any}
    >
      {children}
    </motion.span>
  );
};
