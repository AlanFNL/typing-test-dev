import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import promoCodes from "../config/promoCodes.json";

const CODES_PER_PAGE = 100;

const PromoCodeManager = () => {
  const [activeTab, setActiveTab] = useState("pending");
  const [deliveredCodes, setDeliveredCodes] = useState([]);
  const [pendingCodes, setPendingCodes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    // Load delivered codes from localStorage
    const storedDeliveredCodes = JSON.parse(
      localStorage.getItem("deliveredCodes") || "[]"
    );
    setDeliveredCodes(storedDeliveredCodes);

    // Set pending codes (all codes that aren't delivered)
    const pending = promoCodes.giftCodes.filter(
      (code) => !storedDeliveredCodes.includes(code)
    );
    setPendingCodes(pending);
  }, []);

  const handleCodeDelivered = (code) => {
    const newDeliveredCodes = [...deliveredCodes, code].sort();
    const newPendingCodes = pendingCodes.filter((c) => c !== code);

    setDeliveredCodes(newDeliveredCodes);
    setPendingCodes(newPendingCodes);
    localStorage.setItem("deliveredCodes", JSON.stringify(newDeliveredCodes));
  };

  const handleUndoDelivered = (code) => {
    const newDeliveredCodes = deliveredCodes.filter((c) => c !== code);
    const newPendingCodes = [...pendingCodes, code].sort();

    setDeliveredCodes(newDeliveredCodes);
    setPendingCodes(newPendingCodes);
    localStorage.setItem("deliveredCodes", JSON.stringify(newDeliveredCodes));
  };

  // Get current codes based on pagination
  const getCurrentCodes = () => {
    const startIndex = (currentPage - 1) * CODES_PER_PAGE;
    const endIndex = startIndex + CODES_PER_PAGE;
    return activeTab === "pending"
      ? pendingCodes.slice(startIndex, endIndex)
      : deliveredCodes.slice(startIndex, endIndex);
  };

  const totalPages = Math.ceil(
    (activeTab === "pending" ? pendingCodes.length : deliveredCodes.length) /
      CODES_PER_PAGE
  );

  // Reset to first page when switching tabs
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  return (
    <div className="max-w-2xl mx-auto bg-slate-700 p-6">
      <h1 className="text-3xl font-bold text-center mb-8 text-yellow-500">
        Códigos afaafa
      </h1>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab("pending")}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            activeTab === "pending"
              ? "bg-yellow-500 text-gray-900"
              : "bg-gray-700 text-gray-300"
          }`}
        >
          A Entregar ({pendingCodes.length})
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setActiveTab("delivered")}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
            activeTab === "delivered"
              ? "bg-yellow-500 text-gray-900"
              : "bg-gray-700 text-gray-300"
          }`}
        >
          Entregados ({deliveredCodes.length})
        </motion.button>
      </div>

      {/* Pagination Info */}
      <div className="text-gray-400 text-sm mb-4 text-center">
        Página {currentPage} de {totalPages}
      </div>

      {/* Code Lists */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${activeTab}-${currentPage}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
          className="min-h-[400px]"
          layout
        >
          <motion.div className="space-y-2" layout>
            {getCurrentCodes().map((code, index) => (
              <motion.div
                layout
                key={code}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, transition: { duration: 0.2 } }}
                transition={{
                  delay: index * 0.02,
                  layout: { duration: 0.3 },
                }}
                className={`flex items-center justify-between p-4 rounded-lg ${
                  activeTab === "pending" ? "bg-gray-800" : "bg-gray-800/50"
                }`}
              >
                <motion.span layout className="font-mono text-gray-300">
                  {code}
                </motion.span>
                <motion.button
                  layout
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() =>
                    activeTab === "pending"
                      ? handleCodeDelivered(code)
                      : handleUndoDelivered(code)
                  }
                  className={`p-2 rounded-full ${
                    activeTab === "pending"
                      ? "bg-green-500/20 text-green-500 hover:bg-green-500/30"
                      : "bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30"
                  } transition-colors`}
                >
                  {activeTab === "pending" ? (
                    <motion.svg
                      layout
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </motion.svg>
                  ) : (
                    <motion.svg
                      layout
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v4a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                        clipRule="evenodd"
                      />
                    </motion.svg>
                  )}
                </motion.button>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Pagination Controls */}
      <div className="flex justify-center gap-2 mt-6">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
          disabled={currentPage === 1}
          className={`px-4 py-2 rounded-lg ${
            currentPage === 1
              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          Anterior
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() =>
            setCurrentPage((prev) => Math.min(totalPages, prev + 1))
          }
          disabled={currentPage === totalPages}
          className={`px-4 py-2 rounded-lg ${
            currentPage === totalPages
              ? "bg-gray-700 text-gray-500 cursor-not-allowed"
              : "bg-gray-700 text-gray-300 hover:bg-gray-600"
          }`}
        >
          Siguiente
        </motion.button>
      </div>
    </div>
  );
};

export default PromoCodeManager;
