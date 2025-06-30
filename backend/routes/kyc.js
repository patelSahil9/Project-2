const express = require('express');
const { body, validationResult } = require('express-validator');
const KYCApplication = require('../models/KYCApplication');
const User = require('../models/User');
const { protect, requireKYCSubmission } = require('../middleware/auth');

const router = express.Router();

// @desc    Create new KYC application
// @route   POST /api/kyc/apply
// @access  Private
router.post('/apply', protect, [
  body('personalInfo.fullName')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Full name must be between 2 and 100 characters'),
  body('personalInfo.dateOfBirth')
    .isISO8601()
    .withMessage('Please enter a valid date of birth'),
  body('personalInfo.gender')
    .isIn(['male', 'female', 'other'])
    .withMessage('Please select a valid gender'),
  body('personalInfo.nationality')
    .trim()
    .notEmpty()
    .withMessage('Nationality is required'),
  body('personalInfo.phone')
    .matches(/^[0-9]{10}$/)
    .withMessage('Please enter a valid 10-digit phone number'),
  body('address.current.street')
    .trim()
    .notEmpty()
    .withMessage('Current address street is required'),
  body('address.current.city')
    .trim()
    .notEmpty()
    .withMessage('Current address city is required'),
  body('address.current.state')
    .trim()
    .notEmpty()
    .withMessage('Current address state is required'),
  body('address.current.country')
    .trim()
    .notEmpty()
    .withMessage('Current address country is required'),
  body('address.current.zipCode')
    .trim()
    .notEmpty()
    .withMessage('Current address zip code is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    // Check if user already has an active application
    const existingApplication = await KYCApplication.findOne({
      user: req.user._id,
      isActive: true
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        message: 'You already have an active KYC application'
      });
    }

    // Create new KYC application
    const kycApplication = await KYCApplication.create({
      user: req.user._id,
      personalInfo: req.body.personalInfo,
      address: req.body.address,
      employment: req.body.employment || {}
    });

    // Add initial timeline entry
    await kycApplication.addTimelineEntry('created', req.user._id, 'Application created');

    // Update user KYC status
    await User.findByIdAndUpdate(req.user._id, {
      kycStatus: 'pending'
    });

    res.status(201).json({
      success: true,
      data: kycApplication,
      message: 'KYC application created successfully'
    });
  } catch (error) {
    console.error('KYC application creation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during KYC application creation'
    });
  }
});

// @desc    Get user's KYC application
// @route   GET /api/kyc/my-application
// @access  Private
router.get('/my-application', protect, async (req, res) => {
  try {
    const application = await KYCApplication.findOne({
      user: req.user._id,
      isActive: true
    }).populate('user', 'name email');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'No active KYC application found'
      });
    }

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Get KYC application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update KYC application
// @route   PUT /api/kyc/update
// @access  Private
router.put('/update', protect, requireKYCSubmission, async (req, res) => {
  try {
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

    // Only allow updates if application is in draft or pending_documents status
    if (!['draft', 'pending_documents'].includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: 'Cannot update application in current status'
      });
    }

    // Update application fields
    const updateFields = ['personalInfo', 'address', 'employment'];
    updateFields.forEach(field => {
      if (req.body[field]) {
        application[field] = { ...application[field], ...req.body[field] };
      }
    });

    await application.save();

    // Add timeline entry
    await application.addTimelineEntry('document_uploaded', req.user._id, 'Application updated');

    res.json({
      success: true,
      data: application,
      message: 'KYC application updated successfully'
    });
  } catch (error) {
    console.error('Update KYC application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during application update'
    });
  }
});

// @desc    Submit KYC application
// @route   POST /api/kyc/submit
// @access  Private
router.post('/submit', protect, requireKYCSubmission, async (req, res) => {
  try {
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

    // Check if all required documents are uploaded
    if (!application.hasAllDocuments()) {
      return res.status(400).json({
        success: false,
        message: 'All required documents must be uploaded before submission'
      });
    }

    // Update application status
    await application.updateStatus('submitted', req.user._id, 'Application submitted for review');

    // Update user KYC status
    await User.findByIdAndUpdate(req.user._id, {
      kycStatus: 'submitted'
    });

    res.json({
      success: true,
      data: application,
      message: 'KYC application submitted successfully'
    });
  } catch (error) {
    console.error('Submit KYC application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during application submission'
    });
  }
});

// @desc    Get KYC application status
// @route   GET /api/kyc/status
// @access  Private
router.get('/status', protect, async (req, res) => {
  try {
    const application = await KYCApplication.findOne({
      user: req.user._id,
      isActive: true
    }).select('status applicationNumber timeline createdAt');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'No active KYC application found'
      });
    }

    res.json({
      success: true,
      data: {
        status: application.status,
        applicationNumber: application.applicationNumber,
        submittedAt: application.createdAt,
        timeline: application.timeline
      }
    });
  } catch (error) {
    console.error('Get KYC status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get KYC application by application number
// @route   GET /api/kyc/track/:applicationNumber
// @access  Public
router.get('/track/:applicationNumber', async (req, res) => {
  try {
    const application = await KYCApplication.findByApplicationNumber(req.params.applicationNumber);

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Return limited information for public tracking
    res.json({
      success: true,
      data: {
        applicationNumber: application.applicationNumber,
        status: application.status,
        submittedAt: application.createdAt,
        timeline: application.timeline.map(t => ({
          action: t.action,
          timestamp: t.timestamp,
          notes: t.notes
        }))
      }
    });
  } catch (error) {
    console.error('Track KYC application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Cancel KYC application
// @route   DELETE /api/kyc/cancel
// @access  Private
router.delete('/cancel', protect, async (req, res) => {
  try {
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

    // Only allow cancellation if application is in draft status
    if (application.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Cannot cancel application in current status'
      });
    }

    // Deactivate application
    application.isActive = false;
    await application.save();

    // Update user KYC status
    await User.findByIdAndUpdate(req.user._id, {
      kycStatus: 'not_started'
    });

    res.json({
      success: true,
      message: 'KYC application cancelled successfully'
    });
  } catch (error) {
    console.error('Cancel KYC application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during application cancellation'
    });
  }
});

module.exports = router; 