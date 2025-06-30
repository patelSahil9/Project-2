const express = require('express');
const multer = require('multer');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/uploadToCloudinary');
const { protect } = require('../middleware/auth');
const KYCApplication = require('../models/KYCApplication');
const User = require('../models/User');

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024, // 10MB
    files: 1
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = (process.env.ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/jpg,application/pdf').split(',');
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, JPG, and PDF files are allowed.'), false);
    }
  }
});

// @desc    Upload document
// @route   POST /api/upload/document
// @access  Private
router.post('/document', protect, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    const { documentType } = req.body;

    // Validate document type
    const validTypes = ['aadhaar', 'pan', 'addressProof', 'profileImage'];
    if (!validTypes.includes(documentType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document type'
      });
    }

    // Check if user has an active KYC application
    const application = await KYCApplication.findOne({
      user: req.user._id,
      isActive: true
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'No active KYC application found. Please create an application first.'
      });
    }

    // Upload file to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file, `kyc_documents/${req.user._id}`);

    // Update application with document information
    application.documents[documentType] = {
      url: uploadResult.url,
      originalName: req.file.originalname,
      fileSize: uploadResult.size,
      uploadedAt: new Date(),
      verified: false
    };

    await application.save();

    // Add timeline entry
    await application.addTimelineEntry('document_uploaded', req.user._id, `${documentType} document uploaded`);

    // Update user KYC documents status
    const userUpdate = {};
    userUpdate[`kycDocuments.${documentType}.uploaded`] = true;
    userUpdate[`kycDocuments.${documentType}.url`] = uploadResult.url;
    userUpdate[`kycDocuments.${documentType}.uploadedAt`] = new Date();

    await User.findByIdAndUpdate(req.user._id, userUpdate);

    res.json({
      success: true,
      data: {
        documentType,
        url: uploadResult.url,
        originalName: req.file.originalname,
        fileSize: uploadResult.size,
        uploadedAt: new Date()
      },
      message: `${documentType} document uploaded successfully`
    });
  } catch (error) {
    console.error('Document upload error:', error);
    
    if (error.message.includes('File too large')) {
      return res.status(400).json({
        success: false,
        message: 'File size too large. Maximum size is 10MB.'
      });
    }

    if (error.message.includes('Invalid file type')) {
      return res.status(400).json({
        success: false,
        message: 'Invalid file type. Only JPEG, PNG, JPG, and PDF files are allowed.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error during document upload'
    });
  }
});

// @desc    Delete document
// @route   DELETE /api/upload/document/:documentType
// @access  Private
router.delete('/document/:documentType', protect, async (req, res) => {
  try {
    const { documentType } = req.params;

    // Validate document type
    const validTypes = ['aadhaar', 'pan', 'addressProof', 'profileImage'];
    if (!validTypes.includes(documentType)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid document type'
      });
    }

    // Get user's KYC application
    const application = await KYCApplication.findOne({
      user: req.user._id,
      isActive: true
    });

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'No active KYC application found'
      });
    }

    // Check if document exists
    if (!application.documents[documentType] || !application.documents[documentType].url) {
      return res.status(404).json({
        success: false,
        message: 'Document not found'
      });
    }

    // Only allow deletion if application is in draft or pending_documents status
    if (!['draft', 'pending_documents'].includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete document in current application status'
      });
    }

    // Extract public ID from Cloudinary URL
    const url = application.documents[documentType].url;
    const publicId = url.split('/').slice(-1)[0].split('.')[0];
    const fullPublicId = `kyc_documents/${req.user._id}/${publicId}`;

    // Delete from Cloudinary
    try {
      await deleteFromCloudinary(fullPublicId);
    } catch (cloudinaryError) {
      console.error('Cloudinary delete error:', cloudinaryError);
      // Continue with local deletion even if Cloudinary fails
    }

    // Remove document from application
    application.documents[documentType] = {
      uploaded: false,
      url: null,
      originalName: null,
      fileSize: null,
      uploadedAt: null,
      verified: false
    };

    await application.save();

    // Update user KYC documents status
    const userUpdate = {};
    userUpdate[`kycDocuments.${documentType}.uploaded`] = false;
    userUpdate[`kycDocuments.${documentType}.url`] = null;
    userUpdate[`kycDocuments.${documentType}.uploadedAt`] = null;

    await User.findByIdAndUpdate(req.user._id, userUpdate);

    // Add timeline entry
    await application.addTimelineEntry('document_uploaded', req.user._id, `${documentType} document deleted`);

    res.json({
      success: true,
      message: `${documentType} document deleted successfully`
    });
  } catch (error) {
    console.error('Document deletion error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during document deletion'
    });
  }
});

// @desc    Get uploaded documents
// @route   GET /api/upload/documents
// @access  Private
router.get('/documents', protect, async (req, res) => {
  try {
    const application = await KYCApplication.findOne({
      user: req.user._id,
      isActive: true
    }).select('documents');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'No active KYC application found'
      });
    }

    res.json({
      success: true,
      data: application.documents
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Upload profile image
// @route   POST /api/upload/profile-image
// @access  Private
router.post('/profile-image', protect, upload.single('profileImage'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Check if file is an image
    if (!req.file.mimetype.startsWith('image/')) {
      return res.status(400).json({
        success: false,
        message: 'Only image files are allowed for profile image'
      });
    }

    // Upload to Cloudinary
    const uploadResult = await uploadToCloudinary(req.file, `profile_images/${req.user._id}`);

    // Update user profile image
    await User.findByIdAndUpdate(req.user._id, {
      profileImage: uploadResult.url
    });

    res.json({
      success: true,
      data: {
        profileImage: uploadResult.url,
        originalName: req.file.originalname,
        fileSize: uploadResult.size,
        uploadedAt: new Date()
      },
      message: 'Profile image uploaded successfully'
    });
  } catch (error) {
    console.error('Profile image upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during profile image upload'
    });
  }
});

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
      });
    }
    if (error.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({
        success: false,
        message: 'Too many files. Only one file allowed.'
      });
    }
  }
  
  if (error.message.includes('Invalid file type')) {
    return res.status(400).json({
      success: false,
      message: 'Invalid file type. Only JPEG, PNG, JPG, and PDF files are allowed.'
    });
  }

  next(error);
});

module.exports = router; 