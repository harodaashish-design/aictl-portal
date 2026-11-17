import { createContext, useContext, useEffect, useState } from 'react';

const AccessibilityContext = createContext(null);

const FONT_SIZES = {
  sm: 14,
  md: 16,
  lg: 18,
};

export function AccessibilityProvider({ children }) {
  const [fontScale, setFontScale] = useState(
    () => localStorage.getItem('aicte_font_scale') || 'md'
  );
  const [highContrast, setHighContrast] = useState(
    () => localStorage.getItem('aicte_high_contrast') === 'true'
  );
  const [screenReaderMode, setScreenReaderMode] = useState(false);

  useEffect(() => {
    const html = document.documentElement;
    html.style.fontSize = `${FONT_SIZES[fontScale] || 16}px`;
    localStorage.setItem('aicte_font_scale', fontScale);
  }, [fontScale]);

  useEffect(() => {
    const html = document.documentElement;
    if (highContrast) {
      html.classList.add('high-contrast');
    } else {
      html.classList.remove('high-contrast');
    }
    localStorage.setItem('aicte_high_contrast', String(highContrast));
  }, [highContrast]);

  useEffect(() => {
    const html = document.documentElement;
    if (screenReaderMode) {
      html.classList.add('screen-reader-focus');
    } else {
      html.classList.remove('screen-reader-focus');
    }
  }, [screenReaderMode]);

  return (
    <AccessibilityContext.Provider
      value={{
        fontScale,
        setFontScale,
        highContrast,
        toggleHighContrast: () => setHighContrast((p) => !p),
        screenReaderMode,
        setScreenReaderMode,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error('useAccessibility must be used inside AccessibilityProvider');
  return ctx;
}
