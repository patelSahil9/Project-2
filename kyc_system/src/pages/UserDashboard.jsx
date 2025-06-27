import React from 'react';

const UserDashboard = () => (
  <div className="max-w-4xl mx-auto mt-10 p-4">
    <h2 className="text-3xl font-bold mb-4">User Dashboard</h2>
    <p className="mb-6 text-gray-700">Welcome back! Here you can manage your KYC submissions and check status.</p>
    <div className="bg-white shadow-md rounded p-6">
      <h3 className="text-xl font-semibold mb-2">KYC Status</h3>
      <p>Status: <span className="font-medium text-yellow-600">Pending</span></p>
      <p>Submitted: Aadhaar, PAN</p>
    </div>
  </div>
);

export default UserDashboard;