import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef } from "react";

const TypingText = ({
  text,
  typed,
  currentIndex,
  colors,
  cursorVariants,
  showGradient = true,
}) => {
  const CHARS_PER_LINE = 45;
  const VISIBLE_LINES = 3;

  // Helper function to process text into lines, words, and characters
  const processText = (text) => {
    const words = text.split(" ");
    const lines = [];
    let currentLine = [];
    let charCount = 0;
    let totalChars = 0;

    words.forEach((word, wordIndex) => {
      const wordLength = word.length;
      const spaceNeeded = currentLine.length > 0 ? 1 : 0;

      if (
        charCount + wordLength + spaceNeeded > CHARS_PER_LINE &&
        currentLine.length > 0
      ) {
        // Add line break marker
        lines.push({
          words: currentLine,
          chars: currentLine.join(" ").split(""),
          length: currentLine.join(" ").length,
          totalChars,
          needsSpace: true, // This line needs a space at the end
        });
        totalChars += currentLine.join(" ").length + 1; // +1 for required space
        currentLine = [word];
        charCount = wordLength;
      } else {
        if (currentLine.length > 0) {
          charCount += spaceNeeded;
        }
        currentLine.push(word);
        charCount += wordLength;
      }
    });

    if (currentLine.length > 0) {
      lines.push({
        words: currentLine,
        chars: currentLine.join(" ").split(""),
        length: currentLine.join(" ").length,
        totalChars,
        needsSpace: false, // Last line doesn't need a space
      });
    }

    return lines;
  };

  const processedLines = processText(text);

  // Calculate current line based on currentIndex
  const getCurrentLineIndex = () => {
    let accumChars = 0;
    for (let i = 0; i < processedLines.length; i++) {
      accumChars += processedLines[i].length;
      if (processedLines[i].needsSpace) accumChars += 1;
      if (currentIndex < accumChars) return i;
    }
    return processedLines.length - 1;
  };

  const currentLineIndex = getCurrentLineIndex();
  const visibleLines = processedLines.slice(
    Math.max(0, currentLineIndex),
    Math.max(VISIBLE_LINES, currentLineIndex + VISIBLE_LINES)
  );

  const lineVariants = {
    enter: {
      y: 15,
      opacity: 0,
      filter: "blur(3px)",
    },
    visible: {
      y: 0,
      opacity: 1,
      filter: "blur(0px)",
      transition: {
        y: { type: "spring", stiffness: 300, damping: 25 },
        opacity: { duration: 0.15 },
        filter: { duration: 0.15 },
      },
    },
    completed: {
      opacity: 0.35,
      filter: "blur(1.5px)",
      transition: {
        opacity: { duration: 0.25, ease: "easeOut" },
        filter: { duration: 0.25, ease: "easeOut" },
      },
    },
    exit: {
      y: -12,
      opacity: 0,
      filter: "blur(2px)",
      transition: {
        y: { duration: 0.2, ease: "easeIn" },
        opacity: { duration: 0.15 },
        filter: { duration: 0.15 },
      },
    },
  };

  // Add cursor position state
  const [cursorPosition, setCursorPosition] = useState({ x: 0, width: 0 });
  const charRefs = useRef(new Map());

  // Update cursor position when currentIndex changes
  useEffect(() => {
    const currentChar = charRefs.current.get(currentIndex);
    if (currentChar) {
      const rect = currentChar.getBoundingClientRect();
      setCursorPosition({
        x: currentChar.offsetLeft,
        width: rect.width,
      });
    }
  }, [currentIndex]);

  // Modified cursor variants for faster movement
  const cursorMotionVariants = {
    initial: { x: cursorPosition.x, width: cursorPosition.width },
    animate: {
      x: cursorPosition.x,
      width: cursorPosition.width,
      transition: {
        type: "spring",
        stiffness: 500,
        damping: 31,
        mass: 0.28,
      },
    },
  };

  return (
    <div className="h-[200px] overflow-hidden relative">
      {showGradient && (
        <div className="absolute bottom-0 left-0 right-0 h-[60px] bg-gradient-to-t from-gray-900 to-transparent pointer-events-none z-10" />
      )}

      <div className="flex flex-col gap-8 relative">
        <AnimatePresence mode="popLayout">
          {visibleLines.map((line, lineIndex) => {
            const lineStartIndex = line.totalChars;
            const lineEndIndex = lineStartIndex + line.chars.length;
            const isLineCompleted = typed.length > lineEndIndex;
            const isCurrentLine =
              currentIndex >= lineStartIndex && currentIndex < lineEndIndex;

            return (
              <motion.div
                key={lineStartIndex}
                variants={lineVariants}
                initial="enter"
                animate={isLineCompleted ? "completed" : "visible"}
                exit="exit"
                className={`flex flex-wrap content-start text-[1.85rem] leading-relaxed font-mono relative
                  ${lineIndex === visibleLines.length - 1 ? "opacity-50" : ""}`}
                style={{ wordSpacing: "0.25em" }}
              >
                {/* Animated cursor for current line */}
                {isCurrentLine && (
                  <motion.span
                    className="absolute h-0.5 bg-yellow-500 bottom-0"
                    variants={cursorMotionVariants}
                    initial="initial"
                    animate="animate"
                    transition={{
                      type: "spring",
                      stiffness: 500,
                      damping: 31,
                      mass: 0.28,
                    }}
                  />
                )}

                {line.chars.map((char, charIndex) => {
                  const globalIndex = lineStartIndex + charIndex;
                  const isCurrentChar = globalIndex === currentIndex;
                  let color = colors.upcoming;

                  if (globalIndex < typed.length) {
                    color =
                      typed[globalIndex].toLowerCase() === char.toLowerCase()
                        ? colors.correct
                        : colors.incorrect;
                  } else if (isCurrentChar) {
                    color = colors.current;
                  }

                  return (
                    <span
                      key={charIndex}
                      ref={(el) => {
                        if (el) charRefs.current.set(globalIndex, el);
                      }}
                      className="relative inline-block"
                      style={{
                        width: char === " " ? "0.25em" : "auto",
                        marginRight: char === " " ? "0.25em" : "0",
                      }}
                    >
                      <motion.span
                        animate={{ color }}
                        transition={{ duration: 0.15 }}
                      >
                        {char}
                      </motion.span>
                    </span>
                  );
                })}
                {line.needsSpace && (
                  <span
                    className="relative inline-block text-transparent"
                    style={{
                      width: "0.25em",
                      marginRight: "0.25em",
                    }}
                  >
                    ·
                  </span>
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default TypingText;
