import axios from 'axios';
import fs from 'fs';
import path from 'path';
import FormData from 'form-data';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pinata API configuration
const PINATA_API_URL = 'https://api.pinata.cloud';
const PINATA_GATEWAY_URL = 'https://gateway.pinata.cloud/ipfs';

const pinataAxios = axios.create({
    baseURL: PINATA_API_URL,
    headers: {
        'pinata_api_key': process.env.PINATA_API_KEY,
        'pinata_secret_api_key': process.env.PINATA_SECRET_KEY
    }
});

/**
 * Upload file to Pinata IPFS
 * @param {Object} file - Multer file object
 * @param {Object} metadata - Additional metadata for the file
 * @returns {Promise<Object>} - Upload result with IPFS hash
 */
export const uploadToPinata = async (file, metadata = {}) => {
    try {
        // Create form data
        const formData = new FormData();
        formData.append('file', fs.createReadStream(file.path));

        // Add metadata
        const pinataMetadata = {
            name: file.originalname,
            keyvalues: {
                originalName: file.originalname,
                mimeType: file.mimetype,
                size: file.size.toString(),
                uploadedAt: new Date().toISOString(),
                ...metadata
            }
        };

        formData.append('pinataMetadata', JSON.stringify(pinataMetadata));
        formData.append('pinataOptions', JSON.stringify({ cidVersion: 0 }));

        // Upload to Pinata
        const response = await pinataAxios.post('/pinning/pinFileToIPFS', formData, {
            headers: {
                ...formData.getHeaders(),
                'pinata_api_key': process.env.PINATA_API_KEY,
                'pinata_secret_api_key': process.env.PINATA_SECRET_KEY
            }
        });

        // Clean up temporary file
        fs.unlinkSync(file.path);

        return {
            success: true,
            ipfsHash: response.data.IpfsHash,
            pinSize: response.data.PinSize,
            timestamp: response.data.Timestamp,
            url: `${PINATA_GATEWAY_URL}/${response.data.IpfsHash}`,
            metadata: pinataMetadata
        };
    } catch (error) {
        // Clean up temporary file on error
        if (file.path && fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
        }

        console.error('Error uploading to Pinata:', error);
        throw new Error(`Failed to upload file to IPFS: ${error.response?.data?.error || error.message}`);
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
        const uploadPromises = files.map((file, index) => 
            uploadToPinata(file, { 
                ...metadata, 
                fileIndex: index.toString(),
                totalFiles: files.length.toString()
            })
        );
        
        const results = await Promise.all(uploadPromises);
        return results;
    } catch (error) {
        console.error('Error uploading multiple files to Pinata:', error);
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
        const response = await pinataAxios.get('/data/pinList', {
            params: {
                hashContains: ipfsHash
            }
        });

        if (response.data.count === 0) {
            throw new Error('File not found');
        }

        return response.data.rows[0];
    } catch (error) {
        console.error('Error getting file metadata:', error);
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
        const response = await pinataAxios.get('/data/pinList', {
            params: {
                metadata: JSON.stringify({
                    keyvalues: searchCriteria
                })
            }
        });

        return response.data.rows.map(row => ({
            ipfsHash: row.ipfs_pin_hash,
            name: row.metadata.name,
            keyvalues: row.metadata.keyvalues,
            size: row.size,
            dateUploaded: row.date_pinned,
            url: `${PINATA_GATEWAY_URL}/${row.ipfs_pin_hash}`
        }));
    } catch (error) {
        console.error('Error searching files:', error);
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
        await pinataAxios.delete(`/pinning/unpin/${ipfsHash}`);
        return true;
    } catch (error) {
        console.error('Error unpinning file:', error);
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
