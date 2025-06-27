import React from 'react';

const UploadKYC = () => (
  <div className="max-w-md mx-auto mt-10">
    <h2 className="text-2xl font-bold mb-4">Upload KYC Documents</h2>
    <form className="space-y-4">
      <div>
        <label className="block mb-1 font-medium">Aadhaar Card</label>
        <input type="file" className="w-full p-2 border rounded" />
      </div>
      <div>
        <label className="block mb-1 font-medium">PAN Card</label>
        <input type="file" className="w-full p-2 border rounded" />
      </div>
      <button className="w-full bg-blue-600 text-white p-2 rounded">Submit Documents</button>
    </form>
  </div>
);

export default UploadKYC;