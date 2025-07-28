import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import {
    getUserChats,
    getChatById,
    createDirectChat,
    getChatMessages,
    getCaseChat,
    getCaseChatMessages,
} from "../controllers/chatController.js";
import { validateMessage } from "../middleware/validation.js";
import { protect } from "../middleware/auth.js";
import { messageLimiter } from "../middleware/rateLimiter.js";
import { uploadToPinata, validateFile } from "../utils/pinataService.js";
import Document from "../models/Document.js";
import Chat from "../models/Chat.js";
import axios from "axios";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Configure multer for chat file uploads
import os from 'os';
import fs from 'fs';

// Create temp directory if it doesn't exist
const tempDir = process.env.NODE_ENV === 'production'
    ? path.join(os.tmpdir(), 'uploads')
    : path.join(__dirname, '../temp/uploads/');

// Ensure directory exists
if (!fs.existsSync(tempDir)) {
    fs.mkdirSync(tempDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, tempDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'chat-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10485760, // 10MB default
    },
    fileFilter: function (req, file, cb) {
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
            cb(new Error('Invalid file type for chat. Only documents and images are allowed.'));
        }
    }
});

// All routes require authentication
router.use(protect);

// Get user's chats
router.get("/", getUserChats);

// Create or get direct chat with another user
router.post("/direct/:userId", createDirectChat);

// Case-specific chats
router.get("/case/:caseType/:caseId", getCaseChat);
router.get("/case/:caseType/:caseId/messages", getCaseChatMessages);

// Get specific chat by ID
router.get("/:chatId", getChatById);

// Get chat messages with pagination
router.get("/:chatId/messages", getChatMessages);

// Upload file for chat message
router.post('/upload-file', upload.single('file'), async (req, res) => {
    try {
        const { chatId, description } = req.body;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                error: 'No file uploaded'
            });
        }

        // Validate file
        const fileValidation = validateFile(req.file);
        if (!fileValidation.valid) {
            return res.status(400).json({
                success: false,
                error: fileValidation.error
            });
        }

        // Upload to Pinata
        const uploadMetadata = {
            chatId,
            uploadedBy: req.user.id,
            uploadedByRole: req.user.role,
            description: description || '',
            messageType: 'file'
        };

        const uploadResult = await uploadToPinata(req.file, uploadMetadata);

        // Also save to document repository if it's a case chat
        let documentId = null;
        console.log('Chat upload - checking if should save to document repository');
        console.log('ChatId:', chatId);

        if (chatId.startsWith('query_') || chatId.startsWith('dispute_') || chatId.startsWith('direct_')) {
            try {
                const [documentType, relatedId] = chatId.split('_');
                console.log('Saving to document repository:', { documentType, relatedId });

                // Determine accessible users based on chat participants
                const chat = await Chat.findOne({ chatId }).populate('participants.user');
                const accessibleUsers = [];

                if (chat) {
                    chat.participants.forEach(participant => {
                        accessibleUsers.push({
                            userId: participant.user._id,
                            role: participant.user.role
                        });
                    });
                }

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
                    uploadedBy: req.user.id,
                    uploadedByRole: req.user.role,
                    accessibleTo: accessibleUsers,
                    description: description || 'Shared in chat',
                    documentCategory: 'correspondence',
                    tags: ['chat', 'shared'],
                    pinataMetadata: uploadResult.metadata
                });

                await document.save();
                documentId = document._id;
                console.log('✅ Document saved successfully with ID:', documentId);
                console.log('📄 Document details:', {
                    uploadedBy: document.uploadedBy,
                    uploadedByRole: document.uploadedByRole,
                    accessibleTo: document.accessibleTo,
                    documentType: document.documentType,
                    relatedId: document.relatedId
                });
            } catch (docError) {
                console.error('Error saving document to repository:', docError);
                // Don't fail the upload if document saving fails
            }
        }

        // Return file data for socket message
        res.json({
            success: true,
            message: 'File uploaded successfully',
            data: {
                ipfsHash: uploadResult.ipfsHash,
                originalName: req.file.originalname,
                mimeType: req.file.mimetype,
                size: req.file.size,
                url: uploadResult.url,
                documentId
            }
        });

    } catch (error) {
        console.error('Error uploading chat file:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to upload file',
            details: error.message
        });
    }
});

// Masked file access route (with token-based auth for direct browser access)
router.get('/file/:ipfsHash', async (req, res) => {
    try {
        const { ipfsHash } = req.params;
        const { token } = req.query;
        console.log('🎭 Masked file access requested for:', ipfsHash);
        console.log('🔑 Token provided:', token ? 'Yes' : 'No');

        // Validate IPFS hash format
        if (!ipfsHash || !ipfsHash.startsWith('Qm')) {
            console.log('❌ Invalid IPFS hash format:', ipfsHash);
            return res.status(400).json({ error: 'Invalid IPFS hash' });
        }

        // Verify token if provided
        let user = null;
        if (token) {
            try {
                const jwt = require('jsonwebtoken');
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const User = require('../models/User');
                user = await User.findById(decoded.id);
                console.log('✅ Token verified for user:', user?.name);
            } catch (tokenError) {
                console.log('❌ Invalid token:', tokenError.message);
                return res.status(401).json({ error: 'Invalid token' });
            }
        } else {
            console.log('❌ No token provided');
            return res.status(401).json({ error: 'Not authorized, no token provided' });
        }

        // Check if user has access to this file
        const document = await Document.findOne({ ipfsHash });
        if (!document) {
            console.log('❌ Document not found for hash:', ipfsHash);
            return res.status(404).json({ error: 'File not found' });
        }

        console.log('✅ Document found:', document.originalName);
        console.log('📄 Document details:', {
            name: document.originalName,
            type: document.mimeType,
            size: document.size
        });

        // Check if user has access to this document
        const hasAccess = document.uploadedBy.toString() === user._id.toString() ||
                         document.accessibleTo.some(access => access.userId.toString() === user._id.toString());

        if (!hasAccess) {
            console.log('❌ User does not have access to this file');
            return res.status(403).json({ error: 'Access denied' });
        }

        console.log('✅ User has access to file');

        // Construct Pinata URL
        const pinataUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
        console.log('🔗 Fetching from Pinata:', pinataUrl);

        // Stream the file from Pinata
        const response = await axios({
            method: 'GET',
            url: pinataUrl,
            responseType: 'stream'
        });

        console.log('✅ Successfully fetched from Pinata, streaming to client...');

        // Set appropriate headers
        res.set({
            'Content-Type': document.mimeType || response.headers['content-type'],
            'Content-Disposition': `inline; filename="${document.originalName}"`,
            'Cache-Control': 'public, max-age=31536000' // Cache for 1 year
        });

        // Pipe the response
        response.data.pipe(res);

    } catch (error) {
        console.error('❌ Error serving masked file:', error);
        res.status(500).json({ error: 'Failed to serve file' });
    }
});

// Messages are sent via Socket.io real-time events, not HTTP endpoints
// Real-time messaging provides better user experience and instant delivery
// File uploads are handled via HTTP, then file data is sent via Socket.io

export default router;
 