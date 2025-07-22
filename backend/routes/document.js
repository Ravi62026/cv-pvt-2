import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { body } from 'express-validator';
import { protect } from '../middleware/auth.js';
import {
    uploadDocument,
    uploadMultipleDocuments,
    getDocuments,
    getUserDocuments,
    getDocument,
    deleteDocument
} from '../controllers/documentController.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for temporary file storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../temp/uploads/'));
    },
    filename: function (req, file, cb) {
        // Create unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB default
        files: parseInt(process.env.MAX_FILES_PER_UPLOAD) || 5
    },
    fileFilter: function (req, file, cb) {
        // Allowed file types for legal documents
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'image/jpeg',
            'image/png',
            'image/gif',
            'text/plain',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        ];

        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, DOC, DOCX, images, TXT, and Excel files are allowed.'));
        }
    }
});

// Validation middleware
const validateDocumentUpload = [
    body('documentType')
        .isIn(['direct', 'query', 'dispute'])
        .withMessage('Document type must be direct, query, or dispute'),
    body('relatedId')
        .isMongoId()
        .withMessage('Related ID must be a valid MongoDB ObjectId'),
    body('description')
        .optional()
        .isLength({ max: 500 })
        .withMessage('Description must not exceed 500 characters'),
    body('documentCategory')
        .optional()
        .isIn([
            'evidence', 'contract', 'agreement', 'legal_notice', 'court_order',
            'affidavit', 'power_of_attorney', 'identity_proof', 'address_proof',
            'financial_document', 'correspondence', 'other'
        ])
        .withMessage('Invalid document category'),
    body('tags')
        .optional()
        .isString()
        .withMessage('Tags must be a comma-separated string')
];

// Routes

// Upload single document
router.post('/upload',
    protect,
    upload.single('document'),
    validateDocumentUpload,
    uploadDocument
);

// Upload multiple documents
router.post('/upload-multiple',
    protect,
    upload.array('documents', parseInt(process.env.MAX_FILES_PER_UPLOAD) || 5),
    validateDocumentUpload,
    uploadMultipleDocuments
);

// Get user's document repository (must come before /:documentType/:relatedId)
router.get('/repository/my-documents',
    protect,
    getUserDocuments
);

// Get document statistics for user (must come before /:documentType/:relatedId)
router.get('/stats/overview',
    protect,
    async (req, res) => {
        try {
            const userId = req.user.id;
            const Document = (await import('../models/Document.js')).default;

            const stats = await Document.aggregate([
                {
                    $match: {
                        $or: [
                            { uploadedBy: userId },
                            { 'accessibleTo.userId': userId }
                        ],
                        status: 'active'
                    }
                },
                {
                    $group: {
                        _id: '$documentType',
                        count: { $sum: 1 },
                        totalSize: { $sum: '$size' },
                        categories: { $addToSet: '$documentCategory' }
                    }
                }
            ]);

            const totalStats = await Document.aggregate([
                {
                    $match: {
                        $or: [
                            { uploadedBy: userId },
                            { 'accessibleTo.userId': userId }
                        ],
                        status: 'active'
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalDocuments: { $sum: 1 },
                        totalSize: { $sum: '$size' },
                        avgSize: { $avg: '$size' }
                    }
                }
            ]);

            const recentDocuments = await Document.find({
                $or: [
                    { uploadedBy: userId },
                    { 'accessibleTo.userId': userId }
                ],
                status: 'active'
            })
            .populate('uploadedBy', 'name email role')
            .sort({ uploadedAt: -1 })
            .limit(5);

            res.json({
                success: true,
                data: {
                    byType: stats,
                    overall: totalStats[0] || { totalDocuments: 0, totalSize: 0, avgSize: 0 },
                    recent: recentDocuments
                }
            });

        } catch (error) {
            console.error('Error fetching document stats:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch document statistics',
                details: error.message
            });
        }
    }
);

// Get single document details
router.get('/details/:documentId',
    protect,
    getDocument
);

// Delete document (soft delete)
router.delete('/:documentId',
    protect,
    deleteDocument
);

// Get documents for a specific case/connection (must come after specific routes)
router.get('/:documentType/:relatedId',
    protect,
    getDocuments
);

// Debug endpoint to check total documents
router.get('/debug/count',
    protect,
    async (req, res) => {
        try {
            const Document = (await import('../models/Document.js')).default;
            const total = await Document.countDocuments({});
            const userDocs = await Document.countDocuments({
                $or: [
                    { uploadedBy: req.user.id },
                    { 'accessibleTo.userId': req.user.id }
                ]
            });

            res.json({
                success: true,
                data: {
                    totalDocuments: total,
                    userDocuments: userDocs,
                    userId: req.user.id
                }
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                error: error.message
            });
        }
    }
);

// Search documents
router.get('/search',
    protect,
    async (req, res) => {
        try {
            const userId = req.user.id;
            const { q, documentType, documentCategory, dateFrom, dateTo, page = 1, limit = 20 } = req.query;
            const Document = (await import('../models/Document.js')).default;

            let query = {
                $or: [
                    { uploadedBy: userId },
                    { 'accessibleTo.userId': userId }
                ],
                status: 'active'
            };

            // Text search
            if (q) {
                query.$and = query.$and || [];
                query.$and.push({
                    $or: [
                        { originalName: { $regex: q, $options: 'i' } },
                        { description: { $regex: q, $options: 'i' } },
                        { tags: { $in: [new RegExp(q, 'i')] } }
                    ]
                });
            }

            // Filter by document type
            if (documentType && ['direct', 'query', 'dispute'].includes(documentType)) {
                query.documentType = documentType;
            }

            // Filter by document category
            if (documentCategory) {
                query.documentCategory = documentCategory;
            }

            // Date range filter
            if (dateFrom || dateTo) {
                query.uploadedAt = {};
                if (dateFrom) query.uploadedAt.$gte = new Date(dateFrom);
                if (dateTo) query.uploadedAt.$lte = new Date(dateTo);
            }

            const skip = (page - 1) * limit;

            const documents = await Document.find(query)
                .populate('uploadedBy', 'name email role')
                .populate('verifiedBy', 'name email')
                .sort({ uploadedAt: -1 })
                .skip(skip)
                .limit(parseInt(limit));

            const total = await Document.countDocuments(query);

            res.json({
                success: true,
                data: {
                    documents,
                    pagination: {
                        current: parseInt(page),
                        total: Math.ceil(total / limit),
                        count: documents.length,
                        totalDocuments: total
                    },
                    searchQuery: q,
                    filters: {
                        documentType,
                        documentCategory,
                        dateFrom,
                        dateTo
                    }
                }
            });

        } catch (error) {
            console.error('Error searching documents:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to search documents',
                details: error.message
            });
        }
    }
);

export default router;
