import React from 'react';

const Login = () => (
  <div className="max-w-md mx-auto mt-10">
    <h2 className="text-2xl font-bold mb-4">Login</h2>
    <form className="space-y-4">
      <input className="w-full p-2 border rounded" type="email" placeholder="Email" />
      <input className="w-full p-2 border rounded" type="password" placeholder="Password" />
      <button className="w-full bg-blue-600 text-white p-2 rounded">Login</button>
    </form>
  </div>
);

export default Login;