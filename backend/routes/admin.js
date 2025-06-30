const express = require('express');
const { body, validationResult } = require('express-validator');
const KYCApplication = require('../models/KYCApplication');
const User = require('../models/User');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// Protect all admin routes
router.use(protect);
router.use(authorize('admin', 'moderator'));

// @desc    Get all KYC applications
// @route   GET /api/admin/applications
// @access  Private (Admin/Moderator)
router.get('/applications', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const status = req.query.status;
    const search = req.query.search;

    const skip = (page - 1) * limit;

    // Build query
    let query = { isActive: true };
    
    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { applicationNumber: { $regex: search, $options: 'i' } },
        { 'personalInfo.fullName': { $regex: search, $options: 'i' } },
        { 'personalInfo.email': { $regex: search, $options: 'i' } }
      ];
    }

    const applications = await KYCApplication.find(query)
      .populate('user', 'name email phone')
      .populate('review.reviewedBy', 'name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await KYCApplication.countDocuments(query);

    res.json({
      success: true,
      data: {
        applications,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get single KYC application
// @route   GET /api/admin/applications/:id
// @access  Private (Admin/Moderator)
router.get('/applications/:id', async (req, res) => {
  try {
    const application = await KYCApplication.findById(req.params.id)
      .populate('user', 'name email phone dateOfBirth address')
      .populate('review.reviewedBy', 'name email');

    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Get application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Review KYC application
// @route   PUT /api/admin/applications/:id/review
// @access  Private (Admin/Moderator)
router.put('/applications/:id/review', [
  body('status')
    .isIn(['approved', 'rejected', 'pending_documents'])
    .withMessage('Invalid status'),
  body('notes')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Notes cannot exceed 1000 characters'),
  body('rejectionReason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Rejection reason cannot exceed 500 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const { status, notes, rejectionReason } = req.body;

    const application = await KYCApplication.findById(req.params.id);
    if (!application) {
      return res.status(404).json({
        success: false,
        message: 'Application not found'
      });
    }

    // Check if application can be reviewed
    if (!['submitted', 'under_review', 'pending_documents'].includes(application.status)) {
      return res.status(400).json({
        success: false,
        message: 'Application cannot be reviewed in current status'
      });
    }

    // Update application status
    await application.updateStatus(status, req.user._id, notes);

    // Update review details
    if (status === 'rejected' && rejectionReason) {
      application.review.rejectionReason = rejectionReason;
    }

    if (status === 'approved') {
      // Generate certificate URL (you can implement certificate generation here)
      application.review.certificateUrl = `https://your-domain.com/certificates/${application.applicationNumber}.pdf`;
    }

    await application.save();

    // Update user KYC status
    const userStatusMap = {
      approved: 'approved',
      rejected: 'rejected',
      pending_documents: 'pending'
    };

    await User.findByIdAndUpdate(application.user, {
      kycStatus: userStatusMap[status]
    });

    res.json({
      success: true,
      data: application,
      message: `Application ${status} successfully`
    });
  } catch (error) {
    console.error('Review application error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during application review'
    });
  }
});

// @desc    Get dashboard statistics
// @route   GET /api/admin/dashboard
// @access  Private (Admin/Moderator)
router.get('/dashboard', async (req, res) => {
  try {
    // Get KYC application statistics
    const kycStats = await KYCApplication.getStats();

    // Get user statistics
    const userStats = await User.aggregate([
      {
        $group: {
          _id: '$kycStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    // Get recent applications
    const recentApplications = await KYCApplication.find({ isActive: true })
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(5);

    // Get pending reviews count
    const pendingReviews = await KYCApplication.countDocuments({
      status: { $in: ['submitted', 'under_review'] },
      isActive: true
    });

    // Get monthly applications for chart
    const monthlyStats = await KYCApplication.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(new Date().getFullYear(), 0, 1)
          }
        }
      },
      {
        $group: {
          _id: { $month: '$createdAt' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        kycStats,
        userStats,
        recentApplications,
        pendingReviews,
        monthlyStats
      }
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
router.get('/users', authorize('admin'), async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const role = req.query.role;
    const kycStatus = req.query.kycStatus;
    const search = req.query.search;

    const skip = (page - 1) * limit;

    // Build query
    let query = {};
    
    if (role && role !== 'all') {
      query.role = role;
    }

    if (kycStatus && kycStatus !== 'all') {
      query.kycStatus = kycStatus;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private (Admin)
router.put('/users/:id/role', authorize('admin'), [
  body('role')
    .isIn(['user', 'admin', 'moderator'])
    .withMessage('Invalid role')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array()
      });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role: req.body.role },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user,
      message: 'User role updated successfully'
    });
  } catch (error) {
    console.error('Update user role error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Toggle user active status
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private (Admin)
router.put('/users/:id/toggle-status', authorize('admin'), async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isActive: user.isActive
      },
      message: `User ${user.isActive ? 'activated' : 'deactivated'} successfully`
    });
  } catch (error) {
    console.error('Toggle user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
});

// @desc    Export applications
// @route   GET /api/admin/export
// @access  Private (Admin/Moderator)
router.get('/export', async (req, res) => {
  try {
    const { status, startDate, endDate } = req.query;

    let query = { isActive: true };

    if (status && status !== 'all') {
      query.status = status;
    }

    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    const applications = await KYCApplication.find(query)
      .populate('user', 'name email phone')
      .populate('review.reviewedBy', 'name')
      .sort({ createdAt: -1 });

    // Format data for export
    const exportData = applications.map(app => ({
      applicationNumber: app.applicationNumber,
      userName: app.user.name,
      userEmail: app.user.email,
      userPhone: app.user.phone,
      status: app.status,
      submittedAt: app.createdAt,
      reviewedAt: app.review.reviewedAt,
      reviewedBy: app.review.reviewedBy?.name || 'N/A',
      notes: app.review.notes || 'N/A'
    }));

    res.json({
      success: true,
      data: exportData,
      message: 'Export data generated successfully'
    });
  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during export'
    });
  }
});

module.exports = router; 