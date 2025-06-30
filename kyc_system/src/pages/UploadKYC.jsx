import React, { useState, useContext, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const UploadKYC = () => {
    const { user, kycApplication, createKYCApplication, uploadDocument, submitKYCApplication, isLoading } = useContext(AppContext);
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        dateOfBirth: '',
        nationality: '',
        passportNumber: '',
        address: {
            street: '',
            city: '',
            state: '',
            zipCode: '',
            country: ''
        },
        phoneNumber: user?.phoneNumber || '',
        occupation: '',
        sourceOfFunds: '',
        expectedMonthlyTransaction: ''
    });

    const [documents, setDocuments] = useState({
        identityProof: null,
        addressProof: null,
        incomeProof: null,
        bankStatement: null
    });

    const [uploadProgress, setUploadProgress] = useState({});
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Check if user is logged in
    useEffect(() => {
        if (!user) {
            toast.error('Please login to access KYC upload');
            navigate('/login');
            return;
        }

        // If KYC application already exists, show status
        if (kycApplication) {
            if (kycApplication.status === 'approved') {
                toast.info('Your KYC is already approved!');
                navigate('/dashboard');
            } else if (kycApplication.status === 'pending' || kycApplication.status === 'submitted') {
                toast.info('You already have a KYC application in progress');
                navigate('/dashboard');
            }
        }
    }, [user, kycApplication, navigate]);

    // GSAP animations
    useEffect(() => {
        gsap.fromTo('.kyc-container', 
            { opacity: 0, y: 50 },
            { opacity: 1, y: 0, duration: 0.8, ease: 'power2.out' }
        );

        gsap.fromTo('.step-indicator', 
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 0.6, stagger: 0.2, ease: 'back.out(1.7)' }
        );
    }, []);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [parent, child] = name.split('.');
            setFormData(prev => ({
                ...prev,
                [parent]: {
                    ...prev[parent],
                    [child]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleFileChange = (e, documentType) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file size (5MB limit)
            if (file.size > 5 * 1024 * 1024) {
                toast.error('File size must be less than 5MB');
                return;
            }

            // Validate file type
            const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
            if (!allowedTypes.includes(file.type)) {
                toast.error('Please upload JPG, PNG, or PDF files only');
                return;
            }

            setDocuments(prev => ({
                ...prev,
                [documentType]: file
            }));

            // Update upload progress
            setUploadProgress(prev => ({
                ...prev,
                [documentType]: 0
            }));
        }
    };

    const uploadFile = async (file, documentType) => {
        try {
            await uploadDocument(file, documentType);
            setUploadProgress(prev => ({
                ...prev,
                [documentType]: 100
            }));
            return true;
        } catch (error) {
            setUploadProgress(prev => ({
                ...prev,
                [documentType]: 0
            }));
            return false;
        }
    };

    const handleNextStep = () => {
        if (currentStep === 1) {
            // Validate personal information
            const requiredFields = ['firstName', 'lastName', 'dateOfBirth', 'nationality', 'passportNumber'];
            const missingFields = requiredFields.filter(field => !formData[field]);
            
            if (missingFields.length > 0) {
                toast.error(`Please fill in: ${missingFields.join(', ')}`);
                return;
            }
        } else if (currentStep === 2) {
            // Validate address information
            const requiredAddressFields = ['street', 'city', 'state', 'zipCode', 'country'];
            const missingAddressFields = requiredAddressFields.filter(field => !formData.address[field]);
            
            if (missingAddressFields.length > 0) {
                toast.error(`Please fill in address: ${missingAddressFields.join(', ')}`);
                return;
            }
        }

        setCurrentStep(prev => prev + 1);
        
        // Animate step transition
        gsap.to('.form-content', {
            opacity: 0,
            x: -50,
            duration: 0.3,
            onComplete: () => {
                gsap.to('.form-content', {
                    opacity: 1,
                    x: 0,
                    duration: 0.3
                });
            }
        });
    };

    const handlePrevStep = () => {
        setCurrentStep(prev => prev - 1);
        
        // Animate step transition
        gsap.to('.form-content', {
            opacity: 0,
            x: 50,
            duration: 0.3,
            onComplete: () => {
                gsap.to('.form-content', {
                    opacity: 1,
                    x: 0,
                    duration: 0.3
                });
            }
        });
    };

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);

            // Create KYC application
            const applicationData = {
                ...formData,
                documents: {}
            };

            const kycResponse = await createKYCApplication(applicationData);

            // Upload documents
            const uploadPromises = [];
            for (const [documentType, file] of Object.entries(documents)) {
                if (file) {
                    uploadPromises.push(uploadFile(file, documentType));
                }
            }

            // Wait for all uploads to complete
            const uploadResults = await Promise.all(uploadPromises);
            const allUploadsSuccessful = uploadResults.every(result => result);

            if (allUploadsSuccessful) {
                // Submit the application
                await submitKYCApplication();
                toast.success('KYC application submitted successfully!');
                navigate('/dashboard');
            } else {
                toast.error('Some documents failed to upload. Please try again.');
            }
        } catch (error) {
            toast.error(error.message || 'Failed to submit KYC application');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStepStatus = (step) => {
        if (step < currentStep) return 'completed';
        if (step === currentStep) return 'active';
        return 'pending';
    };

    const renderStepIndicator = () => (
        <div className="flex justify-center mb-8">
            {[1, 2, 3, 4].map((step) => (
                <div key={step} className="flex items-center">
                    <div className={`step-indicator w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold transition-all duration-300 ${
                        getStepStatus(step) === 'completed' ? 'bg-green-500' :
                        getStepStatus(step) === 'active' ? 'bg-blue-500' : 'bg-gray-300'
                    }`}>
                        {getStepStatus(step) === 'completed' ? '✓' : step}
                    </div>
                    {step < 4 && (
                        <div className={`w-16 h-1 mx-2 transition-all duration-300 ${
                            getStepStatus(step) === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                        }`}></div>
                    )}
                </div>
            ))}
        </div>
    );

    const renderPersonalInfo = () => (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Personal Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">First Name</label>
                    <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter your first name"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Last Name</label>
                    <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter your last name"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                    <input
                        type="date"
                        name="dateOfBirth"
                        value={formData.dateOfBirth}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Nationality</label>
                    <input
                        type="text"
                        name="nationality"
                        value={formData.nationality}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter your nationality"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Passport Number</label>
                    <input
                        type="text"
                        name="passportNumber"
                        value={formData.passportNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter your passport number"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                        type="tel"
                        name="phoneNumber"
                        value={formData.phoneNumber}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter your phone number"
                    />
                </div>
            </div>
        </div>
    );

    const renderAddressInfo = () => (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Address Information</h3>
            
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Street Address</label>
                    <input
                        type="text"
                        name="address.street"
                        value={formData.address.street}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter your street address"
                    />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                        <input
                            type="text"
                            name="address.city"
                            value={formData.address.city}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="Enter city"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">State/Province</label>
                        <input
                            type="text"
                            name="address.state"
                            value={formData.address.state}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="Enter state"
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">ZIP/Postal Code</label>
                        <input
                            type="text"
                            name="address.zipCode"
                            value={formData.address.zipCode}
                            onChange={handleInputChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="Enter ZIP code"
                        />
                    </div>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Country</label>
                    <input
                        type="text"
                        name="address.country"
                        value={formData.address.country}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter your country"
                    />
                </div>
            </div>
        </div>
    );

    const renderFinancialInfo = () => (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Financial Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Occupation</label>
                    <input
                        type="text"
                        name="occupation"
                        value={formData.occupation}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        placeholder="Enter your occupation"
                    />
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Source of Funds</label>
                    <select
                        name="sourceOfFunds"
                        value={formData.sourceOfFunds}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                        <option value="">Select source of funds</option>
                        <option value="salary">Salary</option>
                        <option value="business">Business</option>
                        <option value="investment">Investment</option>
                        <option value="inheritance">Inheritance</option>
                        <option value="other">Other</option>
                    </select>
                </div>
                
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Expected Monthly Transaction</label>
                    <select
                        name="expectedMonthlyTransaction"
                        value={formData.expectedMonthlyTransaction}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    >
                        <option value="">Select range</option>
                        <option value="0-1000">$0 - $1,000</option>
                        <option value="1000-5000">$1,000 - $5,000</option>
                        <option value="5000-10000">$5,000 - $10,000</option>
                        <option value="10000-50000">$10,000 - $50,000</option>
                        <option value="50000+">$50,000+</option>
                    </select>
                </div>
            </div>
        </div>
    );

    const renderDocumentUpload = () => (
        <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-6">Document Upload</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                    { key: 'identityProof', label: 'Identity Proof', description: 'Passport, Driver\'s License, or National ID' },
                    { key: 'addressProof', label: 'Address Proof', description: 'Utility bill, Bank statement, or Rental agreement' },
                    { key: 'incomeProof', label: 'Income Proof', description: 'Salary slip, Tax returns, or Employment letter' },
                    { key: 'bankStatement', label: 'Bank Statement', description: 'Last 3 months bank statements' }
                ].map(({ key, label, description }) => (
                    <div key={key} className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-blue-400 transition-all duration-200">
                        <div className="text-center">
                            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                            </div>
                            
                            <h4 className="text-lg font-semibold text-gray-800 mb-2">{label}</h4>
                            <p className="text-sm text-gray-600 mb-4">{description}</p>
                            
                            <input
                                type="file"
                                onChange={(e) => handleFileChange(e, key)}
                                accept=".jpg,.jpeg,.png,.pdf"
                                className="hidden"
                                id={key}
                            />
                            <label
                                htmlFor={key}
                                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200 cursor-pointer"
                            >
                                Choose File
                            </label>
                            
                            {documents[key] && (
                                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                                    <p className="text-sm text-green-800 font-medium">
                                        ✓ {documents[key].name}
                                    </p>
                                    {uploadProgress[key] !== undefined && (
                                        <div className="mt-2">
                                            <div className="w-full bg-gray-200 rounded-full h-2">
                                                <div
                                                    className="bg-green-500 h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${uploadProgress[key]}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-xs text-gray-600 mt-1">
                                                {uploadProgress[key]}% uploaded
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Document Requirements:</h4>
                <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Maximum file size: 5MB</li>
                    <li>• Accepted formats: JPG, PNG, PDF</li>
                    <li>• Documents must be clear and legible</li>
                    <li>• All documents must be current and valid</li>
                </ul>
            </div>
        </div>
    );

    const renderStepContent = () => {
        switch (currentStep) {
            case 1:
                return renderPersonalInfo();
            case 2:
                return renderAddressInfo();
            case 3:
                return renderFinancialInfo();
            case 4:
                return renderDocumentUpload();
            default:
                return null;
        }
    };

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
            <div className="max-w-4xl mx-auto px-4">
                <div className="kyc-container bg-white rounded-2xl shadow-xl p-8">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">KYC Application</h1>
                        <p className="text-gray-600">Complete your Know Your Customer verification</p>
                    </div>

                    {renderStepIndicator()}

                    <div className="form-content">
                        {renderStepContent()}
                    </div>

                    <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
                        {currentStep > 1 && (
                            <button
                                onClick={handlePrevStep}
                                className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
                            >
                                Previous
                            </button>
                        )}
                        
                        <div className="ml-auto">
                            {currentStep < 4 ? (
                                <button
                                    onClick={handleNextStep}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-200"
                                >
                                    Next
                                </button>
                            ) : (
                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting || isLoading}
                                    className="px-8 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting || isLoading ? (
                                        <span className="flex items-center">
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                            Submitting...
                                        </span>
                                    ) : (
                                        'Submit Application'
                                    )}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UploadKYC;