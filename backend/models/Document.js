import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema({
    // File Information
    originalName: {
        type: String,
        required: true,
        trim: true
    },
    ipfsHash: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    mimeType: {
        type: String,
        required: true
    },
    size: {
        type: Number,
        required: true
    },
    url: {
        type: String,
        required: true
    },
    
    // Document Classification
    documentType: {
        type: String,
        enum: ['direct', 'query', 'dispute'],
        required: true,
        index: true
    },
    
    // Reference Information
    relatedId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        index: true
    },
    relatedModel: {
        type: String,
        enum: ['DirectConnection', 'Query', 'Dispute'],
        required: true
    },
    
    // User Information
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    uploadedByRole: {
        type: String,
        enum: ['citizen', 'lawyer'],
        required: true
    },
    
    // Access Control
    accessibleTo: [{
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },
        role: {
            type: String,
            enum: ['citizen', 'lawyer', 'admin'],
            required: true
        }
    }],
    
    // Document Metadata
    description: {
        type: String,
        trim: true,
        maxlength: 500
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }],
    
    // Legal Document Specific Fields
    documentCategory: {
        type: String,
        enum: [
            'evidence',
            'contract',
            'agreement',
            'legal_notice',
            'court_order',
            'affidavit',
            'power_of_attorney',
            'identity_proof',
            'address_proof',
            'financial_document',
            'correspondence',
            'other'
        ],
        default: 'other'
    },
    
    // Verification and Security
    isVerified: {
        type: Boolean,
        default: false
    },
    verifiedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    verifiedAt: {
        type: Date
    },
    
    // IPFS Specific
    pinataMetadata: {
        name: String,
        keyvalues: {
            type: Map,
            of: String
        }
    },
    
    // Status
    status: {
        type: String,
        enum: ['active', 'archived', 'deleted'],
        default: 'active',
        index: true
    },
    
    // Timestamps
    uploadedAt: {
        type: Date,
        default: Date.now,
        index: true
    },
    lastAccessedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
documentSchema.index({ documentType: 1, relatedId: 1 });
documentSchema.index({ uploadedBy: 1, documentType: 1 });
documentSchema.index({ 'accessibleTo.userId': 1 });
documentSchema.index({ uploadedAt: -1 });
documentSchema.index({ status: 1, documentType: 1 });

// Virtual for file size in human readable format
documentSchema.virtual('sizeFormatted').get(function() {
    const bytes = this.size;
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
});

// Virtual for time since upload
documentSchema.virtual('timeAgo').get(function() {
    const now = new Date();
    const uploaded = this.uploadedAt;
    const diffTime = Math.abs(now - uploaded);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return '1 day ago';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.ceil(diffDays / 30)} months ago`;
    return `${Math.ceil(diffDays / 365)} years ago`;
});

// Static method to find documents by type and related ID
documentSchema.statics.findByTypeAndId = function(documentType, relatedId, userId = null) {
    const query = { documentType, relatedId, status: 'active' };
    
    if (userId) {
        query.$or = [
            { uploadedBy: userId },
            { 'accessibleTo.userId': userId }
        ];
    }
    
    return this.find(query)
        .populate('uploadedBy', 'name email role')
        .populate('verifiedBy', 'name email')
        .sort({ uploadedAt: -1 });
};

// Static method to find user's documents
documentSchema.statics.findUserDocuments = function(userId, documentType = null) {
    const query = {
        $or: [
            { uploadedBy: userId },
            { 'accessibleTo.userId': userId }
        ],
        status: 'active'
    };
    
    if (documentType) {
        query.documentType = documentType;
    }
    
    return this.find(query)
        .populate('uploadedBy', 'name email role')
        .populate('verifiedBy', 'name email')
        .sort({ uploadedAt: -1 });
};

// Instance method to check if user has access
documentSchema.methods.hasAccess = function(userId) {
    if (this.uploadedBy.toString() === userId.toString()) {
        return true;
    }
    
    return this.accessibleTo.some(access => 
        access.userId.toString() === userId.toString()
    );
};

// Instance method to add access for a user
documentSchema.methods.grantAccess = function(userId, role) {
    const existingAccess = this.accessibleTo.find(access => 
        access.userId.toString() === userId.toString()
    );
    
    if (!existingAccess) {
        this.accessibleTo.push({ userId, role });
    }
    
    return this.save();
};

// Pre-save middleware to update lastAccessedAt
documentSchema.pre('save', function(next) {
    if (this.isNew) {
        this.lastAccessedAt = new Date();
    }
    next();
});

// Pre-remove middleware to handle IPFS cleanup (if needed)
documentSchema.pre('remove', async function(next) {
    try {
        // Note: We might not want to actually delete from IPFS for legal reasons
        // Just mark as deleted in our database
        console.log(`Document ${this.ipfsHash} marked for deletion`);
        next();
    } catch (error) {
        next(error);
    }
});

const Document = mongoose.model('Document', documentSchema);

export default Document;
