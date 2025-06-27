import React from 'react';
import { Link } from 'react-router-dom';

const Navbar = () => (
  <nav className="bg-white shadow p-4 flex justify-between items-center">
    <h1 className="text-xl font-bold text-blue-600">BlockKYC</h1>
    <div className="space-x-4">
      <Link to="/" className="hover:text-blue-500">Home</Link>
      <Link to="/dashboard" className="hover:text-blue-500">Dashboard</Link>
      <Link to="/upload" className="hover:text-blue-500">Upload KYC</Link>
      <Link to="/profile" className="hover:text-blue-500">Profile</Link>
      <Link to="/admin" className="hover:text-blue-500">Admin</Link>
      <Link to="/login" className="hover:text-blue-500">Login</Link>
    </div>
  </nav>
);

export default Navbar;