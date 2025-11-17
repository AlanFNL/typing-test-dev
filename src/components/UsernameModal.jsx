import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Github, User } from "lucide-react";
import qr from "../assets/frame.png";
import openSound from "../assets/start.mp3";

const UsernameModal = ({ onSubmit, leaderboard = [] }) => {
  const [username, setUsername] = useState("");
  const [difficulty, setDifficulty] = useState("easy");
  const inputRef = useRef(null);

  useEffect(() => {
    const audio = new Audio(openSound);
    const timeoutId = setTimeout(() => {
      audio.play();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);

    return () => clearTimeout(timeoutId);
  }, []);

  const handleSubmit = () => {
    onSubmit(username, difficulty);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 username-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div
        className="bg-gray-800/95 p-8 rounded-xl w-full max-w-5xl backdrop-blur-sm border border-gray-700/50"
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
          className="grid gap-8 lg:grid-cols-[1.1fr_minmax(14rem,0.9fr)] items-start"
        >
          <div className="flex flex-col items-center text-center min-h-[32rem]">
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
              Ingresa tu apodo tendrás 2 intentos para lograr tu mejor resultado
            </p>

            <div className="w-full space-y-4 flex-1 flex flex-col">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="relative"
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-gray-700/50 p-3 pl-4 rounded-lg border border-gray-600/50 focus:border-yellow-500/50 focus:ring-2 focus:ring-yellow-500/20 transition-all outline-none"
                  placeholder="Ingresa tu apodo"
                  maxLength={15}
                  autoFocus
                />
                <div className="absolute right-3 top-3 text-xs text-gray-500">
                  {username.length}/15
                </div>
              </motion.div>

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
              <div className="mt-auto w-full">
                <div className="h-px w-full bg-gray-700/60 mb-4" />
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-left">
                  <div className="flex items-center gap-2 text-gray-400 text-xs  tracking-wide">
                    <span className="text-gray-500">Desarrollado por</span>
                    <span className="flex items-center gap-1 text-gray-200 text-sm font-semibold">
                      <Github className="w-4 h-4" />
                      AlanFNL
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-gray-400 text-xs">
                    <div className="text-right leading-tight">
                      <p className="font-medium text-gray-200">Escaneá el QR</p>
                      <p className="text-[11px] opacity-70">
                        Te lleva a mi GitHub
                      </p>
                    </div>
                    <div className="p-1 rounded-lg border border-gray-600/60 bg-gray-900/60">
                      <img
                        src={qr}
                        alt="QR hacia GitHub"
                        className="w-16 h-16 rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full  rounded-xl p-5 text-left">
            <p className="text-sm uppercase tracking-wider text-gray-400 mb-2">
              Tabla actual
            </p>
            <h3 className="text-xl font-semibold text-gray-100 mb-4">
              Mejores marcas del día
            </h3>
            {leaderboard.length === 0 ? (
              <p className="text-gray-500 text-sm">
                Aún no hay participantes en el ranking. ¡Podés ser el primero!
              </p>
            ) : (
              <ul className="space-y-3 max-h-[500px] overflow-y-auto scrollbar-slim">
                {leaderboard.slice(0, 10).map((entry, index) => (
                  <li
                    key={`${entry.username}-${index}`}
                    className="flex items-center justify-between rounded-lg bg-gray-800/70 px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold text-gray-500">
                        #{index + 1}
                      </span>
                      <div>
                        <p className="text-gray-100 font-medium leading-none">
                          {entry.username}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-yellow-400 font-bold">
                        {entry.wpm} PPM
                      </p>
                      <p className="text-[11px] text-gray-500">
                        Precisión {entry.accuracy}%
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default UsernameModal;
