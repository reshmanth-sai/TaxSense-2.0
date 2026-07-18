import React, { useState } from 'react';
import { motion, HTMLMotionProps } from 'motion/react';

interface PremiumCardProps extends HTMLMotionProps<'div'> {
  children: React.ReactNode;
}

export const PremiumCard: React.FC<PremiumCardProps> = ({ children, className = '', ...props }) => {
  const [coords, setCoords] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [rotateX, setRotateX] = useState(0);
  const [rotateY, setRotateY] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x, y });

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const tiltX = ((y - centerY) / centerY) * -3.5;
    const tiltY = ((x - centerX) / centerX) * 3.5;

    setRotateX(tiltX);
    setRotateY(tiltY);
  };

  // Safely extract paddings to prevent inner content layout issues
  const classes = className.split(' ');
  const paddingClass = classes.find(c => c.startsWith('p-')) || 'p-6';
  const otherClasses = classes.filter(c => !c.startsWith('p-')).join(' ');

  return (
    <div style={{ perspective: 1000 }} className="w-full h-full">
      <motion.div
        onMouseMove={handleMouseMove}
        onMouseEnter={(e) => {
          setIsHovered(true);
          if (props.onMouseEnter) props.onMouseEnter(e);
        }}
        onMouseLeave={(e) => {
          setIsHovered(false);
          setRotateX(0);
          setRotateY(0);
          if (props.onMouseLeave) props.onMouseLeave(e);
        }}
        animate={{
          rotateX: isHovered ? rotateX : 0,
          rotateY: isHovered ? rotateY : 0,
        }}
        transition={{ type: "spring", stiffness: 350, damping: 30 }}
        style={{ transformStyle: "preserve-3d" }}
        className={`relative p-[1px] rounded-[22px] overflow-hidden transition-colors duration-300 shadow-[0_12px_48px_rgba(15,23,42,0.06)] dark:shadow-[0_16px_56px_rgba(0,0,0,0.45)] ${otherClasses}`}
        {...props}
      >
        {/* Conic glowing border beam (Vercel style, 3.5s duration) */}
        <div
          className={`absolute inset-[-200%] bg-[conic-gradient(from_0deg,transparent,rgba(37,99,235,0.15),transparent_50%)] dark:bg-[conic-gradient(from_0deg,transparent,rgba(22,226,122,0.15),transparent_50%)] animate-border-beam pointer-events-none transition-opacity duration-500 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
        />

        {/* Surface wrapper with solid dark background mask to prevent background bleed */}
        <div className={`relative w-full h-full bg-gradient-to-b from-white/70 to-white/40 dark:from-[#111522] dark:to-[#0B0F19] border border-slate-200/70 dark:border-white/[0.04] border-t-white/80 dark:border-t-white/[0.12] rounded-[20px] backdrop-blur-[12px] shadow-[inset_0_1px_1px_rgba(255,255,255,0.3)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)] overflow-hidden ${paddingClass}`}>

          {/* Subtle diagonal gloss reflection sheet */}
          <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/[0.005] to-white/[0.015] pointer-events-none" />

          {/* Subtle radial cursor follow glow */}
          <div
            style={{
              background: `radial-gradient(150px circle at ${coords.x}px ${coords.y}px, rgba(37, 99, 235, 0.05), transparent 80%)`,
            }}
            className={`absolute inset-0 pointer-events-none transition-opacity duration-300 dark:hidden ${isHovered ? 'opacity-100' : 'opacity-0'}`}
          />
          <div
            style={{
              background: `radial-gradient(150px circle at ${coords.x}px ${coords.y}px, rgba(22, 226, 122, 0.035), transparent 80%)`,
            }}
            className={`absolute inset-0 pointer-events-none transition-opacity duration-300 hidden dark:block ${isHovered ? 'opacity-100' : 'opacity-0'}`}
          />
          {children}
        </div>
      </motion.div>
    </div>
  );
};
