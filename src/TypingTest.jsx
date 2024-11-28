import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TypingText from "./components/TypingText";
import { getRandomText } from "./data/texts";
import logo from "./assets/logo.png";
import ResultsModal from "./components/ResultsModal";
import { Trophy } from "lucide-react";
import UsernameModal from "./components/UsernameModal";
import PrizeWheel from "./components/PrizeWheel";
import Leaderboard from "./components/Leaderboard";

const TypingTest = () => {
  const [text] = useState(getRandomText());
  const [typed, setTyped] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [time, setTime] = useState(15);
  const [timeLeft, setTimeLeft] = useState(time);
  const inputRef = useRef(null);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState({
    wpm: 0,
    accuracy: 0,
    isAboveAverage: false,
  });
  const [errors, setErrors] = useState(0);
  const [completionTime, setCompletionTime] = useState(null);
  const [unfinishedWords, setUnfinishedWords] = useState(0);
  const [completedWords, setCompletedWords] = useState(0);
  const [isDifficult, setIsDifficult] = useState(false);
  const [isPrizeWheelOpen, setIsPrizeWheelOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("currentUser");
    return saved ? JSON.parse(saved) : null;
  });

  const [leaderboard, setLeaderboard] = useState(() => {
    const saved = localStorage.getItem("leaderboard");
    return saved ? JSON.parse(saved) : [];
  });

  const handleNewUser = (username) => {
    const newUser = {
      username,
      attempts: [],
    };
    localStorage.setItem("currentUser", JSON.stringify(newUser));
    setCurrentUser(newUser);

    // Focus the typing input after username is set
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100); // Small delay to ensure modal is fully closed
  };

  const handleTestComplete = (results) => {
    if (!currentUser) return;

    const newAttempt = {
      wpm: results.wpm,
      accuracy: results.accuracy,
      errors,
      timestamp: Date.now(),
      difficulty: isDifficult ? "hard" : "easy",
    };

    const attemptNumber = currentUser.attempts.length + 1;

    const updatedUser = {
      ...currentUser,
      attempts: [...currentUser.attempts, newAttempt],
    };

    if (
      !updatedUser.bestAttempt ||
      (newAttempt.wpm > updatedUser.bestAttempt.wpm &&
        newAttempt.difficulty === updatedUser.bestAttempt.difficulty)
    ) {
      updatedUser.bestAttempt = newAttempt;
    }

    if (attemptNumber === 2) {
      const newLeaderboard = [
        ...leaderboard,
        {
          username: currentUser.username,
          ...updatedUser.bestAttempt,
          difficulty: updatedUser.bestAttempt.difficulty,
        },
      ]
        .sort((a, b) => {
          if (a.difficulty !== b.difficulty) {
            return a.difficulty === "hard" ? -1 : 1;
          }
          return b.wpm - a.wpm;
        })
        .slice(0, 10);

      localStorage.setItem("leaderboard", JSON.stringify(newLeaderboard));
      setLeaderboard(newLeaderboard);
    }

    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
    setShowResults(true);
  };

  const calculateResults = () => {
    if (showResults) return;

    const timeInMinutes = (time - timeLeft) / 60;

    // Split words and filter empty strings
    const originalWords = text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);

    const typedWords = typed
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);

    let correctWords = 0;
    let incorrectWords = 0;
    let totalKeystrokes = typed.length;
    let correctKeystrokes = 0;

    // Count correct keystrokes
    for (let i = 0; i < Math.min(typed.length, text.length); i++) {
      if (typed[i] === text[i]) {
        correctKeystrokes++;
      }
    }

    // Improved word comparison logic
    for (let i = 0; i < typedWords.length; i++) {
      if (i < originalWords.length) {
        if (typedWords[i] === originalWords[i]) {
          correctWords++;
        } else {
          incorrectWords++;
        }
      } else {
        incorrectWords++;
      }
    }

    // Add untyped words to incorrect count
    if (originalWords.length > typedWords.length) {
      incorrectWords += originalWords.length - typedWords.length;
    }

    // Calculate WPM based on correct words only
    const wpm = Math.round(correctWords / timeInMinutes);

    // Calculate accuracy based on keystrokes
    const accuracy = Math.round(
      (correctKeystrokes * 100) / Math.max(totalKeystrokes, 1)
    );

    const isAboveAverage = wpm > 40;

    setCompletedWords(correctWords);
    setUnfinishedWords(incorrectWords);

    const newResults = { wpm, accuracy, isAboveAverage };
    setResults(newResults);

    if (currentUser) {
      handleTestComplete(newResults);
    }
  };

  const cursorVariants = {
    blink: {
      opacity: [0.85, 0],
      transition: {
        duration: 0.8,
        ease: "easeInOut",
        repeat: Infinity,
        repeatType: "reverse",
      },
    },
  };

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      const timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (!showResults) {
        calculateResults();
      }
    }
  }, [isActive, timeLeft]);

  const handleKeyDown = (e) => {
    if (showResults) return;

    // Ignore special keys
    if (
      e.key === "Shift" ||
      e.key === "Control" ||
      e.key === "Alt" ||
      e.key === "CapsLock" ||
      e.key === "Meta" ||
      e.key === "ArrowLeft" ||
      e.key === "ArrowRight" ||
      e.key === "ArrowUp" ||
      e.key === "ArrowDown" ||
      e.key === "Enter" ||
      e.key === "Escape" ||
      e.ctrlKey ||
      e.altKey ||
      e.metaKey ||
      (e.key.length > 1 && e.key !== "Backspace") // Allow Backspace but ignore other special keys
    ) {
      return;
    }

    if (!isActive && e.key !== "Tab") {
      setIsActive(true);
    }

    if (e.key === "Backspace") {
      if (currentIndex > 0) {
        setTyped((prev) => prev.slice(0, -1));
        setCurrentIndex((prev) => prev - 1);
        // Only count an error if we're deleting a correct character
        if (typed[typed.length - 1] === text[currentIndex - 1]) {
          setErrors((prev) => prev + 1);
        }
      }
      return;
    }

    if (e.key !== "Tab") {
      // Only allow typing if we haven't reached the end of the text
      if (currentIndex < text.length) {
        setTyped((prev) => prev + e.key);
        setCurrentIndex((prev) => prev + 1);

        if (text[currentIndex] !== e.key) {
          setErrors((prev) => prev + 1);
        }

        if (currentIndex + 1 === text.length) {
          setIsActive(false);
          setCompletionTime(time - timeLeft);
          calculateResults();
        }
      }
    }
  };

  const resetTest = () => {
    setTyped("");
    setCurrentIndex(0);
    setIsActive(false);
    setTimeLeft(time);
    setErrors(0); // Reset errors
    setCompletedWords(0); // Reset completed words
    setUnfinishedWords(0); // Reset unfinished words
    inputRef.current?.focus();
  };

  const colors = {
    upcoming: "#4B5563",
    current: "#EAB308",
    correct: "#22C55E",
    incorrect: "#EF4444",
  };

  const toggleDifficulty = () => {
    setIsDifficult((prev) => !prev);
    resetTest();
  };

  const handlePrizeWon = (prize) => {
    console.log("Won prize:", prize);

    setTimeout(() => {
      setIsPrizeWheelOpen(false);
      localStorage.removeItem("currentUser");
      setCurrentUser(null);
    }, 120000);
  };

  const handleClosePrize = () => {
    setIsPrizeWheelOpen(false);
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
  };

  const handleCloseLeaderboard = () => {
    setIsLeaderboardOpen(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Update the getCurrentDifficulty function to also get the best WPM
  const getCurrentDifficultyAndWPM = () => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (user?.attempts?.length > 0) {
      const lastDifficulty = user.attempts[user.attempts.length - 1].difficulty;

      // Get all attempts for the current difficulty
      const attemptsForDifficulty = user.attempts.filter(
        (attempt) => attempt.difficulty === lastDifficulty
      );

      // Get the best WPM for this difficulty
      const bestWPM = Math.max(
        ...attemptsForDifficulty.map((attempt) => attempt.wpm)
      );

      return {
        difficulty: lastDifficulty,
        wpm: bestWPM,
      };
    }
    return { difficulty: "easy", wpm: 0 }; // default fallback
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 p-6">
      {!currentUser && <UsernameModal onSubmit={handleNewUser} />}

      {currentUser && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="text-center mb-4 relative"
        >
          <motion.div
            className="bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-lg px-6 py-2 inline-flex items-center gap-4"
            initial={{ scale: 0.95 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1, duration: 0.2 }}
          >
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="flex items-center gap-2"
            >
              <span className="text-gray-400">Usuario:</span>
              <span className="text-yellow-500 font-medium">
                {currentUser.username}
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2"
            >
              <span className="text-gray-400">Intentos:</span>
              <div className="flex items-center gap-1">
                {[1, 2].map((attempt) => (
                  <motion.div
                    key={attempt}
                    className={`w-2 h-2 rounded-full ${
                      currentUser.attempts.length >= attempt
                        ? "bg-yellow-500"
                        : "bg-gray-600"
                    }`}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{
                      delay: 0.3 + attempt * 0.1,
                      type: "spring",
                      stiffness: 500,
                      damping: 30,
                    }}
                  />
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="flex items-center gap-2"
            >
              <span className="text-gray-400">Dificultad:</span>
              <motion.span
                className={isDifficult ? "text-yellow-500" : "text-gray-300"}
                animate={{
                  opacity: [1, 0.5, 1],
                  y: [0, -5, 0],
                }}
                transition={{
                  duration: 0.3,
                  times: [0, 0.5, 1],
                }}
                key={isDifficult ? "difficult" : "easy"}
              >
                {isDifficult ? "Difícil" : "Fácil"}
              </motion.span>
            </motion.div>
          </motion.div>
        </motion.div>
      )}

      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8 select-none">
          <div className="flex items-center space-x-2">
            <img src={logo} className="h-24 w-auto" alt="Logo" />
          </div>

          <div className="flex items-center gap-6">
            {/* Difficulty Switch */}
            <div className="flex flex-col items-center gap-1">
              <motion.button
                onClick={toggleDifficulty}
                className={`relative h-7 w-[90px] rounded-full bg-gray-700/50 p-1 transition-colors ${
                  isActive ? "opacity-50 cursor-not-allowed" : ""
                }`}
                animate={{
                  backgroundColor: isDifficult
                    ? "rgb(234 179 8 / 0.2)"
                    : "rgb(55 65 81 / 0.5)",
                }}
                transition={{ duration: 0.3 }}
                disabled={isActive} // Disable button when test is active
              >
                <motion.div
                  className="absolute top-1 left-1 w-5 h-5 rounded-full bg-yellow-500"
                  animate={{
                    x: isDifficult ? 62 : 0,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                  }}
                />
              </motion.button>

              <div className="flex justify-between w-[90px] text-[11px] font-medium">
                <span
                  className={`transition-colors ${
                    !isDifficult ? "text-gray-300" : "text-gray-500"
                  }`}
                >
                  Fácil
                </span>
                <span
                  className={`transition-colors ${
                    isDifficult ? "text-yellow-500" : "text-gray-500"
                  }`}
                >
                  Difícil
                </span>
              </div>
            </div>

            {/* Leaderboard Button */}
            <motion.button
              onClick={() => setIsLeaderboardOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center justify-center w-10 h-10 rounded-lg bg-gray-700/50 text-gray-300 hover:text-yellow-500 transition-colors ${
                isActive ? "opacity-50 cursor-not-allowed" : ""
              }`}
              transition={{ duration: 0.3 }}
              disabled={isActive} // Disable button when test is active
            >
              <Trophy className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        <div className="text-center mb-8 select-none cursor-default">
          <span className="text-2xl font-mono">{timeLeft}s</span>
        </div>

        <div className="relative mb-8 max-w-[51rem] mx-auto select-none cursor-default text-balance text-left">
          <input
            ref={inputRef}
            type="text"
            className="opacity-0 absolute inset-0 cursor-default"
            onKeyDown={handleKeyDown}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck="false"
            autoFocus
          />
          <TypingText
            text={text}
            typed={typed}
            currentIndex={currentIndex}
            colors={colors}
            cursorVariants={cursorVariants}
            showGradient={!showResults}
          />
        </div>

        <div className="text-center mt-[300px] text-sm text-gray-700">
          <p>
            Este juego es de acceso libre y gratuito. No requiere pago para
            participar.
          </p>
        </div>

        <AnimatePresence>
          {showResults && (
            <ResultsModal
              onClose={() => {
                setShowResults(false);
                resetTest();
              }}
              results={results}
              completedWords={completedWords}
              unfinishedWords={unfinishedWords}
              errors={errors}
              completionTime={completionTime}
              time={time}
              currentUser={currentUser}
              onOpenPrizeWheel={() => setIsPrizeWheelOpen(true)}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isPrizeWheelOpen && (
            <PrizeWheel
              isOpen={isPrizeWheelOpen}
              onClose={handleClosePrize}
              onPrizeWon={handlePrizeWon}
              {...getCurrentDifficultyAndWPM()} // Spread both difficulty and wpm
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {isLeaderboardOpen && (
            <Leaderboard
              isOpen={isLeaderboardOpen}
              onClose={handleCloseLeaderboard}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TypingTest;
