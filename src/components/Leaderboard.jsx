import React, { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Crown, Medal, Award } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 },
};

const TabButton = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`
      flex-1 py-2 px-4 text-sm font-medium rounded-lg transition-colors
      ${
        active
          ? "bg-yellow-500/20 text-yellow-500"
          : "text-gray-400 hover:text-gray-300 hover:bg-white/5"
      }
    `}
  >
    {children}
  </button>
);

const sortEntries = (entries = []) =>
  [...entries].sort((a, b) => {
    if (b.wpm !== a.wpm) return b.wpm - a.wpm;
    const aAcc = typeof a.accuracy === "number" ? a.accuracy : 0;
    const bAcc = typeof b.accuracy === "number" ? b.accuracy : 0;
    if (bAcc !== aAcc) return bAcc - aAcc;
    return (a.timestamp || 0) - (b.timestamp || 0);
  });

const Leaderboard = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("all");
  const allLeaderboard = useMemo(
    () => sortEntries(JSON.parse(localStorage.getItem("leaderboard") || "[]")),
    []
  );

  // Filter leaderboard based on active tab
  const filteredLeaderboard = useMemo(() => {
    const filtered = allLeaderboard.filter((entry) => {
      if (activeTab === "easy") return entry.difficulty === "easy";
      if (activeTab === "hard") return entry.difficulty === "hard";
      return true;
    });
    return sortEntries(filtered);
  }, [allLeaderboard, activeTab]);

  const getRankIcon = (index) => {
    switch (index) {
      case 0:
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 1:
        return <Medal className="w-5 h-5 text-gray-300" />;
      case 2:
        return <Medal className="w-5 h-5 text-amber-600" />;
      default:
        return <Trophy className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-800/90 backdrop-blur-md rounded-xl p-8 relative z-10 w-full max-w-md shadow-2xl"
          >
            {/* Header Section - Fixed Height */}
            <div className="h-[100px]">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              <h2 className="text-2xl font-bold text-center text-white mb-6">
                🏆 Tabla de Clasificación
              </h2>
            </div>

            {/* Content Section - Fixed Height */}
            <div className="h-[400px] mt-6">
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="show"
                className="h-full overflow-y-auto pr-2 scrollbar-slim"
              >
                <div className="space-y-3">
                  {filteredLeaderboard.length === 0 ? (
                    <motion.div
                      variants={itemVariants}
                      className="flex items-center justify-center h-full text-center text-gray-400"
                    >
                      <p>
                        No hay puntuaciones registradas para{" "}
                        {activeTab === "easy"
                          ? "modo fácil"
                          : activeTab === "hard"
                          ? "modo difícil"
                          : "ningún modo"}
                      </p>
                    </motion.div>
                  ) : (
                    filteredLeaderboard.map((entry, index) => (
                      <motion.div
                        key={`${entry.username}-${index}`}
                        variants={itemVariants}
                        className={`
                          relative flex items-center gap-4 p-4 rounded-lg
                          ${
                            index === 0
                              ? "bg-yellow-500/10 border border-yellow-500/20"
                              : "bg-gray-700/50"
                          }
                        `}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <span className="flex items-center justify-center w-8">
                            {getRankIcon(index)}
                          </span>
                          <div>
                            <p
                              className={`font-medium ${
                                index === 0
                                  ? "text-yellow-500"
                                  : "text-gray-200"
                              }`}
                            >
                              {entry.username}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p
                            className={`font-bold ${
                              index === 0 ? "text-yellow-500" : "text-gray-200"
                            }`}
                          >
                            {entry.wpm} PPM
                          </p>
                          <p className="text-sm text-gray-400">
                            {entry.accuracy}% precisión
                          </p>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </motion.div>
            </div>

            {/* Footer Section - Fixed Height */}
            <div className="h-[50px] flex items-center justify-center">
              <motion.p
                variants={itemVariants}
                className="text-center text-sm text-gray-400"
              >
                Mostrando {filteredLeaderboard.length} resultados
              </motion.p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Leaderboard;
