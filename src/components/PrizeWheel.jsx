import React, { useState, useEffect } from "react";
import { Wheel } from "react-custom-roulette";
import { motion, AnimatePresence } from "framer-motion";
import { Confetti } from "./Confetti";
import { getPrizesByDifficultyAndWPM } from "../config/prizesManager";
import promoCodes from "../config/promoCodes.json";
import momo from "../assets/momo.mp4";
import { Star, Ban, Trophy, Percent, Keyboard } from "lucide-react";


const PrizeWheel = ({ onPrizeWon, isOpen, onClose, difficulty, wpm = 0 }) => {
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [promoCode, setPromoCode] = useState(null);
  const [isCodeVisible, setIsCodeVisible] = useState(false);

  const PRIZES = getPrizesByDifficultyAndWPM(difficulty, wpm);

  const wheelData = PRIZES.map((prize) => ({
    option: prize.option,
    style: {
      backgroundColor:
        prize.enabled && !prize.id?.includes("no_prize")
          ? "#ffd700"
          : "#e74c3c",
    },
  }));

  console.log("Wheel Data:", wheelData);

  const handleSpinClick = () => {
    if (!isSpinning) {
      const random = Math.random();
      let cumulativeProbability = 0;
      let selectedPrizeIndex = -1;

      for (let i = 0; i < PRIZES.length; i++) {
        if (PRIZES[i].enabled) {
          cumulativeProbability += PRIZES[i].probability || 0;
          if (random < cumulativeProbability) {
            selectedPrizeIndex = i;
            break;
          }
        }
      }

      if (selectedPrizeIndex === -1) {
        const noPrizeIndices = PRIZES.map((prize, index) =>
          !prize.enabled || prize.id.includes("no_prize") ? index : -1
        ).filter((index) => index !== -1);

        selectedPrizeIndex =
          noPrizeIndices[Math.floor(Math.random() * noPrizeIndices.length)];
      }

      setPrizeNumber(selectedPrizeIndex);
      setMustSpin(true);
      setIsSpinning(true);
      setHasSpun(true);
    }
  };

  const getNextPromoCode = () => {
    const codesDelivered = parseInt(
      localStorage.getItem("codesDelivered") || "0"
    );
    const nextCode = promoCodes.giftCodes[codesDelivered];

    if (nextCode) {
      localStorage.setItem("codesDelivered", (codesDelivered + 1).toString());
      return nextCode;
    }
    return null; // Return null if we've run out of codes
  };

  const handleStopSpinning = () => {
    setMustSpin(false);
    setIsSpinning(false);

    const wonPrize = PRIZES[prizeNumber];
    if (wonPrize.enabled && !wonPrize.id.includes("no_prize")) {
      const nextCode = getNextPromoCode();
      setPromoCode(nextCode);

      setTimeout(() => {
        setShowConfetti(true);
        setShowResult(true);
        onPrizeWon?.(wonPrize);
      }, 500);
    } else {
      setTimeout(() => {
        setShowResult(true);
      }, 500);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setHasSpun(false);
      setShowConfetti(false);
      setShowResult(false);
      setPromoCode(null);
      setIsCodeVisible(false);
    }
  }, [isOpen]);

  const renderPrizeResult = () => {
    const wonPrize = PRIZES[prizeNumber];
    if (!wonPrize.enabled || wonPrize.id.includes("no_prize")) {
      return (
        <div className="bg-gray-700/50 text-gray-300 p-4 rounded-lg mb-4">
          <h3 className="text-xl font-bold mb-2">Suerte la próxima vez 🎲</h3>
          <p className="text-center">¡Gracias por participar!</p>
        </div>
      );
    }

    return (
      <div className="bg-yellow-500/20 text-yellow-300 p-4 rounded-lg mb-4">
        <h3 className="text-xl font-bold mb-2">¡Felicidades! 🎉</h3>
        <p className="text-center">¡Has ganado {wonPrize.content}!</p>
        {promoCode && (
          <div className="mt-4">
            <div className="bg-yellow-500/10 p-4 rounded-lg">
              <p className="text-sm text-yellow-300 mb-2">
                Tu código promocional:
              </p>
              <div className="relative">
                <p className="font-mono font-bold text-lg mb-2">
                  {isCodeVisible ? promoCode : "••••••••••"}
                </p>
                <button
                  onClick={() => setIsCodeVisible(!isCodeVisible)}
                  className="text-sm px-3 py-1 rounded bg-yellow-500/20 hover:bg-yellow-500/30 transition-colors"
                >
                  {isCodeVisible ? "Ocultar código" : "Mostrar código"}
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              ⚠️ Por seguridad, una vez reveles el código, toma una foto con tu
              celular con el código y premio ganado. Al finalizar, podes cerrar
              esta ventana.
            </p>
          </div>
        )}
      </div>
    );
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
          {promoCode && <Confetti />}

          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-gray-800/90 backdrop-blur-md rounded-xl p-8 relative z-10 max-w-md w-full shadow-2xl"
          >
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

            {!showResult && (
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">
                  ¡Gira la Ruleta!
                </h2>
                <p className="text-gray-400 text-sm">
                  {difficulty === "hard"
                  //   ? <>
                  //   ¡Tienes la oportunidad de ganar premios exclusivos!<br /><br />
                  //   <Keyboard className="inline-block w-4 h-4 text-yellow-500" /> Set de keycap color solido - [Probabilidad 5%]<br />
                  //   <Percent className="inline-block w-4 h-4 text-yellow-500" /> Descuentos - [Probabilidad 40%]<br />
                  //   <Star className="inline-block w-4 h-4 text-yellow-500" /> Keycap gratis  - [Probabilidad 20%]<br />
                  //   <Star className="inline-block w-4 h-4 text-yellow-500" /> 2x1 - [Probabilidad 10%]<br />
                  //   <Ban className="inline-block w-4 h-4 text-yellow-500" /> Perder- [Probabilidad 25%]<br />
                  // </>
                  //   : <>
                  //   ¡Tienes la oportunidad de ganar premios exclusivos!<br /><br />
                  //   <Keyboard className="inline-block w-4 h-4 text-yellow-500" /> Set de keycap color solido - [Probabilidad 5%]<br />
                  //   <Percent className="inline-block w-4 h-4 text-yellow-500" /> Descuentos - [Probabilidad 40%]<br />
                  //   <Star className="inline-block w-4 h-4 text-yellow-500" /> Keycap gratis  - [Probabilidad 20%]<br />
                  //   <Star className="inline-block w-4 h-4 text-yellow-500" /> 2x1 - [Probabilidad 10%]<br />
                  //   <Ban className="inline-block w-4 h-4 text-yellow-500" /> Perder- [Probabilidad 25%]<br />
                  // </>
                    }
                </p>
              </div>
            )}

            <div className="relative flex justify-center mb-8">
              <div
                className={`flex justify-center w-full ${
                  showResult ? "absolute mt-[-100%] scale-50" : "relative"
                }`}
              >
                <div
                  className="absolute -top-2 left-1/2 -translate-x-1/2 z-10 w-0 h-0 
                              border-l-[8px] border-l-transparent
                              border-r-[8px] border-r-transparent
                              border-t-[16px] border-slate-800"
                />
                <Wheel
                  mustStartSpinning={mustSpin}
                  prizeNumber={prizeNumber}
                  data={wheelData}
                  onStopSpinning={handleStopSpinning}
                  spinDuration={0.8}
                  fontSize={16}
                  textDistance={52}
                  outerBorderWidth={2}
                  outerBorderColor="#f6c90e"
                  innerRadius={10}
                  innerBorderColor="#f6c90e"
                  innerBorderWidth={2}
                  radiusLineColor="#f6c90e"
                  radiusLineWidth={1}
                  backgroundColors={wheelData.map(
                    (item) => item.style.backgroundColor
                  )}
                  textColors={wheelData.map(() => "#000000")}
                  innerBackgroundColor="transparent"
                  centerZero={true}
                />
              </div>
              {showResult && promoCode && (
                <div className="fixed left-[-110%] p-2 bg-slate-700 rounded z-100">
                  <video
                    width="450"
                    loop
                    autoPlay
                    controls
                    preload="true"
                    playsInline
                    src={momo}
                    className="rounded-lg shadow-lg"
                  ></video>
                </div>
              )}
            </div>

            <div className="text-center">
              {!hasSpun ? (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSpinClick}
                    disabled={isSpinning}
                    className={`
                      w-full max-w-xs mx-auto px-8 py-3 rounded-lg font-medium text-gray-900
                      ${
                        isSpinning
                          ? "bg-gray-400 cursor-not-allowed"
                          : "bg-yellow-500 hover:bg-yellow-400"
                      }
                      transition-colors mb-4
                    `}
                  >
                    {isSpinning ? "Girando..." : "Girar Ruleta"}
                  </motion.button>
                  <p className="text-gray-400 text-sm">
                    {difficulty === "hard"
                      ? "¡Tienes la oportunidad de ganar premios exclusivos!"
                      : "¡Tienes la oportunidad de ganar premios especiales!"}
                  </p>
                </>
              ) : (
                <AnimatePresence>
                  {showResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className="w-full max-w-md mx-auto"
                    >
                      {renderPrizeResult()}
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default PrizeWheel;
