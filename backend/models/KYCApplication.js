const mongoose = require('mongoose');

const kycApplicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  applicationNumber: {
    type: String,
    unique: true,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'under_review', 'approved', 'rejected', 'pending_documents'],
    default: 'draft'
  },
  documents: {
    aadhaar: {
      url: String,
      originalName: String,
      fileSize: Number,
      uploadedAt: Date,
      verified: { type: Boolean, default: false },
      verificationNotes: String
    },
    pan: {
      url: String,
      originalName: String,
      fileSize: Number,
      uploadedAt: Date,
      verified: { type: Boolean, default: false },
      verificationNotes: String
    },
    addressProof: {
      url: String,
      originalName: String,
      fileSize: Number,
      uploadedAt: Date,
      verified: { type: Boolean, default: false },
      verificationNotes: String
    },
    profileImage: {
      url: String,
      originalName: String,
      fileSize: Number,
      uploadedAt: Date
    }
  },
  personalInfo: {
    fullName: String,
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other']
    },
    nationality: String,
    phone: String,
    email: String
  },
  address: {
    current: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String,
      type: {
        type: String,
        enum: ['residential', 'office', 'other']
      }
    },
    permanent: {
      street: String,
      city: String,
      state: String,
      country: String,
      zipCode: String
    }
  },
  employment: {
    occupation: String,
    employer: String,
    workAddress: String,
    annualIncome: {
      type: String,
      enum: ['below_5lakh', '5lakh_10lakh', '10lakh_25lakh', '25lakh_50lakh', 'above_50lakh']
    }
  },
  review: {
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    reviewedAt: Date,
    notes: String,
    rejectionReason: String,
    approvedAt: Date,
    certificateUrl: String
  },
  timeline: [{
    action: {
      type: String,
      enum: ['created', 'document_uploaded', 'submitted', 'under_review', 'approved', 'rejected', 'document_requested']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notes: String
  }],
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for application age
kycApplicationSchema.virtual('applicationAge').get(function() {
  const now = new Date();
  const created = new Date(this.createdAt);
  const diffTime = Math.abs(now - created);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Virtual for processing time
kycApplicationSchema.virtual('processingTime').get(function() {
  if (!this.review.reviewedAt) return null;
  const submitted = new Date(this.timeline.find(t => t.action === 'submitted')?.timestamp || this.createdAt);
  const reviewed = new Date(this.review.reviewedAt);
  const diffTime = Math.abs(reviewed - submitted);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Indexes for better query performance
kycApplicationSchema.index({ user: 1 });
kycApplicationSchema.index({ status: 1 });
kycApplicationSchema.index({ applicationNumber: 1 });
kycApplicationSchema.index({ createdAt: -1 });
kycApplicationSchema.index({ 'review.reviewedBy': 1 });

// Pre-save middleware to generate application number
kycApplicationSchema.pre('save', async function(next) {
  if (this.isNew && !this.applicationNumber) {
    const year = new Date().getFullYear();
    const count = await this.constructor.countDocuments({
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1)
      }
    });
    this.applicationNumber = `KYC${year}${(count + 1).toString().padStart(6, '0')}`;
  }
  next();
});

// Method to add timeline entry
kycApplicationSchema.methods.addTimelineEntry = function(action, performedBy, notes = '') {
  this.timeline.push({
    action,
    performedBy,
    notes,
    timestamp: new Date()
  });
  return this.save();
};

// Method to update status
kycApplicationSchema.methods.updateStatus = function(newStatus, reviewedBy = null, notes = '') {
  this.status = newStatus;
  
  if (reviewedBy) {
    this.review.reviewedBy = reviewedBy;
    this.review.reviewedAt = new Date();
    this.review.notes = notes;
    
    if (newStatus === 'approved') {
      this.review.approvedAt = new Date();
    }
  }
  
  return this.addTimelineEntry(newStatus, reviewedBy, notes);
};

// Method to check if all required documents are uploaded
kycApplicationSchema.methods.hasAllDocuments = function() {
  return this.documents.aadhaar.url && 
         this.documents.pan.url && 
         this.documents.addressProof.url;
};

// Static method to get statistics
kycApplicationSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);
  
  const result = {
    total: 0,
    draft: 0,
    submitted: 0,
    under_review: 0,
    approved: 0,
    rejected: 0,
    pending_documents: 0
  };
  
  stats.forEach(stat => {
    result[stat._id] = stat.count;
    result.total += stat.count;
  });
  
  return result;
};

// Static method to find by application number
kycApplicationSchema.statics.findByApplicationNumber = function(applicationNumber) {
  return this.findOne({ applicationNumber }).populate('user', 'name email');
};

module.exports = mongoose.model('KYCApplication', kycApplicationSchema); 