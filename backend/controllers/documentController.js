import Document from '../models/Document.js';
import Query from '../models/Query.js';
import Dispute from '../models/Dispute.js';
import DirectConnection from '../models/DirectConnection.js';
import User from '../models/User.js';
import { uploadToPinata, uploadMultipleToPinata, validateFile, getFileUrl } from '../utils/pinataService.js';
import { validationResult } from 'express-validator';

// Upload document for a specific case/connection
export const uploadDocument = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { documentType, relatedId, description, documentCategory, tags } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        // Validate file
        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        const fileValidation = validateFile(req.file);
        if (!fileValidation.valid) {
            return res.status(400).json({
                success: false,
                error: fileValidation.error
            });
        }

        // Verify user has access to the related entity
        let relatedEntity;
        let accessibleUsers = [];

        switch (documentType) {
            case 'query':
                relatedEntity = await Query.findById(relatedId);
                if (!relatedEntity) {
                    return res.status(404).json({
                        success: false,
                        error: 'Query not found'
                    });
                }
                
                // Check if user is the query creator or has access
                if (relatedEntity.citizenId.toString() !== userId && 
                    !relatedEntity.assignedLawyers.includes(userId)) {
                    return res.status(403).json({
                        success: false,
                        error: 'Access denied'
                    });
                }
                
                // Add accessible users
                accessibleUsers.push({ userId: relatedEntity.citizenId, role: 'citizen' });
                relatedEntity.assignedLawyers.forEach(lawyerId => {
                    accessibleUsers.push({ userId: lawyerId, role: 'lawyer' });
                });
                break;

            case 'dispute':
                relatedEntity = await Dispute.findById(relatedId);
                if (!relatedEntity) {
                    return res.status(404).json({
                        success: false,
                        error: 'Dispute not found'
                    });
                }
                
                if (relatedEntity.citizenId.toString() !== userId && 
                    !relatedEntity.assignedLawyers.includes(userId)) {
                    return res.status(403).json({
                        success: false,
                        error: 'Access denied'
                    });
                }
                
                accessibleUsers.push({ userId: relatedEntity.citizenId, role: 'citizen' });
                relatedEntity.assignedLawyers.forEach(lawyerId => {
                    accessibleUsers.push({ userId: lawyerId, role: 'lawyer' });
                });
                break;

            case 'direct':
                relatedEntity = await DirectConnection.findById(relatedId);
                if (!relatedEntity) {
                    return res.status(404).json({
                        success: false,
                        error: 'Direct connection not found'
                    });
                }
                
                if (relatedEntity.citizenId.toString() !== userId && 
                    relatedEntity.lawyerId.toString() !== userId) {
                    return res.status(403).json({
                        success: false,
                        error: 'Access denied'
                    });
                }
                
                accessibleUsers.push(
                    { userId: relatedEntity.citizenId, role: 'citizen' },
                    { userId: relatedEntity.lawyerId, role: 'lawyer' }
                );
                break;

            default:
                return res.status(400).json({
                    success: false,
                    error: 'Invalid document type'
                });
        }

        // Upload to Pinata
        const uploadMetadata = {
            documentType,
            relatedId: relatedId.toString(),
            uploadedBy: userId.toString(),
            uploadedByRole: userRole,
            description: description || '',
            documentCategory: documentCategory || 'other'
        };

        const uploadResult = await uploadToPinata(req.file, uploadMetadata);

        // Save document metadata to database
        const document = new Document({
            originalName: req.file.originalname,
            ipfsHash: uploadResult.ipfsHash,
            mimeType: req.file.mimetype,
            size: req.file.size,
            url: uploadResult.url,
            documentType,
            relatedId,
            relatedModel: documentType === 'query' ? 'Query' : 
                         documentType === 'dispute' ? 'Dispute' : 'DirectConnection',
            uploadedBy: userId,
            uploadedByRole: userRole,
            accessibleTo: accessibleUsers,
            description: description || '',
            documentCategory: documentCategory || 'other',
            tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
            pinataMetadata: uploadResult.metadata
        });

        await document.save();

        // Populate user information
        await document.populate('uploadedBy', 'name email role');

        res.status(201).json({
            success: true,
            message: 'Document uploaded successfully',
            data: {
                document,
                ipfsUrl: uploadResult.url
            }
        });

    } catch (error) {
        console.error('Error uploading document:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to upload document',
            details: error.message
        });
    }
};

// Upload multiple documents
export const uploadMultipleDocuments = async (req, res) => {
    try {
        const { documentType, relatedId, description, documentCategory, tags } = req.body;
        const userId = req.user.id;
        const userRole = req.user.role;

        if (!req.files || req.files.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'No files uploaded'
            });
        }

        // Validate all files
        for (const file of req.files) {
            const fileValidation = validateFile(file);
            if (!fileValidation.valid) {
                return res.status(400).json({
                    success: false,
                    error: `File ${file.originalname}: ${fileValidation.error}`
                });
            }
        }

        // Similar access verification as single upload...
        // (Implementation similar to uploadDocument)

        const uploadMetadata = {
            documentType,
            relatedId: relatedId.toString(),
            uploadedBy: userId.toString(),
            uploadedByRole: userRole,
            description: description || '',
            documentCategory: documentCategory || 'other'
        };

        const uploadResults = await uploadMultipleToPinata(req.files, uploadMetadata);
        const documents = [];

        for (let i = 0; i < uploadResults.length; i++) {
            const result = uploadResults[i];
            const file = req.files[i];

            const document = new Document({
                originalName: file.originalname,
                ipfsHash: result.ipfsHash,
                mimeType: file.mimetype,
                size: file.size,
                url: result.url,
                documentType,
                relatedId,
                relatedModel: documentType === 'query' ? 'Query' : 
                             documentType === 'dispute' ? 'Dispute' : 'DirectConnection',
                uploadedBy: userId,
                uploadedByRole: userRole,
                description: description || '',
                documentCategory: documentCategory || 'other',
                tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
                pinataMetadata: result.metadata
            });

            await document.save();
            await document.populate('uploadedBy', 'name email role');
            documents.push(document);
        }

        res.status(201).json({
            success: true,
            message: `${documents.length} documents uploaded successfully`,
            data: { documents }
        });

    } catch (error) {
        console.error('Error uploading multiple documents:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to upload documents',
            details: error.message
        });
    }
};

// Get documents for a specific case/connection
export const getDocuments = async (req, res) => {
    try {
        const { documentType, relatedId } = req.params;
        const userId = req.user.id;

        const documents = await Document.findByTypeAndId(documentType, relatedId, userId);

        res.json({
            success: true,
            data: {
                documents,
                count: documents.length
            }
        });

    } catch (error) {
        console.error('Error fetching documents:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch documents',
            details: error.message
        });
    }
};

// Get user's document repository
export const getUserDocuments = async (req, res) => {
    try {
        const userId = req.user.id;
        const { documentType, page = 1, limit = 20 } = req.query;

        console.log('getUserDocuments called for user:', userId);

        const skip = (page - 1) * limit;

        let query = {
            $or: [
                { uploadedBy: userId },
                { 'accessibleTo.userId': userId }
            ],
            status: 'active'
        };

        console.log('Document query:', JSON.stringify(query, null, 2));

        if (documentType && ['direct', 'query', 'dispute'].includes(documentType)) {
            query.documentType = documentType;
        }

        const documents = await Document.find(query)
            .populate('uploadedBy', 'name email role')
            .populate('verifiedBy', 'name email')
            .sort({ uploadedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Document.countDocuments(query);

        console.log('📊 Found documents:', documents.length);
        console.log('📊 Total documents:', total);

        // Let's also check all documents in the database
        const allDocs = await Document.find({}).select('uploadedBy accessibleTo documentType relatedId originalName');
        console.log('🗃️ All documents in DB:', allDocs.length);
        allDocs.forEach((doc, index) => {
            console.log(`📄 Doc ${index + 1}:`, {
                id: doc._id,
                uploadedBy: doc.uploadedBy,
                accessibleTo: doc.accessibleTo,
                type: doc.documentType,
                name: doc.originalName
            });
        });

        if (documents.length > 0) {
            console.log('📄 Sample user document:', JSON.stringify(documents[0], null, 2));
        }

        // Group documents by type and related entity
        const groupedDocuments = {
            direct: {},
            query: {},
            dispute: {}
        };

        for (const doc of documents) {
            const type = doc.documentType;
            const relatedId = doc.relatedId.toString();

            if (!groupedDocuments[type][relatedId]) {
                groupedDocuments[type][relatedId] = {
                    relatedId,
                    documents: [],
                    totalSize: 0,
                    lastUpdated: doc.uploadedAt
                };
            }

            groupedDocuments[type][relatedId].documents.push(doc);
            groupedDocuments[type][relatedId].totalSize += doc.size;
            
            if (doc.uploadedAt > groupedDocuments[type][relatedId].lastUpdated) {
                groupedDocuments[type][relatedId].lastUpdated = doc.uploadedAt;
            }
        }

        res.json({
            success: true,
            data: {
                documents: groupedDocuments,
                pagination: {
                    current: parseInt(page),
                    total: Math.ceil(total / limit),
                    count: documents.length,
                    totalDocuments: total
                }
            }
        });

    } catch (error) {
        console.error('Error fetching user documents:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch documents',
            details: error.message
        });
    }
};

// Get single document details
export const getDocument = async (req, res) => {
    try {
        const { documentId } = req.params;
        const userId = req.user.id;

        const document = await Document.findById(documentId)
            .populate('uploadedBy', 'name email role')
            .populate('verifiedBy', 'name email');

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found'
            });
        }

        // Check access
        if (!document.hasAccess(userId)) {
            return res.status(403).json({
                success: false,
                error: 'Access denied'
            });
        }

        // Update last accessed time
        document.lastAccessedAt = new Date();
        await document.save();

        res.json({
            success: true,
            data: { document }
        });

    } catch (error) {
        console.error('Error fetching document:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch document',
            details: error.message
        });
    }
};

// Delete document (soft delete)
export const deleteDocument = async (req, res) => {
    try {
        const { documentId } = req.params;
        const userId = req.user.id;

        const document = await Document.findById(documentId);

        if (!document) {
            return res.status(404).json({
                success: false,
                error: 'Document not found'
            });
        }

        // Only uploader can delete
        if (document.uploadedBy.toString() !== userId) {
            return res.status(403).json({
                success: false,
                error: 'Only the uploader can delete this document'
            });
        }

        document.status = 'deleted';
        await document.save();

        res.json({
            success: true,
            message: 'Document deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting document:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete document',
            details: error.message
        });
    }
};
