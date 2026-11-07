import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { AnalyzePage } from './pages/AnalyzePage';
import { ResultPage } from './pages/ResultPage';
import { FeedbackPage } from './pages/FeedbackPage';
import { ChatPage } from './pages/ChatPage';
import { Bot } from 'lucide-react';
import { Link } from 'react-router-dom';

// Scroll to hash or top on route change
function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [pathname, hash]);

  return null;
}

export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <ScrollManager />
        <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-[#0F172A] relative">
          <Header />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/analyze" element={<AnalyzePage />} />
              <Route path="/result" element={<ResultPage />} />
              <Route path="/chat" element={<ChatPage />} />
              <Route path="/feedback" element={<FeedbackPage />} />
              <Route path="*" element={<LandingPage />} />
            </Routes>
          </main>

          {/* Floating Assistant Launcher */}
          <Link
            to="/chat"
            className="fixed bottom-6 right-6 z-30 flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-blue-700 to-teal-700 hover:from-blue-800 hover:to-teal-800 text-white font-bold text-sm rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group no-print"
            aria-label="Open Action Path Assistant"
          >
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-white group-hover:scale-110 transition-transform" />
            </div>
            <span className="hidden sm:inline">Ask Sahayak</span>
          </Link>

          <Footer />
        </div>
      </BrowserRouter>
    </AppProvider>
  );
}
