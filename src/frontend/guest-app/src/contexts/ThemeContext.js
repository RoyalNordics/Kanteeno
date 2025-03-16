import React, { createContext, useState, useContext, useEffect } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material';
import { lightTheme, darkTheme } from '../theme';

// Create the theme context
const ThemeContext = createContext();

// Custom hook to use the theme context
export const useAppTheme = () => {
  return useContext(ThemeContext);
};

export const ThemeProvider = ({ children }) => {
  // Check if user has a saved theme preference
  const getSavedTheme = () => {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme === 'dark' ? 'dark' : 'light';
  };
  
  const [themeMode, setThemeMode] = useState(getSavedTheme());
  const [theme, setTheme] = useState(themeMode === 'dark' ? darkTheme : lightTheme);
  
  // Toggle between light and dark themes
  const toggleTheme = () => {
    const newThemeMode = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newThemeMode);
    localStorage.setItem('theme', newThemeMode);
  };
  
  // Update theme when themeMode changes
  useEffect(() => {
    setTheme(themeMode === 'dark' ? darkTheme : lightTheme);
  }, [themeMode]);
  
  // Value to be provided by the context
  const value = {
    themeMode,
    toggleTheme,
    isDarkMode: themeMode === 'dark',
  };
  
  return (
    <ThemeContext.Provider value={value}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
