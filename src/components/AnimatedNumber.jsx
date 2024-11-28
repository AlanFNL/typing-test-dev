import React, { useState, useEffect } from "react";

export const AnimatedNumber = ({ value, unit = "", className = "" }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 1000;
    const steps = 60;
    const stepDuration = duration / steps;
    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(value * easeProgress));

      if (currentStep >= steps) {
        clearInterval(timer);
        setDisplayValue(value);
      }
    }, stepDuration);

    return () => clearInterval(timer);
  }, [value]);

  return (
    <div className={`flex items-baseline gap-1 ${className}`}>
      <span className="text-2xl font-bold text-gray-100">{displayValue}</span>
      {unit && <span className="text-sm text-gray-400">{unit}</span>}
    </div>
  );
};
