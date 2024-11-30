import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import easy from "../assets/easy.png";
import hard from "../assets/hard.png";
import openSound from "../assets/start.mp3";

const UsernameModal = ({ onSubmit }) => {
  const [username, setUsername] = useState("");
  const [difficulty, setDifficulty] = useState("easy");

  const handleSubmit = () => {
    onSubmit(username, difficulty);
  };

  useEffect(() => {
    const audio = new Audio(openSound);
    const timeoutId = setTimeout(() => {
      audio.play();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="bg-gray-800/95 p-8 rounded-xl w-full max-w-lg backdrop-blur-sm border border-gray-700/50"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{
          type: "spring",
          duration: 0.5,
          bounce: 0.3,
        }}
      >
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex flex-col items-center text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{
              type: "spring",
              delay: 0.3,
              duration: 0.7,
              bounce: 0.4,
            }}
            className="bg-yellow-500/20 p-4 rounded-full mb-6"
          >
            <User className="w-8 h-8 text-yellow-500" />
          </motion.div>

          <h2 className="text-2xl font-bold mb-2">¡Bienvenido!</h2>
          <p className="text-gray-400 mb-6 text-sm">
            Ingresa tu apodo y una dificultad, tendrás 2 intentos para lograr tu
            mejor resultado
          </p>

          <div className="w-full space-y-4">
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="relative"
            >
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-700/50 p-3 pl-4 rounded-lg border border-gray-600/50 focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all outline-none"
                placeholder="Ingresa tu apodo"
                maxLength={15}
              />
              <div className="absolute right-3 top-3 text-xs text-gray-500">
                {username.length}/15
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="flex justify-center space-x-52 my-8"
            >
              <div className="flex flex-col items-center space-y-2">
                <span className="text-sm font-medium text-gray-300">Fácil</span>
                <div
                  className={`w-6 h-6 border-2 rounded cursor-pointer transition-all ${
                    difficulty === "easy"
                      ? "border-yellow-500 bg-yellow-500/20"
                      : "border-gray-600"
                  }`}
                  onClick={() => setDifficulty("easy")}
                >
                  {difficulty === "easy" && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-full h-full flex items-center justify-center"
                    >
                      ✓
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="flex flex-col items-center space-y-2">
                <span className="text-sm font-medium text-gray-300">
                  Difícil
                </span>
                <div
                  className={`w-6 h-6 border-2 rounded cursor-pointer transition-all ${
                    difficulty === "hard"
                      ? "border-yellow-500 bg-yellow-500/20"
                      : "border-gray-600"
                  }`}
                  onClick={() => setDifficulty("hard")}
                >
                  {difficulty === "hard" && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="w-full h-full flex items-center justify-center"
                    >
                      ✓
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>

            <div className="h-32 flex items-center gap-4 justify-center">
              <img
                src={easy}
                alt="Difficulty illustration"
                className="max-h-24 w-auto"
              />

              <img
                src={hard}
                alt="Difficulty illustration"
                className="max-h-24 w-auto"
              />
            </div>

            <motion.button
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              disabled={!username.trim()}
              className="w-full bg-yellow-500 text-gray-900 p-3 rounded-lg font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:bg-yellow-400 active:bg-yellow-600"
            >
              Comenzar prueba
            </motion.button>
            <p className="text-gray-400 text-sm">
              Este juego es de acceso libre y gratuito. No requiere pago para
              participar.
            </p>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default UsernameModal;
