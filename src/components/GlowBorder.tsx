import React from 'react';
import { motion } from 'motion/react';
import { Check } from 'lucide-react';

interface GlowBorderProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  state?: 'idle' | 'processing' | 'success' | 'recommendation';
  intensity?: 'default' | 'low' | 'none';
  borderRadius?: '12px' | '20px' | '24px';
  interactive?: boolean;
  glowOnHover?: boolean; // If true, only glows on mouse hover
  showCheckmark?: boolean;
  onClick?: () => void;
}

export const GlowBorder: React.FC<GlowBorderProps> = ({
  children,
  className = '',
  style,
  state = 'idle',
  intensity = 'default',
  borderRadius = '24px',
  interactive = false,
  glowOnHover = false,
  showCheckmark = true,
  onClick
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  // Determine border radius classes
  const outerRadiusClass = 
    borderRadius === '24px' ? 'rounded-[24px]' : 
    borderRadius === '20px' ? 'rounded-[20px]' : 
    'rounded-[12px]';
    
  const innerRadiusStyle = 
    borderRadius === '24px' ? { borderRadius: '22.5px' } : 
    borderRadius === '20px' ? { borderRadius: '18.5px' } : 
    { borderRadius: '10.5px' };

  // Calculate base opacities based on intensity level and hover state
  const getOpacityMultiplier = () => {
    if (intensity === 'none') return 0;
    
    let mult = intensity === 'low' ? 0.4 : 1.0;
    
    if (glowOnHover) {
      return isHovered ? mult : 0;
    }
    
    return mult;
  };

  const opacityMultiplier = getOpacityMultiplier();

  // Base opacity settings for the border and glow layers
  const getOpacities = () => {
    // If glowOnHover is active and we are not hovered, force opacities to 0
    if (glowOnHover && !isHovered) {
      return { border: 0, glow: 0 };
    }

    switch (state) {
      case 'processing':
        return { border: 0.35 * opacityMultiplier, glow: 0.28 * opacityMultiplier };
      case 'success':
        return { border: 0.25 * opacityMultiplier, glow: 0.15 * opacityMultiplier };
      case 'recommendation':
        return { border: 0.4 * opacityMultiplier, glow: 0.24 * opacityMultiplier };
      case 'idle':
      default:
        return { border: 0.15 * opacityMultiplier, glow: 0.08 * opacityMultiplier };
    }
  };


  const opacities = getOpacities();
  const isAnimated = state === 'processing' || state === 'recommendation';

  // Interactive hover animations
  const hoverAnimation = interactive
    ? {
        whileHover: { scale: 1.01, transition: { duration: 0.25, ease: 'easeOut' as const } },
        whileTap: { scale: 0.995 }
      }
    : {};

  // Success one-time pulse keyframes
  const successPulseAnimation = state === 'success' 
    ? {
        scale: [1, 1.05, 1],
        opacity: [opacities.glow, 0.7 * opacityMultiplier, opacities.glow],
        transition: { duration: 0.8, ease: 'easeInOut' as const }
      }
    : {
        opacity: opacities.glow
      };

  return (
    <motion.div
      {...hoverAnimation}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      style={style}
      className={`relative p-[1.5px] overflow-hidden ${outerRadiusClass} ${onClick ? 'cursor-pointer' : ''} ${className} group/glow transition-all duration-300`}
    >
      {/* 1. Outer Glow Layer (Blurred rotating gradient) */}
      <motion.div
        animate={successPulseAnimation}
        className={`absolute inset-[-50%] bg-[conic-gradient(from_0deg,#3B82F6,#22D3EE,#8B5CF6,#3B82F6)] pointer-events-none filter blur-2xl md:blur-3xl transition-opacity duration-300 ${
          isAnimated ? 'animate-rotate-glow' : ''
        } ${state === 'processing' ? 'animate-pulse-glow-slow' : ''}`}
        style={{
          opacity: opacities.glow,
          transformOrigin: 'center center'
        }}
      />

      {/* 2. Border Mask Container (Sharp rotating border line) */}
      <div className={`absolute inset-0 overflow-hidden ${outerRadiusClass} pointer-events-none`}>
        <div
          className={`absolute inset-[-50%] bg-[conic-gradient(from_0deg,#3B82F6,#22D3EE,#8B5CF6,#3B82F6)] pointer-events-none transition-opacity duration-300 ${
            isAnimated ? 'animate-rotate-glow' : ''
          }`}
          style={{
            opacity: opacities.border,
            transformOrigin: 'center center'
          }}
        />
      </div>

      {/* 3. Glassmorphic Card Cover (Hides center, provides premium UI texture) */}
      <div
        className="absolute inset-[1.5px] bg-[#070b13]/90 backdrop-blur-[16px] pointer-events-none shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)]"
        style={innerRadiusStyle}
      />

      {/* 4. Subtle local noise texture overlay */}
      <div 
        className="absolute inset-[1.5px] opacity-[0.015] pointer-events-none mix-blend-overlay bg-[url('data:image/svg+xml,%3Csvg%20viewBox%3D%270%200%20200%20200%27%20xmlns%3D%27http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%27%3E%3Cfilter%20id%3D%27noiseFilter%27%3E%3CfeTurbulence%20type%3D%27fractalNoise%27%20baseFrequency%3D%270.8%27%20numOctaves%3D%273%27%20stitchTiles%3D%27stitch%27%2F%3E%3C%2Ffilter%3E%3Crect%20width%3D%27100%25%27%20height%3D%27100%25%27%20filter%3D%27url%28%23noiseFilter%29%27%2F%3E%3C%2Fsvg%3E')]" 
        style={innerRadiusStyle}
      />

      {/* 5. Success Checkmark Overlay */}
      {state === 'success' && showCheckmark && (
        <motion.div 
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.4 }}
          className="absolute top-4 right-4 z-20 flex items-center justify-center w-5.5 h-5.5 bg-emerald-500 text-slate-950 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.3)]"
        >
          <Check className="w-3.5 h-3.5 stroke-[3]" />
        </motion.div>
      )}

      {/* 6. Card Inner Content */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </motion.div>
  );
};
