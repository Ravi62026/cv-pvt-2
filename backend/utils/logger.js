/**
 * Winston Logger Configuration
 * Comprehensive request logging with rotation and structured logs
 */

import winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define log levels
const logLevels = {
    error: 0,
    warn: 1,
    info: 2,
    http: 3,
    debug: 4
};

// Define log colors
const logColors = {
    error: 'red',
    warn: 'yellow',
    info: 'green',
    http: 'magenta',
    debug: 'blue'
};

winston.addColors(logColors);

// Create logs directory if it doesn't exist
import fs from 'fs';
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
}

// Custom log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;

        // Add request ID if available
        if (meta.requestId) {
            log = `[${meta.requestId}] ${log}`;
        }

        // Add user info if available
        if (meta.userId) {
            log += ` | User: ${meta.userId}`;
        }

        // Add IP address if available
        if (meta.ip) {
            log += ` | IP: ${meta.ip}`;
        }

        // Add response time if available
        if (meta.responseTime) {
            log += ` | ${meta.responseTime}ms`;
        }

        // Add error stack if available
        if (meta.stack) {
            log += `\n${meta.stack}`;
        }

        // Add additional metadata
        if (Object.keys(meta).length > 0 && !meta.requestId && !meta.userId && !meta.ip && !meta.responseTime && !meta.stack) {
            log += ` | ${JSON.stringify(meta)}`;
        }

        return log;
    })
);

// Console transport for development - show HTTP logs too
const consoleTransport = new winston.transports.Console({
    level: process.env.LOG_LEVEL || 'http', // Changed from 'debug' to 'http' to show HTTP logs
    format: winston.format.combine(
        winston.format.colorize({ all: true }),
        logFormat
    ),
    handleExceptions: true,
    handleRejections: true
});

// File transport for all logs
const allLogsTransport = new DailyRotateFile({
    filename: path.join(logsDir, 'app-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '14d',
    level: 'info',
    format: logFormat,
    handleExceptions: true,
    handleRejections: true
});

// Error logs transport
const errorLogsTransport = new DailyRotateFile({
    filename: path.join(logsDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '30d',
    level: 'error',
    format: logFormat,
    handleExceptions: true,
    handleRejections: true
});

// HTTP request logs transport
const httpLogsTransport = new DailyRotateFile({
    filename: path.join(logsDir, 'http-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    maxSize: '20m',
    maxFiles: '7d',
    level: 'http',
    format: logFormat
});

// Create the logger
export const logger = winston.createLogger({
    levels: logLevels,
    transports: [
        consoleTransport,
        allLogsTransport,
        errorLogsTransport,
        httpLogsTransport
    ],
    exitOnError: false
});

// Request logging middleware
export const requestLogger = (req, res, next) => {
    const start = Date.now();
    const requestId = generateRequestId();

    // Add request ID to request object
    req.requestId = requestId;

    // Log incoming request
    logger.http('Request received', {
        requestId,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        userId: req.user?.id || req.user?._id,
        body: req.method !== 'GET' ? sanitizeRequestBody(req.body) : undefined,
        query: req.query,
        params: req.params
    });

    // Override res.end to log response
    const originalEnd = res.end;
    res.end = function(chunk, encoding) {
        const duration = Date.now() - start;

        // Log response
        logger.http('Request completed', {
            requestId,
            method: req.method,
            url: req.originalUrl,
            statusCode: res.statusCode,
            responseTime: duration,
            contentLength: res.get('Content-Length') || (chunk ? chunk.length : 0),
            userId: req.user?.id || req.user?._id
        });

        // Call original end method
        originalEnd.call(this, chunk, encoding);
    };

    next();
};

// Error logging middleware
export const errorLogger = (error, req, res, next) => {
    logger.error('Request error', {
        requestId: req.requestId,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip || req.connection.remoteAddress,
        userId: req.user?.id || req.user?._id,
        error: error.message,
        stack: error.stack,
        body: req.method !== 'GET' ? sanitizeRequestBody(req.body) : undefined
    });

    next(error);
};

// Generate unique request ID
const generateRequestId = () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

// Sanitize request body for logging (remove sensitive data)
const sanitizeRequestBody = (body) => {
    if (!body || typeof body !== 'object') return body;

    const sanitized = { ...body };

    // Remove sensitive fields
    const sensitiveFields = ['password', 'confirmPassword', 'token', 'refreshToken', 'secret', 'key'];
    sensitiveFields.forEach(field => {
        if (sanitized[field]) {
            sanitized[field] = '[REDACTED]';
        }
    });

    return sanitized;
};

// Performance logging helper
export const logPerformance = (operation, startTime, metadata = {}) => {
    const duration = Date.now() - startTime;
    logger.info(`Performance: ${operation}`, {
        operation,
        duration: `${duration}ms`,
        ...metadata
    });
};

// Database operation logging
export const logDatabaseOperation = (operation, collection, duration, metadata = {}) => {
    logger.debug(`Database: ${operation}`, {
        operation,
        collection,
        duration: `${duration}ms`,
        ...metadata
    });
};

// Cache operation logging
export const logCacheOperation = (operation, key, duration, metadata = {}) => {
    logger.debug(`Cache: ${operation}`, {
        operation,
        key,
        duration: `${duration}ms`,
        ...metadata
    });
};

export default logger;