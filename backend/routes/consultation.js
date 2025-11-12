import express from "express";
import {
    createConsultationRequest,
    getUserConsultations,
    getConsultationById,
    updateConsultationStatus,
    cancelConsultation,
} from "../controllers/consultationController.js";
import { protect, authorize } from "../middleware/auth.js";
import { body } from "express-validator";

const router = express.Router();

// Validation middleware for consultation creation
const validateConsultationRequest = [
    body("targetUserId")
        .notEmpty()
        .withMessage("Target user ID is required")
        .isMongoId()
        .withMessage("Invalid target user ID"),
    body("scheduledDateTime")
        .notEmpty()
        .withMessage("Scheduled date and time is required")
        .isISO8601()
        .withMessage("Invalid date format"),
    body("duration")
        .optional()
        .isInt({ min: 15, max: 180 })
        .withMessage("Duration must be between 15 and 180 minutes"),
    body("description")
        .optional()
        .isLength({ max: 500 })
        .withMessage("Description cannot exceed 500 characters"),
    body("consultationType")
        .optional()
        .isIn(["video", "audio", "in-person"])
        .withMessage("Invalid consultation type"),
];

// Validation middleware for status update
const validateStatusUpdate = [
    body("status")
        .notEmpty()
        .withMessage("Status is required")
        .isIn(["scheduled", "confirmed", "cancelled", "completed"])
        .withMessage("Invalid status"),
    body("meetingLink")
        .optional()
        .isURL()
        .withMessage("Invalid meeting link URL"),
    body("notes")
        .optional()
        .isLength({ max: 1000 })
        .withMessage("Notes cannot exceed 1000 characters"),
];

// Validation middleware for cancellation
const validateCancellation = [
    body("reason")
        .optional()
        .isLength({ max: 500 })
        .withMessage("Reason cannot exceed 500 characters"),
];

import { cacheMiddleware } from "../middleware/cache.js";

// All routes require authentication
router.use(protect);

// Create consultation request (citizens only)
router.post(
    "/request",
    authorize("citizen"),
    validateConsultationRequest,
    createConsultationRequest
); // No cache for mutations

// Get user's consultations (with caching)
router.get("/", cacheMiddleware(120), getUserConsultations); // Cache for 2 minutes

// Get specific consultation (with caching)
router.get("/:consultationId", cacheMiddleware(180), getConsultationById); // Cache for 3 minutes

// Update consultation status (lawyers only)
router.patch(
    "/:consultationId/status",
    authorize("lawyer"),
    validateStatusUpdate,
    updateConsultationStatus
); // No cache for mutations

// Cancel consultation
router.patch(
    "/:consultationId/cancel",
    validateCancellation,
    cancelConsultation
);

export default router;
