import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { gsap } from 'gsap';

const Login = () => {
    const { loginUser, isLoading } = useContext(AppContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        role: 'user' // Default to user role
    });

    const [isSubmitting, setIsSubmitting] = useState(false);

    // GSAP animations
    useEffect(() => {
        gsap.fromTo('.login-container', 
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
        );

        gsap.fromTo('.form-group', 
            { opacity: 0, x: -30 },
            { opacity: 1, x: 0, duration: 0.6, stagger: 0.1, ease: 'back.out(1.7)' }
        );

        gsap.fromTo('.role-selector', 
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.5, stagger: 0.1, ease: 'back.out(1.7)' }
        );
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRoleChange = (role) => {
        setFormData(prev => ({
            ...prev,
            role
        }));

        // Animate role change
        gsap.to('.role-selector', {
            scale: 0.95,
            duration: 0.1,
            yoyo: true,
            repeat: 1
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.email || !formData.password) {
            toast.error('Please fill in all fields');
            return;
        }

        try {
            setIsSubmitting(true);
            
            // Add role to login credentials
            const loginCredentials = {
                email: formData.email,
                password: formData.password,
                role: formData.role
            };

            await loginUser(loginCredentials);
            
            // Navigate based on role
            if (formData.role === 'admin') {
                navigate('/admin');
            } else {
                navigate('/dashboard');
            }
        } catch (error) {
            console.error('Login error:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
            <div className="login-container max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h1>
                    <p className="text-gray-600">Sign in to your account</p>
                </div>

                {/* Role Selector */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">Login as:</label>
                    <div className="flex space-x-4">
                        <button
                            type="button"
                            onClick={() => handleRoleChange('user')}
                            className={`role-selector flex-1 py-3 px-4 rounded-lg border-2 transition-all duration-200 ${
                                formData.role === 'user'
                                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                                    : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                            }`}
                        >
                            <div className="flex items-center justify-center space-x-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span className="font-medium">User</span>
                            </div>
                        </button>
                        
                        <button
                            type="button"
                            onClick={() => handleRoleChange('admin')}
                            className={`role-selector flex-1 py-3 px-4 rounded-lg border-2 transition-all duration-200 ${
                                formData.role === 'admin'
                                    ? 'border-purple-500 bg-purple-50 text-purple-700'
                                    : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                            }`}
                        >
                            <div className="flex items-center justify-center space-x-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                                </svg>
                                <span className="font-medium">Admin</span>
                            </div>
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Email Address
                        </label>
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="Enter your email"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="Enter your password"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || isLoading}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                    >
                        {isSubmitting || isLoading ? (
                            <span className="flex items-center justify-center">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Signing in...
                            </span>
                        ) : (
                            `Sign in as ${formData.role === 'admin' ? 'Admin' : 'User'}`
                        )}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <p className="text-sm text-gray-600">
                        Don't have an account?{' '}
                        <button
                            onClick={() => navigate('/register')}
                            className="text-blue-600 hover:text-blue-700 font-medium transition-colors duration-200"
                        >
                            Sign up
                        </button>
                    </p>
                </div>

                {/* Role-specific information */}
                <div className="mt-6 p-4 rounded-lg bg-gray-50">
                    <div className="text-sm text-gray-600">
                        {formData.role === 'admin' ? (
                            <div className="flex items-start space-x-2">
                                <svg className="w-5 h-5 text-purple-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <p className="font-medium text-purple-800">Admin Access</p>
                                    <p>Access to all user data, KYC applications, and system management.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-start space-x-2">
                                <svg className="w-5 h-5 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <p className="font-medium text-blue-800">User Access</p>
                                    <p>Access to your personal dashboard, KYC status, and document management.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;