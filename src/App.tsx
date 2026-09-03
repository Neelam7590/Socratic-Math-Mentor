import { useState, useEffect } from 'react';
import { MathGPTInterface } from './components/MathGPTInterface.js';
import type { UserSettings } from './types.js';

const INITIAL_SETTINGS: UserSettings = {
  learningLevel: 'intro_college',
  theme: 'light',
  language: 'en',
  soundEnabled: true,
};

export default function App() {
  const [settings, setSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem('mathgpt_settings');
      return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
    } catch {
      return INITIAL_SETTINGS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('mathgpt_settings', JSON.stringify(settings));
    } catch (e) {
      console.error(e);
    }
  }, [settings]);

  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  }, [settings.theme]);

  return (
    <MathGPTInterface
      settings={settings}
      onUpdateSettings={setSettings}
    />
  );
}
