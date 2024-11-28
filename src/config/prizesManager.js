// Simplified default prizes configuration
const DEFAULT_PRIZES = {
  easy: {
    beginner: {
      wpmRange: { min: 0, max: 60 },
      prizes: [
        { 
          id: 'mousepad_1',
          option: '¡Premio! 🎮 Mousepad',
          probability: 0.15,
          enabled: true
        },
        { 
          id: 'no_prize_1',
          option: 'Suerte la próxima',
          probability: 0.85,
          enabled: true
        }
      ]
    },
    advanced: {
      wpmRange: { min: 61, max: 999 },
      prizes: [
        { 
          id: 'keycap_1',
          option: '¡Premio! ⌨️ Keycap RGB',
          probability: 0.10,
          enabled: true
        },
        { 
          id: 'no_prize_2',
          option: 'Suerte la próxima',
          probability: 0.90,
          enabled: true
        }
      ]
    }
  },
  hard: {
    beginner: {
      wpmRange: { min: 0, max: 60 },
      prizes: [
        { 
          id: 'keycap_premium_1',
          option: '¡Premio! ⌨️ Keycap Premium',
          probability: 0.10,
          enabled: true
        },
        { 
          id: 'no_prize_3',
          option: 'Suerte la próxima',
          probability: 0.90,
          enabled: true
        }
      ]
    },
    advanced: {
      wpmRange: { min: 61, max: 999 },
      prizes: [
        { 
          id: 'keyboard_1',
          option: '¡Premio! ⌨️ Teclado Gaming',
          probability: 0.05,
          enabled: true
        },
        { 
          id: 'no_prize_4',
          option: 'Suerte la próxima',
          probability: 0.95,
          enabled: true
        }
      ]
    }
  }
};

// Initialize prizes in localStorage
export const initializePrizes = () => {
  if (!localStorage.getItem('prizes')) {
    localStorage.setItem('prizes', JSON.stringify(DEFAULT_PRIZES));
  }
  return getPrizes();
};

// Get all prizes
export const getPrizes = () => {
  const prizes = localStorage.getItem('prizes');
  console.log('Getting prizes from localStorage:', prizes);
  if (!prizes) {
    console.log('No prizes found, initializing...');
    return initializePrizes();
  }
  return JSON.parse(prizes);
};

// Update WPM range
export const updateWPMRange = (difficulty, level, range) => {
  const prizes = getPrizes();
  if (!prizes[difficulty]) {
    prizes[difficulty] = DEFAULT_PRIZES[difficulty];
  }
  if (!prizes[difficulty][level]) {
    prizes[difficulty][level] = DEFAULT_PRIZES[difficulty][level];
  }
  prizes[difficulty][level].wpmRange = range;
  localStorage.setItem('prizes', JSON.stringify(prizes));
};

// Update prize
export const updatePrize = (difficulty, level, prizeId, updates) => {
  const prizes = getPrizes();
  if (!prizes[difficulty] || !prizes[difficulty][level]) return;
  
  const prizeIndex = prizes[difficulty][level].prizes.findIndex(p => p.id === prizeId);
  
  if (prizeIndex !== -1) {
    prizes[difficulty][level].prizes[prizeIndex] = {
      ...prizes[difficulty][level].prizes[prizeIndex],
      ...updates
    };
    localStorage.setItem('prizes', JSON.stringify(prizes));
    return prizes;
  }
  return null;
};

// Reset prizes to default
export const resetPrizes = () => {
  localStorage.setItem('prizes', JSON.stringify(DEFAULT_PRIZES));
  return DEFAULT_PRIZES;
};

// Get prizes by difficulty and WPM
export const getPrizesByDifficultyAndWPM = (difficulty, wpm = 0) => {
  console.log('Getting prizes for:', { difficulty, wpm });
  
  const prizes = getPrizes();
  const difficultyPrizes = prizes[difficulty];
  
  if (!difficultyPrizes) {
    console.warn(`No prizes found for difficulty: ${difficulty}`);
    return [
      {
        id: 'default_no_prize',
        option: 'Suerte la próxima',
        probability: 1,
        enabled: true
      }
    ];
  }

  // Default to 'beginner' if WPM is 0 or undefined
  if (!wpm) {
    console.log('WPM is undefined or 0, defaulting to beginner prizes');
    return difficultyPrizes.beginner.prizes.filter(prize => prize.enabled);
  }

  // Find the appropriate level based on WPM range
  const level = Object.keys(difficultyPrizes).find(key => {
    const range = difficultyPrizes[key].wpmRange;
    return wpm >= range.min && wpm <= range.max;
  });

  console.log('Found level:', level);

  if (!level || !difficultyPrizes[level].prizes) {
    console.warn(`No prizes found for level with WPM: ${wpm}`);
    return [
      {
        id: 'default_no_prize',
        option: 'Suerte la próxima',
        probability: 1,
        enabled: true
      }
    ];
  }

  const enabledPrizes = difficultyPrizes[level].prizes.filter(prize => prize.enabled);
  console.log('Enabled prizes:', enabledPrizes);
  
  // If no enabled prizes, return default
  if (enabledPrizes.length === 0) {
    return [
      {
        id: 'default_no_prize',
        option: 'Suerte la próxima',
        probability: 1,
        enabled: true
      }
    ];
  }

  return enabledPrizes;
};

// Create prize
export const createPrize = (difficulty, level, newPrize) => {
  console.log('Creating prize:', { difficulty, level, newPrize });
  const prizes = getPrizes();
  console.log('Current prizes state:', prizes);
  
  // Ensure the structure exists
  if (!prizes[difficulty]) {
    console.log('Creating difficulty structure');
    prizes[difficulty] = {};
  }
  
  if (!prizes[difficulty][level]) {
    console.log('Creating level structure');
    prizes[difficulty][level] = {
      wpmRange: { min: 0, max: level === 'advanced' ? 999 : 60 },
      prizes: []
    };
  }

  if (!prizes[difficulty][level].prizes) {
    console.log('Initializing prizes array');
    prizes[difficulty][level].prizes = [];
  }

  // Validate the new prize object
  if (!newPrize.id || !newPrize.option || typeof newPrize.probability !== 'number') {
    console.error('Invalid prize object:', newPrize);
    return null;
  }

  // Add the new prize
  prizes[difficulty][level].prizes.push(newPrize);
  console.log('Updated prizes structure:', prizes);
  
  try {
    // Save to localStorage
    localStorage.setItem('prizes', JSON.stringify(prizes));
    console.log('Successfully saved to localStorage');
    return prizes;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return null;
    
  }
}; 