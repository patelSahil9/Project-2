import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import UploadKYC from './pages/UploadKYC';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import UserDashboard from './pages/UserDashboard';
import Navbar from './components/Navbar';
import AppContextProvider from './context/AppContext';
// import Footer from './components/Footer';
import './App.css';

function App() {
  return (
    <Router>
      <AppContextProvider>
        <div className="bg-gray-50 min-h-screen">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            <Route path="/upload" element={<UploadKYC />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/dashboard" element={<UserDashboard />} />
          </Routes>
        </div>
      </AppContextProvider>
    </Router>
  );
}

export default App;

