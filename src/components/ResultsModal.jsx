import React from "react";
import { motion } from "framer-motion";
import { Clock, Type, Hash, FileText, Target, Award } from "lucide-react";
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

const progressVariants = {
  hidden: { width: 0 },
  show: {
    width: "var(--progress-width)",
    transition: {
      duration: 1,
      ease: "easeOut",
      delay: 0.5,
    },
  },
};

const ResultsModal = ({
  onClose,
  results,
  completedWords,
  unfinishedWords,
  errors,
  completionTime,
  time,
  currentUser,
  onOpenPrizeWheel,
}) => {
  const attemptNumber = currentUser?.attempts?.length || 0;
  const isFirstAttempt = attemptNumber === 1;
  const isLastAttempt = attemptNumber >= 2;

  // Check if user qualifies for prize wheel
  const qualifiesForPrizeWheel =
    isLastAttempt && currentUser?.attempts?.some((attempt) => attempt.wpm > 40);

  const handleClose = () => {
    // Reset currentUser if attempts exceed 2 or if it's the last attempt and doesn't qualify
    if (attemptNumber > 2 || (isLastAttempt && !qualifiesForPrizeWheel)) {
      localStorage.removeItem("currentUser");
    }
    onClose();
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
        className="bg-gray-800 rounded-lg p-8 max-w-md w-full shadow-xl relative z-10"
      >
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="space-y-6"
        >
          <motion.div variants={itemVariants} className="text-center">
            <h2 className="text-2xl font-bold text-gray-100 mb-2">
              ¡Intento {attemptNumber} Completado!
            </h2>
            <p className="text-gray-400">
              {isFirstAttempt
                ? "Te queda 1 intento más"
                : "Este fue tu último intento"}
            </p>
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

          {results.isAboveAverage && (
            <motion.div
              variants={itemVariants}
              className="flex items-center gap-2 justify-center p-3 bg-yellow-500/10 rounded-lg text-yellow-500"
            >
              <Award className="w-5 h-5" />
              <span>¡Superaste el promedio de 40 PPM!</span>
            </motion.div>
          )}

          {/* Conditional Prize Wheel Button */}
          {qualifiesForPrizeWheel && (
            <motion.div variants={itemVariants} className="space-y-4">
              <motion.div
                variants={itemVariants}
                className="flex items-center gap-2 justify-center p-3 bg-yellow-500/10 rounded-lg text-yellow-500"
              >
                <Award className="w-5 h-5" />
                <span>¡Has desbloqueado la ruleta de premios! 🎉</span>
              </motion.div>

              <motion.button
                variants={itemVariants}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  onClose();
                  onOpenPrizeWheel();
                }}
                className="w-full bg-yellow-500 text-gray-900 py-3 rounded-lg font-medium hover:bg-yellow-400 transition-colors"
              >
                ¡Girar la Ruleta!
              </motion.button>
            </motion.div>
          )}

          {/* Close/Next Button - Modified to use handleClose */}
          {(!isLastAttempt || !qualifiesForPrizeWheel) && (
            <motion.button
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleClose}
              className="w-full bg-yellow-500 text-gray-900 py-3 rounded-lg font-medium hover:bg-yellow-400 transition-colors"
            >
              {isFirstAttempt ? "Siguiente intento" : "Finalizar prueba"}
            </motion.button>
          )}

          {/* Conditional messages */}
          {isFirstAttempt && (
            <motion.p
              variants={itemVariants}
              className="text-center text-sm text-gray-400"
            >
              Tu mejor intento será guardado automáticamente
            </motion.p>
          )}

          {isLastAttempt && !qualifiesForPrizeWheel && (
            <motion.p
              variants={itemVariants}
              className="text-center text-sm text-gray-400"
            >
              Necesitas superar 40 PPM en algún intento para desbloquear la
              ruleta de premios
            </motion.p>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default ResultsModal;
