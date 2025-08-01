import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, Settings, Users, FileText, MessageSquare, BarChart3 } from 'lucide-react';
import DocumentManager from './DocumentManager';
import CommentSystem from './CommentSystem';
import PlanningBoard from './PlanningBoard';
import UserSettings from './UserSettings';

type TabType = 'documents' | 'comments' | 'planning' | 'settings';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('documents');

  const tabs = [
    { id: 'documents' as TabType, label: 'Documents', icon: FileText },
    { id: 'comments' as TabType, label: 'Forum', icon: MessageSquare },
    { id: 'planning' as TabType, label: 'Planning', icon: BarChart3 },
    { id: 'settings' as TabType, label: 'Settings', icon: Settings },
  ];

  const handleLogout = () => {
    logout();
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'documents':
        return <DocumentManager />;
      case 'comments':
        return <CommentSystem />;
      case 'planning':
        return <PlanningBoard />;
      case 'settings':
        return <UserSettings />;
      default:
        return <DocumentManager />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <header className="bg-gray-800 shadow-sm border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-semibold text-white">TeamBoard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-300">
                  Welcome, {user?.username} ({user?.role})
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-700 rounded-md"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-400'
                      : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-600'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0 bg-gray-900">
          {renderTabContent()}
        </div>
      </main>
    </div>
  );
};

export default Dashboard; 