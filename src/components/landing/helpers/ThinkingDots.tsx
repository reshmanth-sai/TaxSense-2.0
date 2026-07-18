import React, { useState, useEffect } from 'react';

export const ThinkingDots: React.FC = () => {
  const [dots, setDots] = useState("");
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => (prev.length >= 3 ? "" : prev + "."));
    }, 300);
    return () => clearInterval(interval);
  }, []);
  return <span className="inline-block w-6 text-left">{dots}</span>;
};
