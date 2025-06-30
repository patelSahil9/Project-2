import React, { useEffect, useRef, useState, useContext } from 'react';
import { gsap } from 'gsap';
import { AppContext } from '../context/AppContext';
import { assets } from '../assets/assets';

const Profile = () => {
  const { user, setUser } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  
  // Form states
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || '',
    address: {
      street: user?.address?.street || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      country: user?.address?.country || '',
      zipCode: user?.address?.zipCode || ''
    }
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Refs for animations
  const profileRef = useRef(null);
  const headerRef = useRef(null);
  const tabsRef = useRef(null);
  const contentRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    // Profile entrance animation
    gsap.fromTo(profileRef.current,
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
    );

    // Header animation
    gsap.fromTo(headerRef.current,
      { opacity: 0, x: -30 },
      { opacity: 1, x: 0, duration: 0.6, delay: 0.2, ease: "power2.out" }
    );

    // Tabs animation
    gsap.fromTo(tabsRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, delay: 0.4, ease: "power2.out" }
    );

    // Content animation
    gsap.fromTo(contentRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.6, delay: 0.6, ease: "power2.out" }
    );
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    
    // Tab change animation
    gsap.fromTo(contentRef.current,
      { opacity: 0, x: 20 },
      { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" }
    );
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setIsUploadingImage(true);
      
      // Simulate upload
      setTimeout(() => {
        setIsUploadingImage(false);
        // Here you would typically upload to your backend
        const reader = new FileReader();
        reader.onload = (e) => {
          setUser(prev => ({ ...prev, profileImage: e.target.result }));
        };
        reader.readAsDataURL(file);
      }, 2000);
    }
  };

  const handleSave = () => {
    setIsEditing(false);
    // Here you would typically save to your backend
    setUser(prev => ({ ...prev, ...formData }));
    
    // Success animation
    gsap.to(contentRef.current, {
      scale: 1.02,
      duration: 0.2,
      ease: "power2.out",
      yoyo: true,
      repeat: 1
    });
  };

  const handlePasswordChange = () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    
    setIsChangingPassword(false);
    setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    
    // Success animation
    gsap.to(contentRef.current, {
      scale: 1.02,
      duration: 0.2,
      ease: "power2.out",
      yoyo: true,
      repeat: 1
    });
  };

  const getKYCStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'submitted': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getKYCStatusIcon = (status) => {
    switch (status) {
      case 'approved': return '✅';
      case 'pending': return '⏳';
      case 'rejected': return '❌';
      case 'submitted': return '📋';
      default: return '📝';
    }
  };

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Profile Header */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <div className="flex items-center space-x-6">
          <div className="relative">
            <img
              ref={imageRef}
              src={user?.profileImage || assets.profile_icon}
              alt="Profile"
              className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
            />
            <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
              📷
            </label>
            {isUploadingImage && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-800">{user?.name || 'User Name'}</h3>
            <p className="text-gray-600">{user?.email || 'user@example.com'}</p>
            <div className="flex items-center mt-2">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getKYCStatusColor(user?.kycStatus || 'not_started')}`}>
                {getKYCStatusIcon(user?.kycStatus || 'not_started')} 
                {user?.kycStatus?.toUpperCase() || 'NOT STARTED'}
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h4 className="text-xl font-semibold mb-4 text-gray-800">Personal Information</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900">{user?.name || 'Not provided'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <p className="text-gray-900">{user?.email || 'Not provided'}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            {isEditing ? (
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900">{user?.phone || 'Not provided'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            {isEditing ? (
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900">{user?.dateOfBirth || 'Not provided'}</p>
            )}
          </div>
        </div>
        
        {isEditing && (
          <div className="mt-4 flex gap-2">
            <button
              onClick={handleSave}
              className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
            >
              Save Changes
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}
      </div>

      {/* Address Information */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h4 className="text-xl font-semibold mb-4 text-gray-800">Address Information</h4>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.address.street}
                onChange={(e) => setFormData({
                  ...formData, 
                  address: {...formData.address, street: e.target.value}
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900">{user?.address?.street || 'Not provided'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.address.city}
                onChange={(e) => setFormData({
                  ...formData, 
                  address: {...formData.address, city: e.target.value}
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900">{user?.address?.city || 'Not provided'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.address.state}
                onChange={(e) => setFormData({
                  ...formData, 
                  address: {...formData.address, state: e.target.value}
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900">{user?.address?.state || 'Not provided'}</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
            {isEditing ? (
              <input
                type="text"
                value={formData.address.country}
                onChange={(e) => setFormData({
                  ...formData, 
                  address: {...formData.address, country: e.target.value}
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            ) : (
              <p className="text-gray-900">{user?.address?.country || 'Not provided'}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderDocuments = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h4 className="text-xl font-semibold mb-4 text-gray-800">KYC Documents</h4>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Aadhaar Card */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <div className="text-3xl mb-2">🆔</div>
            <h5 className="font-semibold text-gray-800 mb-2">Aadhaar Card</h5>
            <p className="text-sm text-gray-600 mb-3">Upload your Aadhaar card for identity verification</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Upload Document
            </button>
          </div>

          {/* PAN Card */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <div className="text-3xl mb-2">📄</div>
            <h5 className="font-semibold text-gray-800 mb-2">PAN Card</h5>
            <p className="text-sm text-gray-600 mb-3">Upload your PAN card for tax verification</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Upload Document
            </button>
          </div>

          {/* Address Proof */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <div className="text-3xl mb-2">🏠</div>
            <h5 className="font-semibold text-gray-800 mb-2">Address Proof</h5>
            <p className="text-sm text-gray-600 mb-3">Upload utility bill or bank statement</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Upload Document
            </button>
          </div>

          {/* Profile Image */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <div className="text-3xl mb-2">📸</div>
            <h5 className="font-semibold text-gray-800 mb-2">Profile Image</h5>
            <p className="text-sm text-gray-600 mb-3">Upload a clear photo of yourself</p>
            <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Upload Photo
            </button>
          </div>
        </div>
      </div>

      {/* Document Status */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h4 className="text-xl font-semibold mb-4 text-gray-800">Document Status</h4>
        <div className="space-y-3">
          {[
            { name: 'Aadhaar Card', status: 'uploaded', verified: true },
            { name: 'PAN Card', status: 'uploaded', verified: true },
            { name: 'Address Proof', status: 'pending', verified: false },
            { name: 'Profile Image', status: 'uploaded', verified: true }
          ].map((doc, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className={`w-3 h-3 rounded-full ${doc.verified ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                <span className="font-medium text-gray-800">{doc.name}</span>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                doc.status === 'uploaded' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {doc.status === 'uploaded' ? 'Uploaded' : 'Pending'}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6">
      {/* Password Change */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h4 className="text-xl font-semibold mb-4 text-gray-800">Change Password</h4>
        {isChangingPassword ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input
                type="password"
                value={passwordData.currentPassword}
                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={passwordData.newPassword}
                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={passwordData.confirmPassword}
                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handlePasswordChange}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Update Password
              </button>
              <button
                onClick={() => setIsChangingPassword(false)}
                className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setIsChangingPassword(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Change Password
          </button>
        )}
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h4 className="text-xl font-semibold mb-4 text-gray-800">Two-Factor Authentication</h4>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-800 font-medium">SMS Authentication</p>
            <p className="text-sm text-gray-600">Receive codes via SMS</p>
          </div>
          <button className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors">
            Enable
          </button>
        </div>
      </div>

      {/* Login Sessions */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h4 className="text-xl font-semibold mb-4 text-gray-800">Active Sessions</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-800">Current Session</p>
              <p className="text-sm text-gray-600">Chrome on Windows • Last active: 2 minutes ago</p>
            </div>
            <span className="text-green-600 text-sm font-medium">Active</span>
          </div>
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-800">Mobile Session</p>
              <p className="text-sm text-gray-600">Safari on iPhone • Last active: 1 hour ago</p>
            </div>
            <button className="text-red-600 text-sm font-medium hover:text-red-800">
              Terminate
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const renderActivity = () => (
    <div className="space-y-6">
      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h4 className="text-xl font-semibold mb-4 text-gray-800">Recent Activity</h4>
        <div className="space-y-4">
          {[
            { action: 'Profile updated', time: '2 hours ago', type: 'profile' },
            { action: 'Password changed', time: '1 day ago', type: 'security' },
            { action: 'KYC application submitted', time: '3 days ago', type: 'kyc' },
            { action: 'Document uploaded', time: '1 week ago', type: 'document' },
            { action: 'Account created', time: '2 weeks ago', type: 'account' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${
                activity.type === 'profile' ? 'bg-blue-500' :
                activity.type === 'security' ? 'bg-red-500' :
                activity.type === 'kyc' ? 'bg-green-500' :
                activity.type === 'document' ? 'bg-purple-500' : 'bg-gray-500'
              }`}>
                {activity.type === 'profile' ? '👤' :
                 activity.type === 'security' ? '🔒' :
                 activity.type === 'kyc' ? '📋' :
                 activity.type === 'document' ? '📄' : '⚙️'}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">{activity.action}</p>
                <p className="text-sm text-gray-600">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Account Statistics */}
      <div className="bg-white rounded-xl p-6 shadow-lg">
        <h4 className="text-xl font-semibold mb-4 text-gray-800">Account Statistics</h4>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">15</div>
            <div className="text-sm text-gray-600">Days Active</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">3</div>
            <div className="text-sm text-gray-600">Documents Uploaded</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">2</div>
            <div className="text-sm text-gray-600">Active Sessions</div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div ref={profileRef} className="max-w-6xl mx-auto mt-10 p-4">
      {/* Header */}
      <div ref={headerRef} className="mb-8">
        <h2 className="text-3xl font-bold text-gray-800 mb-2">Profile Settings</h2>
        <p className="text-gray-600">Manage your account information and preferences</p>
      </div>

      {/* Tabs */}
      <div ref={tabsRef} className="bg-white rounded-xl shadow-lg mb-6">
        <div className="flex border-b border-gray-200">
          {[
            { id: 'overview', label: 'Overview', icon: '👤' },
            { id: 'documents', label: 'Documents', icon: '📄' },
            { id: 'security', label: 'Security', icon: '🔒' },
            { id: 'activity', label: 'Activity', icon: '📊' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div ref={contentRef}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'documents' && renderDocuments()}
        {activeTab === 'security' && renderSecurity()}
        {activeTab === 'activity' && renderActivity()}
      </div>
    </div>
  );
};

export default Profile;