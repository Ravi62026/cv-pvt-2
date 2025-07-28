import pinataSDK from '@pinata/sdk';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pinata SDK configuration
const PINATA_GATEWAY_URL = 'https://gateway.pinata.cloud/ipfs';

// Initialize Pinata SDK
const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_KEY);

/**
 * Upload file to Pinata IPFS using SDK
 * @param {Object} file - Multer file object
 * @param {Object} metadata - Additional metadata for the file
 * @returns {Promise<Object>} - Upload result with IPFS hash
 */
export const uploadToPinata = async (file, metadata = {}) => {
    try {
        console.log('🔄 Starting Pinata upload for file:', file.originalname);

        // Create readable stream from file
        const readableStreamForFile = fs.createReadStream(file.path);

        // Prepare metadata for Pinata (limited to 10 key-value pairs max)
        const pinataMetadata = {
            name: file.originalname,
            keyvalues: {
                originalName: file.originalname,
                mimeType: file.mimetype,
                size: file.size.toString(),
                uploadedAt: new Date().toISOString(),
                customId: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                // Only include essential metadata to stay under 10 key limit
                uploadedBy: metadata.uploadedBy || 'unknown',
                uploadedByRole: metadata.uploadedByRole || 'unknown',
                messageType: metadata.messageType || 'file'
            }
        };

        const options = {
            pinataMetadata,
            pinataOptions: {
                cidVersion: 0
            }
        };

        console.log('📤 Uploading to Pinata with metadata:', pinataMetadata);

        // Upload to Pinata using SDK
        const result = await pinata.pinFileToIPFS(readableStreamForFile, options);

        console.log('✅ Successfully uploaded to Pinata!');
        console.log('📄 IPFS Hash:', result.IpfsHash);

        // Clean up temporary file
        fs.unlinkSync(file.path);

        return {
            success: true,
            ipfsHash: result.IpfsHash,
            pinSize: result.PinSize,
            timestamp: result.Timestamp,
            url: `${PINATA_GATEWAY_URL}/${result.IpfsHash}`,
            metadata: pinataMetadata
        };
    } catch (error) {
        // Clean up temporary file on error
        if (file.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }

        console.error('❌ Error uploading to Pinata:', error);
        throw new Error(`Failed to upload file to IPFS: ${error.message}`);
    }
};

/**
 * Upload multiple files to Pinata IPFS
 * @param {Array} files - Array of Multer file objects
 * @param {Object} metadata - Additional metadata for the files
 * @returns {Promise<Array>} - Array of upload results
 */
export const uploadMultipleToPinata = async (files, metadata = {}) => {
    try {
        console.log(`🔄 Starting batch upload of ${files.length} files to Pinata`);

        const uploadPromises = files.map((file, index) =>
            uploadToPinata(file, {
                uploadedBy: metadata.uploadedBy || 'unknown',
                uploadedByRole: metadata.uploadedByRole || 'unknown',
                messageType: metadata.messageType || 'file',
                fileIndex: index.toString(),
                totalFiles: files.length.toString()
            })
        );

        const results = await Promise.all(uploadPromises);
        console.log(`✅ Successfully uploaded ${results.length} files to Pinata`);
        return results;
    } catch (error) {
        console.error('❌ Error uploading multiple files to Pinata:', error);
        throw error;
    }
};

/**
 * Get file metadata from Pinata by IPFS hash
 * @param {string} ipfsHash - IPFS hash of the file
 * @returns {Promise<Object>} - File metadata
 */
export const getFileMetadata = async (ipfsHash) => {
    try {
        console.log('🔍 Getting file metadata for hash:', ipfsHash);

        const response = await pinata.pinList({
            hashContains: ipfsHash
        });

        if (response.count === 0) {
            throw new Error('File not found');
        }

        console.log('✅ Found file metadata');
        return response.rows[0];
    } catch (error) {
        console.error('❌ Error getting file metadata:', error);
        throw error;
    }
};

/**
 * Search files by custom metadata
 * @param {Object} searchCriteria - Search criteria for metadata
 * @returns {Promise<Array>} - Array of matching files
 */
export const searchFilesByMetadata = async (searchCriteria) => {
    try {
        console.log('🔍 Searching files by metadata:', searchCriteria);

        const response = await pinata.pinList({
            metadata: {
                keyvalues: searchCriteria
            }
        });

        const results = response.rows.map(row => ({
            ipfsHash: row.ipfs_pin_hash,
            name: row.metadata.name,
            keyvalues: row.metadata.keyvalues,
            size: row.size,
            dateUploaded: row.date_pinned,
            url: `${PINATA_GATEWAY_URL}/${row.ipfs_pin_hash}`
        }));

        console.log(`✅ Found ${results.length} files matching criteria`);
        return results;
    } catch (error) {
        console.error('❌ Error searching files:', error);
        throw error;
    }
};

/**
 * Unpin file from Pinata (delete)
 * @param {string} ipfsHash - IPFS hash of the file to unpin
 * @returns {Promise<boolean>} - Success status
 */
export const unpinFile = async (ipfsHash) => {
    try {
        console.log('🗑️ Unpinning file:', ipfsHash);
        await pinata.unpin(ipfsHash);
        console.log('✅ File unpinned successfully');
        return true;
    } catch (error) {
        console.error('❌ Error unpinning file:', error);
        throw error;
    }
};

/**
 * Get file URL from IPFS hash
 * @param {string} ipfsHash - IPFS hash
 * @returns {string} - Public URL to access the file
 */
export const getFileUrl = (ipfsHash) => {
    return `${PINATA_GATEWAY_URL}/${ipfsHash}`;
};

/**
 * Validate file before upload
 * @param {Object} file - Multer file object
 * @returns {Object} - Validation result
 */
export const validateFile = (file) => {
    const maxSize = parseInt(process.env.MAX_FILE_SIZE) || 10485760; // 10MB default
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
    
    if (!file) {
        return { valid: false, error: 'No file provided' };
    }
    
    if (file.size > maxSize) {
        return { valid: false, error: `File size exceeds limit of ${maxSize / 1024 / 1024}MB` };
    }
    
    if (!allowedTypes.includes(file.mimetype)) {
        return { valid: false, error: 'File type not allowed' };
    }
    
    return { valid: true };
};

export default {
    uploadToPinata,
    uploadMultipleToPinata,
    getFileMetadata,
    searchFilesByMetadata,
    unpinFile,
    getFileUrl,
    validateFile
};
