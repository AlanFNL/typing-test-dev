import React from "react";
import { motion } from "framer-motion";

export const Confetti = () => {
  const generateConfetti = () => {
    return [...Array(50)].map((_, i) => ({
      id: i,
      x: Math.random() * 100 + "%",
      size: Math.random() * 8 + 4,
      color: [
        "bg-yellow-500",
        "bg-green-500",
        "bg-blue-500",
        "bg-red-500",
        "bg-purple-500",
      ][Math.floor(Math.random() * 5)],
    }));
  };

  return (
    <div className="absolute inset-0 pointer-events-none">
      {generateConfetti().map(({ id, x, size, color }) => (
        <motion.div
          key={id}
          initial={{
            opacity: 1,
            top: -20,
            left: x,
            width: size,
            height: size,
            rotate: 0,
          }}
          animate={{
            opacity: 0,
            top: "100vh",
            rotate: 360,
          }}
          transition={{
            duration: Math.random() * 2 + 1,
            ease: "linear",
            delay: Math.random() * 0.5,
          }}
          className={`absolute rounded-full ${color}`}
        />
      ))}
    </div>
  );
};
