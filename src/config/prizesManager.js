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

// Add this helper function at the top after DEFAULT_PRIZES
const calculateChecksum = (data) => {
  const str = JSON.stringify(data);
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return hash.toString();
};

// Add more system-looking keys
const APP_STATE_KEY = '_app_state';
const STATE_HASH_KEY = '_state_hash';
const BACKUP_KEY = '_sys_conf_23x';
const BACKUP_PREFIX = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.'; // Looks like a JWT token prefix

// Modify saveWithChecksum to handle Unicode characters
const saveWithChecksum = (prizes) => {
  try {
    // Add system-looking noise data before prizes
    const noiseData = {
      _v: "3.2.1",
      _t: Date.now(),
      _sys: {
        env: "production",
        platform: navigator.platform,
        vendor: navigator.vendor,
        rendering_engine: "webkit",
        capabilities: {
          webgl: true,
          webgl2: true,
          canvas2d: true
        }
      },
      _metrics: {
        fps: 60,
        memory: "stable",
        network: "online"
      },
      _session: {
        id: Math.random().toString(36).substring(7),
        start: new Date().toISOString(),
        type: "user_session_v2"
      },
      // Hide the real data in the middle
      _cfg: prizes,
      // Add more noise data after prizes
      _perf: {
        loadTime: Math.random() * 1000,
        resources: {
          images: Math.floor(Math.random() * 20),
          scripts: Math.floor(Math.random() * 10),
          styles: Math.floor(Math.random() * 5)
        },
        metrics: {
          fcp: Math.random() * 2000,
          lcp: Math.random() * 3000,
          cls: Math.random(),
          fid: Math.random() * 100
        }
      },
      _debug: {
        enabled: false,
        level: "production",
        flags: {
          experimental: false,
          beta_features: false
        }
      },
      _cache: {
        version: "2.1.0",
        lastUpdate: new Date().toISOString(),
        status: "valid"
      }
    };

    // Save main state with checksum
    const checksum = calculateChecksum(noiseData);
    localStorage.setItem(APP_STATE_KEY, JSON.stringify(noiseData));
    localStorage.setItem(STATE_HASH_KEY, checksum);

    // Create backup with different structure
    const backupNoiseData = {
      sysInfo: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      timestamp: Date.now(),
      sessionData: "encrypted_session_data_v2",
      configVersion: "3.2.1",
      userPrefs: { theme: "dark", lang: "es-419", region: "LATAM" },
      analytics: {
        sessionDuration: Math.floor(Math.random() * 3600),
        interactions: Math.floor(Math.random() * 100),
        performance: {
          cpu: "normal",
          memory: "optimal",
          network: "stable"
        }
      },
      _d: prizes,
      security: {
        encryption: "aes-256-gcm",
        integrity: "sha256",
        timestamp: Date.now()
      }
    };
    
    // Use encodeURIComponent to handle Unicode characters
    const obfuscatedData = BACKUP_PREFIX + btoa(encodeURIComponent(JSON.stringify(backupNoiseData)));
    localStorage.setItem(BACKUP_KEY, obfuscatedData);

    console.log('Configuration saved successfully');
    return true;
  } catch (error) {
    console.error('Failed to save configuration:', error);
    return false;
  }
};

// Update getBackup to handle the encoding
const getBackup = () => {
  try {
    const obfuscatedData = localStorage.getItem(BACKUP_KEY);
    if (!obfuscatedData || !obfuscatedData.startsWith(BACKUP_PREFIX)) {
      return null;
    }
    
    const decoded = JSON.parse(decodeURIComponent(atob(obfuscatedData.replace(BACKUP_PREFIX, ''))));
    return decoded._d;
  } catch (error) {
    console.error('Configuration retrieval failed:', error);
    return null;
  }
};

// Update resetPrizes to clear all keys
export const resetPrizes = () => {
  localStorage.removeItem(BACKUP_KEY);
  localStorage.removeItem(APP_STATE_KEY);
  localStorage.removeItem(STATE_HASH_KEY);
  saveWithChecksum(DEFAULT_PRIZES);
  return DEFAULT_PRIZES;
};

// Update getPrizes to handle the noise data
export const getPrizes = () => {
  const state = localStorage.getItem(APP_STATE_KEY);
  const storedChecksum = localStorage.getItem(STATE_HASH_KEY);
  
  if (!state || !storedChecksum) {
    console.log('Initializing application state...');
    return initializePrizes();
  }

  try {
    const parsedState = JSON.parse(state);
    const currentChecksum = calculateChecksum(parsedState);

    if (currentChecksum !== storedChecksum) {
      console.warn('State integrity check failed, restoring configuration...');
      const backup = getBackup();
      if (backup) {
        saveWithChecksum(backup);
        return backup;
      }
      return resetPrizes();
    }

    // Extract real data from noise
    return parsedState._cfg;
  } catch (error) {
    console.error('State parsing failed, restoring from backup...');
    const backup = getBackup();
    if (backup) {
      saveWithChecksum(backup);
      return backup;
    }
    return resetPrizes();
  }
};

// Update initializePrizes to use new structure
export const initializePrizes = () => {
  if (!localStorage.getItem(APP_STATE_KEY)) {
    saveWithChecksum(DEFAULT_PRIZES);
  }
  return getPrizes();
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
  saveWithChecksum(prizes);
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
    saveWithChecksum(prizes);
    return prizes;
  }
  return null;
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
    saveWithChecksum(prizes);
    console.log('Successfully saved to localStorage');
    return prizes;
  } catch (error) {
    console.error('Error saving to localStorage:', error);
    return null;
    
  }
}; 