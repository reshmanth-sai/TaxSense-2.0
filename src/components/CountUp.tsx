import React, { useState, useEffect } from 'react';

interface CountUpProps {
  end: number;
  duration?: number;
  formatter?: (val: number) => string;
}

export default function CountUp({ end, duration = 1000, formatter = (val) => val.toString() }: CountUpProps) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      // Ease Out Quad
      const easeProgress = progress * (2 - progress);
      const current = Math.floor(easeProgress * end);
      
      setCount(current);
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [end, duration]);

  return <>{formatter(count)}</>;
}
