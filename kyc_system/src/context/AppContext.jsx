import { createContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

export const AppContext = createContext()

const API_BASE_URL = 'http://localhost:5000/api';

const AppContextProvider = (props) => {
    const [user, setUser] = useState(null);
    const [showLogin, setShowLogin] = useState(false);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [kycApplication, setKycApplication] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate()

    // API helper function
    const apiCall = async (endpoint, options = {}) => {
        const url = `${API_BASE_URL}${endpoint}`;
        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
                ...options.headers
            },
            ...options
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || 'API request failed');
            }
            
            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    };

    // Load user data and KYC application
    const loadUserData = async () => {
        if (!token) return;

        try {
            setIsLoading(true);
            
            // Get user profile
            const userData = await apiCall('/auth/me');
            setUser(userData.data);

            // Get KYC application if exists
            try {
                const kycData = await apiCall('/kyc/my-application');
                setKycApplication(kycData.data);
            } catch (error) {
                // No KYC application exists yet
                setKycApplication(null);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
            if (error.message.includes('token')) {
                logout();
            }
        } finally {
            setIsLoading(false);
        }
    };

    // Register user
    const registerUser = async (userData) => {
        try {
            setIsLoading(true);
            const response = await apiCall('/auth/register', {
                method: 'POST',
                body: JSON.stringify(userData)
            });

            setToken(response.data.token);
            setUser(response.data);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('currentUser', JSON.stringify(response.data));

            toast.success('Registration successful! Please check your email for verification.');
            return response;
        } catch (error) {
            toast.error(error.message || 'Registration failed');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Login user
    const loginUser = async (credentials) => {
        try {
            setIsLoading(true);
            const response = await apiCall('/auth/login', {
                method: 'POST',
                body: JSON.stringify(credentials)
            });

            setToken(response.data.token);
            setUser(response.data);
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('currentUser', JSON.stringify(response.data));

            toast.success('Login successful!');
            return response;
        } catch (error) {
            toast.error(error.message || 'Login failed');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Create KYC application
    const createKYCApplication = async (applicationData) => {
        try {
            setIsLoading(true);
            const response = await apiCall('/kyc/apply', {
                method: 'POST',
                body: JSON.stringify(applicationData)
            });

            setKycApplication(response.data);
            setUser(prev => ({ ...prev, kycStatus: 'pending' }));

            toast.success('KYC application created successfully!');
            return response;
        } catch (error) {
            toast.error(error.message || 'Failed to create KYC application');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Upload document
    const uploadDocument = async (file, documentType) => {
        try {
            setIsLoading(true);
            const formData = new FormData();
            formData.append('document', file);
            formData.append('documentType', documentType);

            const response = await apiCall('/upload/document', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            // Update KYC application with new document
            if (kycApplication) {
                setKycApplication(prev => ({
                    ...prev,
                    documents: {
                        ...prev.documents,
                        [documentType]: {
                            url: response.data.url,
                            originalName: response.data.originalName,
                            fileSize: response.data.fileSize,
                            uploadedAt: response.data.uploadedAt,
                            verified: false
                        }
                    }
                }));
            }

            toast.success(`${documentType} document uploaded successfully!`);
            return response;
        } catch (error) {
            toast.error(error.message || 'Document upload failed');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Submit KYC application
    const submitKYCApplication = async () => {
        try {
            setIsLoading(true);
            const response = await apiCall('/kyc/submit', {
                method: 'POST'
            });

            setKycApplication(response.data);
            setUser(prev => ({ ...prev, kycStatus: 'submitted' }));

            toast.success('KYC application submitted successfully!');
            return response;
        } catch (error) {
            toast.error(error.message || 'Failed to submit KYC application');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Get KYC status
    const getKYCStatus = async () => {
        try {
            const response = await apiCall('/kyc/status');
            return response.data;
        } catch (error) {
            console.error('Error getting KYC status:', error);
            return null;
        }
    };

    // Update user profile
    const updateUserProfile = async (profileData) => {
        try {
            setIsLoading(true);
            const response = await apiCall('/users/profile', {
                method: 'PUT',
                body: JSON.stringify(profileData)
            });

            setUser(response.data);
            toast.success('Profile updated successfully!');
            return response;
        } catch (error) {
            toast.error(error.message || 'Failed to update profile');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Change password
    const changePassword = async (passwordData) => {
        try {
            setIsLoading(true);
            const response = await apiCall('/users/change-password', {
                method: 'PUT',
                body: JSON.stringify(passwordData)
            });

            toast.success('Password changed successfully!');
            return response;
        } catch (error) {
            toast.error(error.message || 'Failed to change password');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Upload profile image
    const uploadProfileImage = async (file) => {
        try {
            setIsLoading(true);
            const formData = new FormData();
            formData.append('profileImage', file);

            const response = await apiCall('/upload/profile-image', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            setUser(prev => ({ ...prev, profileImage: response.data.profileImage }));
            toast.success('Profile image uploaded successfully!');
            return response;
        } catch (error) {
            toast.error(error.message || 'Failed to upload profile image');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    // Get uploaded documents
    const getUploadedDocuments = async () => {
        try {
            const response = await apiCall('/upload/documents');
            return response.data;
        } catch (error) {
            console.error('Error getting documents:', error);
            return null;
        }
    };

    // Delete document
    const deleteDocument = async (documentType) => {
        try {
            setIsLoading(true);
            await apiCall(`/upload/document/${documentType}`, {
                method: 'DELETE'
            });

            // Update KYC application
            if (kycApplication) {
                setKycApplication(prev => ({
                    ...prev,
                    documents: {
                        ...prev.documents,
                        [documentType]: {
                            uploaded: false,
                            url: null,
                            originalName: null,
                            fileSize: null,
                            uploadedAt: null,
                            verified: false
                        }
                    }
                }));
            }

            toast.success(`${documentType} document deleted successfully!`);
        } catch (error) {
            toast.error(error.message || 'Failed to delete document');
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('currentUser');
        setToken('');
        setUser(null);
        setKycApplication(null);
        setShowLogin(false);
        toast.success('Logged out successfully');
    };

    useEffect(() => {
        if (token) {
            loadUserData();
        }
    }, [token]);

    const value = {
        user,
        setUser,
        showLogin,
        setShowLogin,
        token,
        setToken,
        kycApplication,
        setKycApplication,
        isLoading,
        registerUser,
        loginUser,
        logout,
        createKYCApplication,
        uploadDocument,
        submitKYCApplication,
        getKYCStatus,
        updateUserProfile,
        changePassword,
        uploadProfileImage,
        getUploadedDocuments,
        deleteDocument,
        loadUserData
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;