import React, { useState } from "react";
import {
  getPrizes,
  updatePrize,
  resetPrizes,
  updateWPMRange,
  initializePrizes,
  createPrize,
} from "../config/prizesManager";

const PrizesAdmin = () => {
  const [prizes, setPrizes] = useState(() => initializePrizes());
  const [activeTab, setActiveTab] = useState("easy");
  const [activeLevel, setActiveLevel] = useState("beginner");
  const [isEditing, setIsEditing] = useState(false);
  const [editingPrize, setEditingPrize] = useState(null);

  const currentPrizes = prizes[activeTab]?.[activeLevel]?.prizes || [];
  const currentWpmRange = prizes[activeTab]?.[activeLevel]?.wpmRange || {
    min: 0,
    max: 0,
  };

  const handleEditPrize = (prize) => {
    setEditingPrize(prize);
    setIsEditing(true);
  };

  const handleCreatePrize = () => {
    setEditingPrize({
      isNew: true,
      id: `prize_${Date.now()}`,
      option: "",
      content:"",
      probability: 0.1,
      enabled: true,
    });
    setIsEditing(true);
  };

  const updatePrizesState = () => {
    setPrizes(getPrizes());
  };

  const PrizeForm = ({ prize, onClose }) => {
    const [form, setForm] = useState({
      id: prize.id || "",
      option: prize.option || "",
      content: prize.content || "",
      probability: prize.probability || 0.1,
      enabled: prize.enabled !== undefined ? prize.enabled : true,
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      console.log("Form submission started");
      console.log("Form data:", form);

      let success = false;

      if (!prize.isNew) {
        console.log("Updating existing prize");
        const result = updatePrize(activeTab, activeLevel, prize.id, form);
        success = result !== null;
      } else {
        console.log("Creating new prize");
        const newPrize = {
          id: form.id,
          option: form.option,
          content: form.content,
          probability: parseFloat(form.probability) || 0.1,
          enabled: form.enabled,
        };
        console.log("New prize object:", newPrize);
        const result = createPrize(activeTab, activeLevel, newPrize);
        success = result !== null;
      }

      if (success) {
        console.log("Setting new prizes state");
        updatePrizesState();
        onClose();
      } else {
        console.error("Failed to update prizes");
      }
    };

    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md">
          <h3 className="text-xl text-white font-bold mb-4">
            {prize.id ? "Editar Premio" : "Crear Premio"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">ID</label>
              <input
                type="text"
                value={form.id}
                onChange={(e) => setForm({ ...form, id: e.target.value })}
                className="w-full bg-gray-700 text-white rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Nombre del Premio
              </label>
              <input
                type="text"
                value={form.option}
                onChange={(e) => setForm({ ...form, option: e.target.value })}
                className="w-full bg-gray-700 text-white rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Content
              </label>
              <input
                type="text"
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                className="w-full bg-gray-700 text-white rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">
                Probabilidad
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="1"
                value={form.probability}
                onChange={(e) =>
                  setForm({ ...form, probability: parseFloat(e.target.value) })
                }
                className="w-full bg-gray-700 text-white rounded px-3 py-2"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(e) =>
                  setForm({ ...form, enabled: e.target.checked })
                }
                className="rounded"
              />
              <label className="text-sm text-gray-400">Habilitado</label>
            </div>
            <div className="flex gap-2 mt-6">
              <button
                type="submit"
                className="flex-1 bg-green-500 text-white rounded-lg px-4 py-2"
              >
                Guardar
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-600 text-white rounded-lg px-4 py-2"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  return (
    <div className="p-6 bg-gray-800 rounded-lg">
      <div className="flex justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">Administrar Premios</h2>
        <button
          onClick={() => {
            if (
              confirm("¿Restaurar todos los premios a valores predeterminados?")
            ) {
              resetPrizes();
              updatePrizesState();
            }
          }}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
        >
          Restaurar Predeterminados
        </button>
      </div>

      {/* Mode Selector */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveTab("easy")}
          className={`px-4 py-2 rounded-lg ${
            activeTab === "easy"
              ? "bg-yellow-500 text-black"
              : "bg-gray-700 text-white"
          }`}
        >
          Modo Fácil
        </button>
        <button
          onClick={() => setActiveTab("hard")}
          className={`px-4 py-2 rounded-lg ${
            activeTab === "hard"
              ? "bg-yellow-500 text-black"
              : "bg-gray-700 text-white"
          }`}
        >
          Modo Difícil
        </button>
      </div>

      {/* WPM Range with current values display */}
      <div className="mb-6 bg-gray-700 p-4 rounded-lg">
        <h3 className="text-lg font-medium text-white mb-2">
          Rango de WPM -{" "}
          {activeLevel === "beginner" ? "Principiante" : "Avanzado"}
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Rango actual: {currentWpmRange.min} -{" "}
          {currentWpmRange.max === Infinity ? "∞" : currentWpmRange.max} WPM
        </p>
        <div className="flex gap-4">
          <div>
            <label className="block text-sm text-gray-400">Desde</label>
            <input
              type="number"
              value={currentWpmRange.min}
              onChange={(e) => {
                const newRange = {
                  ...currentWpmRange,
                  min: parseInt(e.target.value),
                };
                updateWPMRange(activeTab, activeLevel, newRange);
                updatePrizesState();
              }}
              className="bg-gray-600 px-3 py-1 rounded"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-400">Hasta</label>
            <input
              type="number"
              value={
                currentWpmRange.max === Infinity ? 999 : currentWpmRange.max
              }
              onChange={(e) => {
                const newRange = {
                  ...currentWpmRange,
                  max:
                    activeLevel === "advanced" ? 999 : parseInt(e.target.value),
                };
                updateWPMRange(activeTab, activeLevel, newRange);
                updatePrizesState();
              }}
              className="bg-gray-600 px-3 py-1 rounded"
            />
          </div>
        </div>
      </div>

      {/* Level Selector */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setActiveLevel("beginner")}
          className={`px-4 py-2 rounded-lg ${
            activeLevel === "beginner"
              ? "bg-green-500 text-black"
              : "bg-gray-700 text-white"
          }`}
        >
          Principiante
        </button>
        <button
          onClick={() => setActiveLevel("advanced")}
          className={`px-4 py-2 rounded-lg ${
            activeLevel === "advanced"
              ? "bg-blue-500 text-black"
              : "bg-gray-700 text-white"
          }`}
        >
          Avanzado
        </button>
      </div>

      {/* Prize List with Create Button */}
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-white">Premios</h3>
          <button
            onClick={handleCreatePrize}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            Agregar Premio
          </button>
        </div>

        {currentPrizes.map((prize) => (
          <div key={prize.id} className="bg-gray-700 p-4 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium text-white">{prize.option}</span>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-400">
                  Prob: {(prize.probability * 100).toFixed(1)}%
                </span>
                <button
                  onClick={() => handleEditPrize(prize)}
                  className="text-blue-400 hover:text-blue-300"
                >
                  Editar
                </button>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={prize.enabled}
                    onChange={(e) => {
                      updatePrize(activeTab, activeLevel, prize.id, {
                        enabled: e.target.checked,
                      });
                      updatePrizesState();
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                </label>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isEditing && (
        <PrizeForm
          prize={editingPrize}
          onClose={() => {
            setIsEditing(false);
            setEditingPrize(null);
          }}
        />
      )}
    </div>
  );
};

export default PrizesAdmin;
