import React from 'react';

const Profile = () => (
  <div className="max-w-md mx-auto mt-10">
    <h2 className="text-2xl font-bold mb-4">Your Profile</h2>
    <div className="space-y-2">
      <p><strong>Name:</strong> John Doe</p>
      <p><strong>Email:</strong> john@example.com</p>
      <p><strong>KYC Status:</strong> Verified</p>
    </div>
  </div>
);

export default Profile;