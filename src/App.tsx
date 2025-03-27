import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './pages/LandingPage';
import ForYouPage from './pages/ForYouPage';
import ProfilePage from './pages/ProfilePage';
import ChatPage from './pages/ChatPage';
import AuthPage from './pages/AuthPage';
import AccountPage from './pages/AccountPage';
import FavoritesPage from './pages/FavoritesPage';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50">
          <Navbar />
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/for-you" element={<ForYouPage />} />
            <Route path="/profile/:id" element={<ProfilePage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/account" element={<AccountPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;