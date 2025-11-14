import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Clock, Hash, FileText, Target, Award, Crown } from "lucide-react";
import { AnimatedNumber } from "./AnimatedNumber";
import { Confetti } from "./Confetti";

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

const ResultsModal = ({
  onNextAttempt,
  onSessionEnd,
  results,
  completedWords,
  unfinishedWords,
  errors,
  completionTime,
  time,
  onOpenPrizeWheel,
  attemptNumber,
  maxAttempts,
  qualifiesForPrizeWheel,
  topTenPlacement,
  leaderboard = [],
  highlightUsername,
  averageWPM,
}) => {
  const attemptsRemaining = Math.max(maxAttempts - attemptNumber, 0);
  const canRetry = attemptsRemaining > 0 && !qualifiesForPrizeWheel;
  const showLeaderboard = Boolean(topTenPlacement && leaderboard.length);
  const highlightRef = useRef(null);

  useEffect(() => {
    if (topTenPlacement && highlightRef.current) {
      highlightRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [topTenPlacement]);

  const headerMessage = qualifiesForPrizeWheel
    ? "¡Ya desbloqueaste la ruleta de premios!"
    : canRetry
    ? attemptsRemaining === 1
      ? "Te queda 1 intento más"
      : `Te quedan ${attemptsRemaining} intentos más`
    : "Este fue tu último intento";

  const handlePrimaryAction = () => {
    if (canRetry) {
      onNextAttempt();
    } else {
      onSessionEnd();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
    >
      <Confetti />
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className={`bg-gray-800 rounded-lg p-8 w-full shadow-xl relative z-10 ${
          showLeaderboard ? "max-w-5xl" : "max-w-md"
        }`}
      >
        <div
          className={
            showLeaderboard
              ? "grid gap-8 lg:grid-cols-[1.15fr_minmax(16rem,0.85fr)]"
              : ""
          }
        >
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="space-y-6"
          >
            <motion.div variants={itemVariants} className="text-center">
              <h2 className="text-2xl font-bold text-gray-100 mb-2">
                ¡Se acabó el tiempo!
              </h2>
              <p className="text-gray-400">{headerMessage}</p>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
              variants={itemVariants}
              className="grid grid-cols-2 gap-4"
            >
              {/* WPM Card */}
              <motion.div
                variants={itemVariants}
                className="bg-gray-700/50 p-4 rounded-lg"
              >
                <div className="flex items-center gap-2 text-yellow-500 mb-2">
                  <Hash className="w-4 h-4" />
                  <span className="text-sm font-medium">PPM</span>
                </div>
                <AnimatedNumber value={results.wpm} unit="palabras/min" />
              </motion.div>

              {/* Accuracy Card */}
              <motion.div
                variants={itemVariants}
                className="bg-gray-700/50 p-4 rounded-lg"
              >
                <div className="flex items-center gap-2 text-green-500 mb-2">
                  <Target className="w-4 h-4" />
                  <span className="text-sm font-medium">Precisión</span>
                </div>
                <AnimatedNumber value={results.accuracy} unit="%" />
              </motion.div>

              {/* Errors Card */}
              <motion.div
                variants={itemVariants}
                className="bg-gray-700/50 p-4 rounded-lg"
              >
                <div className="flex items-center gap-2 text-red-500 mb-2">
                  <FileText className="w-4 h-4" />
                  <span className="text-sm font-medium">Errores</span>
                </div>
                <AnimatedNumber value={errors} />
              </motion.div>

              {/* Time Card */}
              <motion.div
                variants={itemVariants}
                className="bg-gray-700/50 p-4 rounded-lg"
              >
                <div className="flex items-center gap-2 text-blue-500 mb-2">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm font-medium">Tiempo</span>
                </div>
                <AnimatedNumber value={completionTime || time} unit="seg" />
              </motion.div>
            </motion.div>

            {topTenPlacement && (
              <motion.div
                variants={itemVariants}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-xl border border-yellow-500/40 bg-yellow-500/10 text-left shadow-[0_0_25px_rgba(234,179,8,0.15)]"
              >
                <div className="flex items-center gap-3 text-yellow-400 ">
                  <motion.div className="bg-yellow-500/20 p-2 rounded-full">
                    <Crown className="w-5 h-5" />
                  </motion.div>
                  <div>
                    <p className="font-semibold text-gray-50">
                      ¡Entraste al Top 10 del ranking!
                    </p>
                    <p className="text-sm text-gray-200">
                      Tu marca quedó en el puesto #{topTenPlacement}.
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Conditional Prize Wheel Button */}
            {qualifiesForPrizeWheel && (
              <motion.div variants={itemVariants} className="space-y-4">
                <motion.div
                  variants={itemVariants}
                  className="flex items-center gap-2 justify-center p-3 bg-yellow-500/10 rounded-lg text-yellow-500"
                >
                  <span>
                    🎉 ¡Superaste el promedio de 40 PPM y desbloqueaste la
                    ruleta de premios! recorda que podes ganar premios una vez
                    por dia.
                  </span>
                </motion.div>

                <motion.button
                  variants={itemVariants}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={onOpenPrizeWheel}
                  className="w-full bg-yellow-500 text-gray-900 py-3 rounded-lg font-medium hover:bg-yellow-400 transition-colors"
                >
                  ¡Girar la Ruleta!
                </motion.button>
              </motion.div>
            )}

            {(!qualifiesForPrizeWheel || canRetry) && (
              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handlePrimaryAction}
                className="w-full bg-yellow-500 text-gray-900 py-3 rounded-lg font-medium hover:bg-yellow-400 transition-colors"
              >
                {canRetry ? "Siguiente intento" : "Finalizar prueba"}
              </motion.button>
            )}

            {/* Conditional messages */}
            {canRetry && (
              <motion.p
                variants={itemVariants}
                className="text-center text-sm text-gray-400"
              >
                Tu mejor intento será guardado automáticamente
              </motion.p>
            )}

            {!qualifiesForPrizeWheel && !canRetry && (
              <motion.p
                variants={itemVariants}
                className="text-center text-sm text-gray-400"
              >
                Necesitas Hacer 41 PPM en algún intento para desbloquear la
                ruleta de premios
              </motion.p>
            )}
          </motion.div>

          {showLeaderboard && (
            <div className="b rounded-xl p-5 text-left flex flex-col">
              <div className="mb-4">
                <p className="text-sm uppercase tracking-wider text-gray-400">
                  Ranking actualizado
                </p>
                <h3 className="text-xl font-semibold text-gray-100">
                  Top 10 del día
                </h3>
              </div>
              <div
                className="space-y-3 overflow-y-auto pr-1"
                style={{ maxHeight: "24rem" }}
              >
                {leaderboard.map((entry, index) => {
                  const isPlayer = entry.username === highlightUsername;
                  return (
                    <div
                      key={`${entry.username}-${index}`}
                      ref={isPlayer ? highlightRef : null}
                      className={`relative rounded-lg px-4 py-3 bg-gray-800/70 border ${
                        isPlayer
                          ? "border-yellow-500/60 shadow-[0_0_20px_rgba(234,179,8,0.25)]"
                          : "border-gray-700/40"
                      }`}
                    >
                      {isPlayer && (
                        <motion.div
                          className="absolute inset-0 rounded-lg pointer-events-none"
                          style={{
                            background:
                              "linear-gradient(120deg, rgba(250,204,21,0.15), rgba(17,24,39,0), rgba(250,204,21,0.15))",
                          }}
                          animate={{
                            backgroundPosition: [
                              "0% 50%",
                              "100% 50%",
                              "0% 50%",
                            ],
                            opacity: [0.6, 0.9, 0.6],
                          }}
                          transition={{
                            duration: 2.5,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                        />
                      )}
                      <div className="flex items-center justify-between relative">
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
                          {typeof entry.accuracy === "number" && (
                            <p className="text-[11px] text-gray-500">
                              Precisión {entry.accuracy}%
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ResultsModal;
