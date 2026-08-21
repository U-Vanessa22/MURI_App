import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

const ThemeContext = createContext(undefined);

export const ThemeModeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('asm_dark_mode');
    setDarkMode(savedTheme === 'true');
  }, []);

  useEffect(() => {
    localStorage.setItem('asm_dark_mode', String(darkMode));
    document.body.classList.toggle('asm-dark', darkMode);
  }, [darkMode]);

  const value = useMemo(
    () => ({
      darkMode,
      toggleDarkMode: () => setDarkMode((prev) => !prev),
      setDarkMode,
    }),
    [darkMode]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useThemeMode = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeMode must be used within ThemeModeProvider');
  }
  return context;
};
