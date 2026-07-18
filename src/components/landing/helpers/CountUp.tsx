import React, { useState, useEffect, useRef } from 'react';

export const CountUp: React.FC<{ value: number, prefix?: string, animateOnUpdate?: boolean }> = ({ value, prefix = "₹", animateOnUpdate = false }) => {
  const [displayVal, setDisplayVal] = useState(0);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (!animateOnUpdate && displayVal !== 0 && prevValueRef.current !== value) {
      setDisplayVal(value);
      prevValueRef.current = value;
      return;
    }

    const end = value;
    const duration = 600;
    const steps = 30;
    const stepTime = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const currentVal = Math.floor(end * progress);
      if (currentStep >= steps) {
        clearInterval(timer);
        setDisplayVal(end);
      } else {
        setDisplayVal(currentVal);
      }
    }, stepTime);

    prevValueRef.current = value;
    return () => clearInterval(timer);
  }, [value, animateOnUpdate]);

  return <span>{prefix}{displayVal.toLocaleString('en-IN')}</span>;
};
