import React from 'react';

const AdminDashboard = () => (
  <div className="p-6">
    <h2 className="text-3xl font-bold mb-6">Admin Dashboard</h2>
    <table className="w-full border">
      <thead>
        <tr className="bg-gray-200">
          <th className="p-2">User</th>
          <th className="p-2">Document</th>
          <th className="p-2">Status</th>
          <th className="p-2">Action</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td className="p-2">john@example.com</td>
          <td className="p-2">Aadhaar.pdf</td>
          <td className="p-2">Pending</td>
          <td className="p-2">
            <button className="bg-green-500 text-white px-3 py-1 rounded mr-2">Approve</button>
            <button className="bg-red-500 text-white px-3 py-1 rounded">Reject</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
);

export default AdminDashboard;