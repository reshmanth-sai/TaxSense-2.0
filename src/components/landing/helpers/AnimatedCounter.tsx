import React, { useState, useEffect } from 'react';

interface AnimatedCounterProps {
  value: number;
  prefix?: string;
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({ value, prefix = "" }) => {
  const [displayValue, setDisplayValue] = useState(value);

  useEffect(() => {
    let start = displayValue;
    const end = value;
    if (start === end) return;

    const duration = 400; // ms
    const startTime = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);

      const ease = progress * (2 - progress); // EaseOutQuad
      const current = Math.round(start + (end - start) * ease);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <span>{prefix}{displayValue.toLocaleString('en-IN')}</span>;
};
