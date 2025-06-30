import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { gsap } from 'gsap';

const UserDashboard = () => {
    const { user, kycApplication, logout, isLoading } = useContext(AppContext);
    const navigate = useNavigate();

    const [userStats, setUserStats] = useState({
        totalDocuments: 0,
        verifiedDocuments: 0,
        pendingDocuments: 0
    });

    // Check if user is logged in
    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        if (user.role === 'admin') {
            navigate('/admin');
            return;
        }

        calculateUserStats();
    }, [user, kycApplication, navigate]);

    // GSAP animations
    useEffect(() => {
        gsap.fromTo('.dashboard-container', 
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
        );

        gsap.fromTo('.stats-card', 
            { opacity: 0, scale: 0.8 },
            { opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: 'back.out(1.7)' }
        );
    }, []);

    const calculateUserStats = () => {
        if (!kycApplication) return;

        const documents = kycApplication.documents || {};
        const totalDocs = Object.keys(documents).length;
        const verifiedDocs = Object.values(documents).filter(doc => doc.verified).length;
        const pendingDocs = totalDocs - verifiedDocs;

        setUserStats({
            totalDocuments: totalDocs,
            verifiedDocuments: verifiedDocs,
            pendingDocuments: pendingDocs
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'submitted': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'pending':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
            case 'approved':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                );
            case 'rejected':
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                );
            default:
                return (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                );
        }
    };

    const getDocumentStatus = (document) => {
        if (!document || !document.url) {
            return { status: 'not_uploaded', color: 'bg-gray-100 text-gray-800', text: 'Not Uploaded' };
        }
        if (document.verified) {
            return { status: 'verified', color: 'bg-green-100 text-green-800', text: 'Verified' };
        }
        return { status: 'uploaded', color: 'bg-blue-100 text-blue-800', text: 'Uploaded' };
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-2xl font-bold text-gray-900">User Dashboard</h1>
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                                User Panel
                            </span>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-sm text-gray-600">
                                Welcome, {user?.firstName} {user?.lastName}
                            </span>
                            <button
                                onClick={logout}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="dashboard-container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* User Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="stats-card bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Documents</p>
                                <p className="text-2xl font-bold text-gray-900">{userStats.totalDocuments}</p>
                            </div>
                        </div>
                    </div>

                    <div className="stats-card bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Verified Documents</p>
                                <p className="text-2xl font-bold text-gray-900">{userStats.verifiedDocuments}</p>
                            </div>
                        </div>
                    </div>

                    <div className="stats-card bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-3 bg-yellow-100 rounded-lg">
                                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Pending Documents</p>
                                <p className="text-2xl font-bold text-gray-900">{userStats.pendingDocuments}</p>
                            </div>
                        </div>
                    </div>

                    <div className="stats-card bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                        <div className="flex items-center">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">KYC Status</p>
                                <p className="text-lg font-bold text-gray-900 capitalize">
                                    {kycApplication?.status || 'Not Started'}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* KYC Status Card */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">KYC Application Status</h2>
                        {kycApplication?.status === 'pending' && (
                            <button
                                onClick={() => navigate('/upload-kyc')}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                            >
                                Complete KYC
                            </button>
                        )}
                    </div>

                    {kycApplication ? (
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                <div className="flex items-center space-x-3">
                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(kycApplication.status)}`}>
                                        {getStatusIcon(kycApplication.status)}
                                        <span className="ml-1 capitalize">{kycApplication.status}</span>
                                    </span>
                                    <span className="text-sm text-gray-600">
                                        Submitted on {new Date(kycApplication.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                                {kycApplication.status === 'rejected' && kycApplication.remarks && (
                                    <div className="text-sm text-red-600">
                                        <strong>Remarks:</strong> {kycApplication.remarks}
                                    </div>
                                )}
                            </div>

                            {kycApplication.status === 'approved' && (
                                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                                    <div className="flex items-center">
                                        <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span className="text-green-800 font-medium">
                                            Your KYC has been approved! You can now access all features.
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">No KYC Application Found</h3>
                            <p className="text-gray-600 mb-4">Start your KYC verification process to access all features.</p>
                            <button
                                onClick={() => navigate('/upload-kyc')}
                                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                            >
                                Start KYC Process
                            </button>
                        </div>
                    )}
                </div>

                {/* Documents Section */}
                {kycApplication && (
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-8 border border-gray-200">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6">Your Documents</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { key: 'identityProof', label: 'Identity Proof', description: 'Passport, Driver\'s License, or National ID' },
                                { key: 'addressProof', label: 'Address Proof', description: 'Utility bill, Bank statement, or Rental agreement' },
                                { key: 'incomeProof', label: 'Income Proof', description: 'Salary slip, Tax returns, or Employment letter' },
                                { key: 'bankStatement', label: 'Bank Statement', description: 'Last 3 months bank statements' }
                            ].map(({ key, label, description }) => {
                                const document = kycApplication.documents?.[key];
                                const docStatus = getDocumentStatus(document);
                                
                                return (
                                    <div key={key} className="border rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900 mb-1">{label}</h3>
                                                <p className="text-sm text-gray-600">{description}</p>
                                            </div>
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${docStatus.color}`}>
                                                {docStatus.text}
                                            </span>
                                        </div>
                                        
                                        {document?.url ? (
                                            <div className="space-y-3">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600">File:</span>
                                                    <span className="font-medium">{document.originalName}</span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600">Size:</span>
                                                    <span className="font-medium">
                                                        {(document.fileSize / 1024 / 1024).toFixed(2)} MB
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between text-sm">
                                                    <span className="text-gray-600">Uploaded:</span>
                                                    <span className="font-medium">
                                                        {new Date(document.uploadedAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                                <div className="flex space-x-2">
                                                    <a
                                                        href={document.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex-1 px-3 py-2 bg-blue-600 text-white text-center rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
                                                    >
                                                        View Document
                                                    </a>
                                                    <button
                                                        onClick={() => navigate('/upload-kyc')}
                                                        className="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm"
                                                    >
                                                        Replace
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="text-center py-4">
                                                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                    </svg>
                                                </div>
                                                <p className="text-sm text-gray-600 mb-3">Document not uploaded</p>
                                                <button
                                                    onClick={() => navigate('/upload-kyc')}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm"
                                                >
                                                    Upload Now
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Quick Actions */}
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-900 mb-6">Quick Actions</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <button
                            onClick={() => navigate('/upload-kyc')}
                            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all duration-200 text-center"
                        >
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                            </div>
                            <h3 className="font-medium text-gray-900 mb-1">Upload Documents</h3>
                            <p className="text-sm text-gray-600">Upload or update your KYC documents</p>
                        </button>

                        <button
                            onClick={() => navigate('/profile')}
                            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-all duration-200 text-center"
                        >
                            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                            <h3 className="font-medium text-gray-900 mb-1">Update Profile</h3>
                            <p className="text-sm text-gray-600">Manage your personal information</p>
                        </button>

                        <button
                            onClick={() => window.open('mailto:support@kycsystem.com', '_blank')}
                            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-all duration-200 text-center"
                        >
                            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <h3 className="font-medium text-gray-900 mb-1">Contact Support</h3>
                            <p className="text-sm text-gray-600">Get help with your KYC process</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDashboard;