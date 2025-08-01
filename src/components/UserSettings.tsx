import React, { useState, useEffect } from 'react';
import { Settings, Bell, User, Palette } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  notifications: boolean;
  layout: 'compact' | 'comfortable';
  autoSave: boolean;
}

const UserSettings: React.FC = () => {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<UserPreferences>({
    theme: 'light',
    notifications: true,
    layout: 'comfortable',
    autoSave: true
  });

  // Load preferences from localStorage
  useEffect(() => {
    const savedPrefs = localStorage.getItem('teamboard_preferences');
    if (savedPrefs) {
      setPreferences(JSON.parse(savedPrefs));
    }
  }, []);

  // Save preferences to localStorage
  useEffect(() => {
    localStorage.setItem('teamboard_preferences', JSON.stringify(preferences));
  }, [preferences]);

  const handlePreferenceChange = <K extends keyof UserPreferences>(key: K, value: UserPreferences[K]) => {
    setPreferences(prev => ({ ...prev, [key]: value }));
  };

  const applyTheme = (theme: UserPreferences['theme']) => {
    const root = document.documentElement;
    if (theme === 'dark' || (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  useEffect(() => {
    applyTheme(preferences.theme);
  }, [preferences.theme]);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Settings className="h-6 w-6 text-gray-600" />
        <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Profile */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <User className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">Profile</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Username</label>
              <input
                type="text"
                value={user?.username || ''}
                disabled
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Role</label>
              <input
                type="text"
                value={user?.role || ''}
                disabled
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Appearance */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <Palette className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">Appearance</h3>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Theme</label>
              <select
                value={preferences.theme}
                onChange={(e) => handlePreferenceChange('theme', e.target.value as UserPreferences['theme'])}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto (System)</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Layout</label>
              <select
                value={preferences.layout}
                onChange={(e) => handlePreferenceChange('layout', e.target.value as UserPreferences['layout'])}
                className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
              >
                <option value="comfortable">Comfortable</option>
                <option value="compact">Compact</option>
              </select>
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <Bell className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Enable Notifications</label>
                <p className="text-xs text-gray-500">Receive updates about comments and tasks</p>
              </div>
              <button
                onClick={() => handlePreferenceChange('notifications', !preferences.notifications)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.notifications ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.notifications ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Data & Storage */}
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center space-x-3 mb-4">
            <Settings className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-medium text-gray-900">Data & Storage</h3>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-sm font-medium text-gray-700">Auto Save</label>
                <p className="text-xs text-gray-500">Automatically save changes</p>
              </div>
              <button
                onClick={() => handlePreferenceChange('autoSave', !preferences.autoSave)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.autoSave ? 'bg-primary-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.autoSave ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <button
                onClick={() => {
                  localStorage.clear();
                  window.location.reload();
                }}
                className="w-full px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Clear All Data
              </button>
              <p className="text-xs text-gray-500 mt-2">
                This will clear all stored data and reset the application
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* About */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 mb-4">About TeamBoard</h3>
        <div className="space-y-2 text-sm text-gray-600">
          <p>Version: 1.0.0</p>
          <p>A collaborative planning tool for teams</p>
          <p>Built with React, TypeScript, and Tailwind CSS</p>
        </div>
      </div>
    </div>
  );
};

export default UserSettings; 