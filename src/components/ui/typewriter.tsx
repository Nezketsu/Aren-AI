'use client'

import React, { useState, useEffect } from 'react'

interface TypewriterProps {
  text: string;
  delay?: number;
  onComplete?: () => void;
}

export const Typewriter: React.FC<TypewriterProps> = ({ 
  text, 
  delay = 30,
  onComplete 
}) => {
  const [currentText, setCurrentText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setCurrentText(prevText => prevText + text[currentIndex]);
        setCurrentIndex(prevIndex => prevIndex + 1);
      }, delay);
      
      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, delay, text, onComplete]);

  useEffect(() => {
    // Reset when text changes
    setCurrentText('');
    setCurrentIndex(0);
  }, [text]);

  return <span>{currentText}</span>;
};
