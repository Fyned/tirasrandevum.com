import React, { createContext, useEffect } from 'react';

const ThemeContext = createContext();

const ThemeProvider = ({ children }) => {
  // Set a fixed theme to 'grey'. No more light/dark toggle.
  const theme = 'grey';

  useEffect(() => {
    const root = window.document.documentElement;
    // Clean up old classes and add the new fixed theme class
    root.classList.remove('dark', 'light');
    root.classList.add('theme-grey');
  }, []);

  // Provide a placeholder function for compatibility, but it does nothing.
  const toggleTheme = () => {
    console.log("Theme is fixed and cannot be changed.");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export { ThemeContext, ThemeProvider };