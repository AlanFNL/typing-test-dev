import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import TypingText from "./components/TypingText";
import { getRandomText } from "./data/texts";
import logo from "./assets/logo.png";
import ResultsModal from "./components/ResultsModal";
import { Award, Github, Trophy } from "lucide-react";
import UsernameModal from "./components/UsernameModal";
import PrizeWheel from "./components/PrizeWheel";
import Leaderboard from "./components/Leaderboard";
import {
  PRIZE_WPM_TARGET,
  TEST_DURATION_SECONDS,
  WORDS_REQUIRED_FOR_PRIZE,
} from "./config/constants";
const MAX_ATTEMPTS = 2;

const INITIAL_RESULTS = {
  wpm: 0,
  accuracy: 0,
  isAboveAverage: false,
};

const TypingTest = () => {
  const [text, setText] = useState(() => getRandomText());
  const [typed, setTyped] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const time = TEST_DURATION_SECONDS;
  const [timeLeft, setTimeLeft] = useState(time);
  const inputRef = useRef(null);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState(INITIAL_RESULTS);
  const [errors, setErrors] = useState(0);
  const [completionTime, setCompletionTime] = useState(null);
  const [unfinishedWords, setUnfinishedWords] = useState(0);
  const [completedWords, setCompletedWords] = useState(0);
  const [difficulty, setDifficulty] = useState("easy");
  const [isPrizeWheelOpen, setIsPrizeWheelOpen] = useState(false);
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false);
  const [requestModal, setRequestModal] = useState(false);
  const maxDebugEvents = 10;
  const [topTenPlacement, setTopTenPlacement] = useState(null);

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem("currentUser");
    return saved ? JSON.parse(saved) : null;
  });

  const [leaderboard, setLeaderboard] = useState(() => {
    const saved = localStorage.getItem("leaderboard");
    return saved ? JSON.parse(saved) : [];
  });

  const shouldAllowFocus = useRef(true);

  const attemptsUsed = currentUser?.attempts?.length ?? 0;
  const hasQualifiedForPrize =
    currentUser?.attempts?.some((attempt) => attempt.wpm > PRIZE_WPM_TARGET) ??
    false;
  const canAttemptAgain = currentUser?.attempts
    ? attemptsUsed < MAX_ATTEMPTS && !hasQualifiedForPrize
    : false;
  const goalMessage = hasQualifiedForPrize
    ? ""
    : `Necesitás escribir aproximadamente ${WORDS_REQUIRED_FOR_PRIZE} palabras correctas para desbloquear la ruleta. ¡Mientras más mejor!`;
  const showGoalText = !isActive && !typed;
  const typedWordCount = typed.trim()
    ? typed
        .trim()
        .split(/\s+/)
        .filter((word) => word.length > 0).length
    : 0;
  const wordProgress = Math.min(1, typedWordCount / WORDS_REQUIRED_FOR_PRIZE);
  const wordsRemaining = Math.max(0, WORDS_REQUIRED_FOR_PRIZE - typedWordCount);
  const shouldShowProgressBar =
    currentUser && !showResults && (isActive || typedWordCount > 0);

  const resetTest = ({ refreshText = false, autoFocus = true } = {}) => {
    if (refreshText) {
      setText(getRandomText());
    }

    setTyped("");
    setCurrentIndex(0);
    setIsActive(false);
    setTimeLeft(time);
    setErrors(0);
    setCompletedWords(0);
    setUnfinishedWords(0);
    setCompletionTime(null);
    setResults(INITIAL_RESULTS);
    shouldAllowFocus.current = autoFocus;

    if (autoFocus) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    } else {
      inputRef.current?.blur();
    }
  };

  const handleNewUser = (username, selectedDifficulty) => {
    const newUser = {
      username,
      attempts: [],
    };
    localStorage.setItem("currentUser", JSON.stringify(newUser));
    setCurrentUser(newUser);
    setDifficulty(selectedDifficulty);
    shouldAllowFocus.current = true;
    setTopTenPlacement(null);

    resetTest({ refreshText: true });

    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    const handleRestrictedShortcuts = (event) => {
      const key = event.key?.toLowerCase();
      const usesModifier = event.ctrlKey || event.metaKey;

      const isReloadShortcut = usesModifier && key === "r";
      const isDevToolsShortcut =
        (usesModifier && event.shiftKey && ["i", "j", "c"].includes(key)) ||
        event.key === "F12" ||
        event.key === "F5" ||
        (usesModifier && key === "u");

      if (isReloadShortcut || isDevToolsShortcut) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    const preventContextMenu = (event) => {
      event.preventDefault();
    };

    window.addEventListener("keydown", handleRestrictedShortcuts, true);
    window.addEventListener("contextmenu", preventContextMenu);

    return () => {
      window.removeEventListener("keydown", handleRestrictedShortcuts, true);
      window.removeEventListener("contextmenu", preventContextMenu);
    };
  }, []);

  const handleTestComplete = (calculatedResults) => {
    if (!currentUser) return;

    const alreadyQualified = currentUser.attempts.some(
      (attempt) => attempt.wpm > PRIZE_WPM_TARGET
    );

    if (alreadyQualified || currentUser.attempts.length >= MAX_ATTEMPTS) {
      return;
    }

    const newAttempt = {
      wpm: calculatedResults.wpm,
      accuracy: calculatedResults.accuracy,
      errors,
      timestamp: Date.now(),
      difficulty,
    };

    const updatedAttempts = [...currentUser.attempts, newAttempt];
    const updatedUser = {
      ...currentUser,
      attempts: updatedAttempts,
    };

    if (
      !updatedUser.bestAttempt ||
      newAttempt.wpm > (updatedUser.bestAttempt?.wpm ?? 0)
    ) {
      updatedUser.bestAttempt = newAttempt;
    }

    const hasQualifiedNow =
      alreadyQualified || newAttempt.wpm > PRIZE_WPM_TARGET;
    const sessionComplete =
      hasQualifiedNow || updatedAttempts.length >= MAX_ATTEMPTS;

    let placement = null;

    if (sessionComplete && updatedUser.bestAttempt) {
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

      const placementIndex = newLeaderboard.findIndex(
        (entry) =>
          entry.username === currentUser.username &&
          entry.wpm === updatedUser.bestAttempt.wpm &&
          entry.difficulty === updatedUser.bestAttempt.difficulty
      );

      if (placementIndex !== -1) {
        placement = placementIndex + 1;
      }

      localStorage.setItem("leaderboard", JSON.stringify(newLeaderboard));
      setLeaderboard(newLeaderboard);
    }

    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
    setTopTenPlacement(placement);
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

    // Compare words case-insensitively and only count complete words
    for (let i = 0; i < typedWords.length; i++) {
      if (i < originalWords.length) {
        const typedWord = typedWords[i].toLowerCase();
        const originalWord = originalWords[i].toLowerCase();

        // Only count as correct if the entire word matches
        if (typedWord === originalWord) {
          correctWords++;
        } else {
          // Partial matches don't count as correct words
          incorrectWords++;
        }
      } else {
        incorrectWords++;
      }
    }

    // Add remaining untyped words to incorrect count
    if (originalWords.length > typedWords.length) {
      incorrectWords += originalWords.length - typedWords.length;
    }

    // Calculate WPM using only fully correct words
    const wpm = Math.round(correctWords * (60 / time));

    // Calculate accuracy based on keystrokes
    const accuracy = Math.round(
      (correctKeystrokes * 100) / Math.max(totalKeystrokes, 1)
    );

    const isAboveAverage = wpm > PRIZE_WPM_TARGET;

    // Add console debug logging
    console.log("Debug info:", {
      correctWords,
      incorrectWords,
      typedWords: typedWords.length,
      originalWords: originalWords.length,
      timeInSeconds: time,
      typedText: typed,
      words: typedWords,
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
    if (!currentUser || !hasQualifiedForPrize) return;
    if (showResults || isPrizeWheelOpen) return;

    const attemptToShow =
      currentUser.bestAttempt ||
      currentUser.attempts[currentUser.attempts.length - 1];

    if (!attemptToShow) return;

    setResults({
      wpm: attemptToShow.wpm,
      accuracy: attemptToShow.accuracy,
      isAboveAverage: attemptToShow.wpm > PRIZE_WPM_TARGET,
    });
    setErrors(attemptToShow.errors ?? 0);
    setCompletionTime(null);
    setIsActive(false);
    setShowResults(true);
    shouldAllowFocus.current = false;
  }, [currentUser, hasQualifiedForPrize, showResults, isPrizeWheelOpen]);

  const handleKeyDown = (e) => {
    if (showResults || !currentUser || !canAttemptAgain) return;

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

        if (inputChar === "´") return;

        // Get current word boundaries
        const currentWordStart = text.lastIndexOf(" ", currentIndex - 1) + 1;
        const currentWordEnd = text.indexOf(" ", currentWordStart);
        const currentWordLength =
          (currentWordEnd === -1 ? text.length : currentWordEnd) -
          currentWordStart;
        const typedInCurrentWord = currentIndex - currentWordStart;

        // Prevent spacebar if:
        // 1. We're at the start of a word (typedInCurrentWord === 0)
        // 2. The current character in the original text isn't a space
        if (inputChar === " ") {
          const isAtWordStart = typedInCurrentWord === 0;
          const isSpaceInOriginal = text[currentIndex] === " ";

          if (isAtWordStart || !isSpaceInOriginal) {
            // Mark current word as wrong and move to next word
            const nextSpaceIndex = text.indexOf(" ", currentIndex);
            if (nextSpaceIndex !== -1) {
              // Fill the current word with wrong characters up to the next space
              const wrongChars = text
                .slice(currentIndex, nextSpaceIndex)
                .replace(/./g, "×");
              setTyped((prev) => prev + wrongChars + " ");
              setCurrentIndex(nextSpaceIndex + 1);
              // Add errors for each skipped character
              setErrors((prev) => prev + (nextSpaceIndex - currentIndex + 1));
            }
            return;
          }
        }

        if (typedInCurrentWord < currentWordLength || inputChar === " ") {
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
        } else {
          e.preventDefault();
        }
      }
    }
  };

  useEffect(() => {
    if (!currentUser || showResults || !canAttemptAgain) {
      shouldAllowFocus.current = false;
      inputRef.current?.blur();
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
  }, [currentUser, showResults, canAttemptAgain]);

  const colors = {
    upcoming: "#4B5563",
    current: "#EAB308",
    correct: "#22C55E",
    incorrect: "#EF4444",
  };

  const handlePrepareNextAttempt = () => {
    setShowResults(false);
    resetTest();
    setTopTenPlacement(null);
  };

  const handleSessionEnd = () => {
    localStorage.removeItem("currentUser");
    setCurrentUser(null);
    setShowResults(false);
    resetTest({ refreshText: true, autoFocus: false });
    setTopTenPlacement(null);
  };

  const handleOpenPrizeModal = () => {
    setShowResults(false);
    resetTest({ autoFocus: false });
    setIsPrizeWheelOpen(true);
  };

  const handlePrizeWon = (prize) => {
    console.log("Won prize:", prize);

    setTimeout(() => {
      setIsPrizeWheelOpen(false);
      handleSessionEnd();
    }, 120000);
  };

  const handleClosePrize = () => {
    setIsPrizeWheelOpen(false);
    handleSessionEnd();
  };

  const handleCloseLeaderboard = () => {
    setIsLeaderboardOpen(false);
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const getCurrentDifficultyAndWPM = () => {
    const user =
      currentUser || JSON.parse(localStorage.getItem("currentUser") || "null");
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
    handleSessionEnd();
    setRequestModal(false);
  };

  const toggleModal = () => {
    setRequestModal(!requestModal);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-300 p-6">
      {!currentUser && (
        <UsernameModal onSubmit={handleNewUser} leaderboard={leaderboard} />
      )}

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
                <p>Abandonar</p>
              </motion.button>
            ) : (
              <></>
            )}
            {/* <div className="flex items-center gap-6">
              <motion.button
                onClick={() => toggleModal('instrucciones')} // Pasa un tipo específico
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                disabled={isActive}
                className={`flex bg-gray-700 items-center justify-center w-fit p-2 h-10 rounded-lg text-gray-300 hover:text-yellow-500 transition-colors ${
                  isActive ? "hidden cursor-not-allowed" : ""
                }`}
              >
                <p>Instrucciones</p>
              </motion.button>
            </div> */}

            <motion.button
              onClick={() => setIsLeaderboardOpen(true)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center gap-2 px-3 h-10 rounded-lg bg-gray-700/50 text-gray-300 hover:text-yellow-500 transition-colors ${
                isActive ? "hidden cursor-not-allowed" : ""
              }`}
              transition={{ duration: 0.3 }}
              disabled={isActive}
            >
              <Trophy className="w-5 h-5" />
              <span>Ranking</span>
            </motion.button>
            <motion.button
              className={`flex items-center gap-2 px-3 h-10 rounded-lg bg-yellow-700/50 text-gray-300 hover:text-yellow-500 transition-colors ${
                isActive ? "hidden cursor-not-allowed" : ""
              }`}
              transition={{ duration: 0.3 }}
              disabled={isActive}
            >
              <Award className="w-5 h-5" />
              <span>
                Si haces {PRIZE_WPM_TARGET} PPM o más podes girar la ruleta
              </span>
            </motion.button>
          </div>
        </div>

        <div className="text-center mb-6 mt-32 select-none cursor-default">
          <span className="text-2xl font-mono">{timeLeft}s</span>
        </div>

        {currentUser && (
          <div className="max-w-[51rem] w-[800px] mx-auto mb-8 absolute top-[190px] left-1/2 -translate-x-1/2">
            <div
              className={`bg-gray-800/50 border border-gray-700/60 rounded-lg px-4 py-4 text-sm text-gray-200 ${
                shouldShowProgressBar ? "mb-8" : ""
              } ${isActive ? "opacity-75" : ""}`}
            >
              <p className={`text-center mb-3 ${isActive ? "opacity-0" : ""}`}>
                {goalMessage}
              </p>

              <div className="space-y-2">
                <div className="h-2 bg-gray-700/70 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${wordProgress * 100}%` }}
                    transition={{ duration: 0.3 }}
                    className={`h-full rounded-full ${
                      wordProgress >= 1
                        ? "bg-green-400"
                        : wordProgress >= 0.7
                        ? "bg-yellow-300"
                        : "bg-yellow-500/90"
                    }`}
                  />
                </div>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>Palabras registradas: {typedWordCount}</span>

                  <span>
                    {typedWordCount >= WORDS_REQUIRED_FOR_PRIZE
                      ? "Objetivo alcanzado, seguí sumando para entrar en el top!"
                      : `Faltan ${wordsRemaining} palabras`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

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
          <p className="flex items-center justify-center mt-2 gap-2">
            Desarrollado por <Github className="w-4 h-4" />
            AlanFNL
          </p>
        </div>

        <AnimatePresence>
          {showResults && (
            <ResultsModal
              onNextAttempt={handlePrepareNextAttempt}
              onSessionEnd={handleSessionEnd}
              results={results}
              completedWords={completedWords}
              unfinishedWords={unfinishedWords}
              errors={errors}
              completionTime={completionTime}
              time={time}
              onOpenPrizeWheel={handleOpenPrizeModal}
              attemptNumber={attemptsUsed}
              maxAttempts={MAX_ATTEMPTS}
              qualifiesForPrizeWheel={hasQualifiedForPrize}
              topTenPlacement={topTenPlacement}
              leaderboard={leaderboard}
              highlightUsername={currentUser?.username}
              averageWPM={PRIZE_WPM_TARGET}
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
                    Deberas dejar de jugar y darle el lugar a la siguiente
                    persona.
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
