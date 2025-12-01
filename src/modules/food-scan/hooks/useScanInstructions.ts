import { useState, useEffect } from 'react';
import { INSTRUCTIONS_KEY } from '../constants/config';

export const useScanInstructions = () => {
  const [showInstructions, setShowInstructions] = useState(false);
  const [dontShowAgain, setDontShowAgain] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(INSTRUCTIONS_KEY);
    if (!seen) setShowInstructions(true);
  }, []);

  const handleClose = () => {
    if (dontShowAgain) {
      localStorage.setItem(INSTRUCTIONS_KEY, 'true');
    }
    setShowInstructions(false);
  };

  return { showInstructions, dontShowAgain, setDontShowAgain, handleClose };
};
