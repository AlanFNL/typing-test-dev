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

const DebugPanel = ({ debugEvents, currentIndex, typed, text, errors }) => {
  return (
    <div className="fixed left-4 top-4 bg-gray-800/90 p-4 rounded-lg border border-gray-700/50 w-96 backdrop-blur-sm z-50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-sm font-mono text-yellow-500">Debug Panel</h3>
        <div className="flex gap-2">
          <span className="text-xs bg-green-900/30 px-2 py-1 rounded">
            Correct
          </span>
          <span className="text-xs bg-red-900/30 px-2 py-1 rounded">
            Incorrect
          </span>
        </div>
      </div>

      {/* Stats Section */}
      <div className="grid grid-cols-3 gap-2 mb-4 bg-gray-700/30 p-2 rounded">
        <div className="text-xs">
          <div className="text-gray-400">Index</div>
          <div className="font-mono">{currentIndex}</div>
        </div>
        <div className="text-xs">
          <div className="text-gray-400">Typed</div>
          <div className="font-mono">{typed.length}</div>
        </div>
        <div className="text-xs">
          <div className="text-gray-400">Errors</div>
          <div className="font-mono">{errors}</div>
        </div>
      </div>

      {/* Current Text Section */}
      <div className="mb-4 p-2 bg-gray-700/30 rounded">
        <div className="text-xs text-gray-400 mb-1">Current Text Position</div>
        <div className="font-mono text-xs break-all">
          <span className="text-gray-400">
            {text.slice(Math.max(0, currentIndex - 10), currentIndex)}
          </span>
          <span className="text-yellow-500 bg-yellow-500/20 px-1">
            {text[currentIndex] || " "}
          </span>
          <span className="text-gray-400">
            {text.slice(currentIndex + 1, currentIndex + 10)}
          </span>
        </div>
      </div>

      {/* Keystrokes Section */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        <div className="text-xs text-gray-400 mb-1">Last Keystrokes</div>
        {debugEvents.map((event, index) => (
          <div
            key={index}
            className={`text-xs font-mono p-2 rounded flex items-center justify-between ${
              event.isCorrect ? "bg-green-900/30" : "bg-red-900/30"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="bg-gray-700/50 px-2 py-1 rounded">
                {event.key === " " ? "␣" : event.key}
              </span>
              <span className="text-gray-400">→</span>
              <span className="bg-gray-700/50 px-2 py-1 rounded">
                {event.expectedChar === " " ? "␣" : event.expectedChar}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

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
  const [difficulty, setDifficulty] = useState("easy");
  const [isPrizeWheelOpen, setIsPrizeWheelOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [requestModal, setRequestModal] = useState(false);
  const [debugEvents, setDebugEvents] = useState([]);
  const maxDebugEvents = 10;

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("currentUser");
    return saved ? JSON.parse(saved) : null;
  });

  const [leaderboard, setLeaderboard] = useState(() => {
    const saved = localStorage.getItem("leaderboard");
    return saved ? JSON.parse(saved) : [];
  });

  const shouldAllowFocus = useRef(true);

  const handleNewUser = (username, selectedDifficulty) => {
    const newUser = {
      username,
      attempts: [],
    };
    localStorage.setItem("currentUser", JSON.stringify(newUser));
    setCurrentUser(newUser);
    setDifficulty(selectedDifficulty);
    shouldAllowFocus.current = true;

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleTestComplete = (results) => {
    if (!currentUser) return;

    const newAttempt = {
      wpm: results.wpm,
      accuracy: results.accuracy,
      errors,
      timestamp: Date.now(),
      difficulty: difficulty,
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

    if (attemptNumber >= 2) {
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

    // Split words and filter empty strings, convert to lowercase for comparison
    const originalWords = text
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 0);

    const typedWords = typed
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 0);

    let correctWords = 0;
    let incorrectWords = 0;
    let totalKeystrokes = typed.length;
    let correctKeystrokes = 0;

    // Calculate correct keystrokes
    for (let i = 0; i < Math.min(typed.length, text.length); i++) {
      if (typed[i].toLowerCase() === text[i].toLowerCase()) {
        correctKeystrokes++;
      }
    }

    // Compare words case-insensitively
    for (let i = 0; i < typedWords.length; i++) {
      if (i < originalWords.length) {
        // Compare words after converting both to lowercase
        const typedWord = typedWords[i].toLowerCase();
        const originalWord = originalWords[i].toLowerCase();

        if (typedWord === originalWord) {
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

    // Calculate WPM using the correct formula
    // WPM = (number of correct words / time in minutes)
    const wpm = Math.round(correctWords * (60 / time));

    // Calculate accuracy based on keystrokes
    const accuracy = Math.round(
      (correctKeystrokes * 100) / Math.max(totalKeystrokes, 1)
    );

    const isAboveAverage = wpm > 40;

    console.log("Debug info:", {
      correctWords,
      typedWords: typedWords.length,
      originalWords: originalWords.length,
      timeInSeconds: time,
      wpm,
      accuracy,
    });

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

  useEffect(() => {
    if (!currentUser) return;

    const attemptNumber = currentUser.attempts.length;

    if (attemptNumber >= 3) {
      localStorage.removeItem("currentUser");
      setCurrentUser(null);
      setTyped("");
      setCurrentIndex(0);
      setIsActive(false);
      setTimeLeft(time);
      setErrors(0); // Reset errors
      setCompletedWords(0); // Reset completed words
      setUnfinishedWords(0); // Reset unfinished words
    }
  }, [currentUser]);

  const handleKeyDown = (e) => {
    if (showResults) return;

    // Add debug event
    setDebugEvents((prev) => [
      {
        key: e.key,
        code: e.code,
        timestamp: new Date().toLocaleTimeString(),
        expectedChar: text[currentIndex],
        isCorrect: e.key.toLowerCase() === text[currentIndex]?.toLowerCase(),
        currentIndex,
      },
      ...prev.slice(0, maxDebugEvents - 1),
    ]);

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
      (e.key.length > 1 && e.key !== "Backspace")
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
        // Correct the error count when deleting
        if (
          typed[typed.length - 1].toLowerCase() !==
          text[currentIndex - 1].toLowerCase()
        ) {
          setErrors((prev) => prev - 1);
        }
      }
      return;
    }

    if (e.key !== "Tab") {
      if (currentIndex < text.length) {
        let inputChar = e.key;

        if (inputChar === "´") {
          return;
        }

        setTyped((prev) => prev + inputChar);
        setCurrentIndex((prev) => prev + 1);

        if (text[currentIndex].toLowerCase() !== inputChar.toLowerCase()) {
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

  useEffect(() => {
    if (!currentUser || showResults) {
      shouldAllowFocus.current = false;
      return;
    }

    shouldAllowFocus.current = true;

    inputRef.current?.focus();

    const handleClick = (e) => {
      const isModal = e.target.closest(
        ".username-modal, .results-modal, .prize-wheel, .leaderboard"
      );

      if (!isModal && shouldAllowFocus.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };

    const handleBlur = () => {
      if (shouldAllowFocus.current) {
        setTimeout(() => {
          inputRef.current?.focus();
        }, 0);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && shouldAllowFocus.current) {
        inputRef.current?.focus();
      }
    };

    document.addEventListener("click", handleClick);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    inputRef.current?.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("click", handleClick);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      inputRef.current?.removeEventListener("blur", handleBlur);
    };
  }, [currentUser, showResults]);

  const resetTest = () => {
    setTyped("");
    setCurrentIndex(0);
    setIsActive(false);
    setTimeLeft(time);
    setErrors(0);
    setCompletedWords(0);
    setUnfinishedWords(0);
    shouldAllowFocus.current = true;
    setTimeout(() => {
      inputRef.current?.focus();
    }, 0);
  };

  const colors = {
    upcoming: "#4B5563",
    current: "#EAB308",
    correct: "#22C55E",
    incorrect: "#EF4444",
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

  const getCurrentDifficultyAndWPM = () => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (user?.attempts?.length > 0) {
      const lastDifficulty = user.attempts[user.attempts.length - 1].difficulty;

      const attemptsForDifficulty = user.attempts.filter(
        (attempt) => attempt.difficulty === lastDifficulty
      );

      const bestWPM = Math.max(
        ...attemptsForDifficulty.map((attempt) => attempt.wpm)
      );

      return {
        difficulty: lastDifficulty,
        wpm: bestWPM,
      };
    }
    return { difficulty: "easy", wpm: 0 };
  };

  const resetUser = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    setRequestModal(!requestModal);
  };

  const toggleModal = () => {
    setRequestModal(!requestModal);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 p-6">
      <DebugPanel
        debugEvents={debugEvents}
        currentIndex={currentIndex}
        typed={typed}
        text={text}
        errors={errors}
      />

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
              <motion.div
                className={
                  difficulty === "hard" ? "text-yellow-500" : "text-gray-300"
                }
              >
                {difficulty === "hard" ? "Difícil" : "Fácil"}
              </motion.div>
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
            {currentUser ? (
              <motion.button
                onClick={toggleModal}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isActive}
                className={`flex bg-gray-700 items-center justify-center w-fit p-2 h-10 rounded-lg text-gray-300 hover:text-yellow-500 transition-colors ${
                  isActive ? "hidden cursor-not-allowed" : ""
                }`}
              >
                <p>Rendirse</p>
              </motion.button>
            ) : (
              <></>
            )}

            <motion.button
              onClick={() => setIsLeaderboardOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center justify-center w-10 h-10 rounded-lg bg-gray-700/50 text-gray-300 hover:text-yellow-500 transition-colors ${
                isActive ? "hidden cursor-not-allowed" : ""
              }`}
              transition={{ duration: 0.3 }}
              disabled={isActive}
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
            onFocus={() => {
              if (!shouldAllowFocus.current) {
                inputRef.current?.blur();
              }
            }}
            tabIndex={shouldAllowFocus.current ? 0 : -1}
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
              {...getCurrentDifficultyAndWPM()}
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

        <AnimatePresence>
          {requestModal && (
            <motion.div
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
            >
              <motion.div
                className="bg-gray-800/95 p-8 rounded-xl w-full max-w-sm backdrop-blur-sm border border-gray-700/50"
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                transition={{
                  type: "spring",
                  duration: 0.5,
                  bounce: 0.3,
                }}
              >
                <motion.div className="flex flex-col justify-center items-center">
                  <p className="text-l text-gray-300 text-center">
                    ¿Estás seguro que querés rendirte?
                  </p>
                  <p className="text-sm text-gray-300 text-center mt-2">
                    Se reiniciará el progreso actual
                  </p>
                  <div className="gap-4 flex mt-8">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={resetUser}
                      className="bg-red-700 border border-gray-700/50 rounded p-2 hover:opacity-80 transition-all"
                    >
                      Rendirme
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      onClick={() => setRequestModal(!requestModal)}
                      className="bg-gray-700 border border-gray-700/50 rounded p-2 hover:opacity-80  transition-all"
                    >
                      Cancelar
                    </motion.button>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TypingTest;
