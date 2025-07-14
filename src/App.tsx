import React, { useState } from 'react';
import { User, Target, Zap, ChevronRight, Eye } from 'lucide-react';
import { ProfilePage } from './components/Profile';
import WorkoutFocusPage from './components/WorkoutFocusPage';
import ReviewPage from './components/ReviewPage';
import WorkoutResultsPage from './components/WorkoutResultsPage';

type PageType = 'profile' | 'focus' | 'review' | 'results';

function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('profile');

  const pages = [
    { id: 'profile', title: 'Profile', icon: User, component: ProfilePage },
    { id: 'focus', title: 'Workout Focus', icon: Target, component: WorkoutFocusPage },
    { id: 'review', title: 'Review', icon: Eye, component: ReviewPage },
    { id: 'results', title: 'Results', icon: Zap, component: WorkoutResultsPage }
  ];

  const currentPageIndex = pages.findIndex(page => page.id === currentPage);
  const CurrentPageComponent = pages[currentPageIndex].component;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/50 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI Workout Generator
              </h1>
            </div>

            {/* Progress Indicator */}
            <div className="flex items-center space-x-2">
              {pages.map((page, index) => (
                <div key={page.id} className="flex items-center">
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                      index <= currentPageIndex 
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg' 
                        : 'bg-gray-200 text-gray-400'
                    }`}
                  >
                    <page.icon className="w-4 h-4" />
                  </div>
                  {index < pages.length - 1 && (
                    <ChevronRight className={`w-4 h-4 mx-2 transition-colors duration-300 ${
                      index < currentPageIndex ? 'text-blue-600' : 'text-gray-300'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white/60 backdrop-blur-sm border-b border-gray-200/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {pages.map((page) => {
              const isActive = currentPage === page.id;
              return (
                <button
                  key={page.id}
                  onClick={() => setCurrentPage(page.id as PageType)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-all duration-300 flex items-center space-x-2 ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <page.icon className="w-4 h-4" />
                  <span>{page.title}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="transition-all duration-500 ease-in-out">
          <CurrentPageComponent onNavigate={setCurrentPage} />
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-md border-t border-gray-200/50 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center text-sm text-gray-500">
            <p>AI-powered workout generation tailored to your fitness goals</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;