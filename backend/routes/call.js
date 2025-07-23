import express from "express";
import {
    initiateCall,
    answerCall,
    endCall,
    rejectCall,
    getCallHistory,
    getActiveCalls,
    getCallStats,
    getCallById,
} from "../controllers/callController.js";
import { protect } from "../middleware/auth.js";
import { body, param } from "express-validator";

const router = express.Router();

// Validation middleware for call initiation
const validateCallInitiation = [
    body("targetUserId")
        .notEmpty()
        .withMessage("Target user ID is required")
        .isMongoId()
        .withMessage("Invalid target user ID"),
    body("callType")
        .notEmpty()
        .withMessage("Call type is required")
        .isIn(["voice", "video"])
        .withMessage("Call type must be either 'voice' or 'video'"),
    body("chatId")
        .notEmpty()
        .withMessage("Chat ID is required")
        .isString()
        .withMessage("Chat ID must be a string"),
];

// Validation middleware for call ID parameter
const validateCallId = [
    param("callId")
        .notEmpty()
        .withMessage("Call ID is required")
        .isUUID()
        .withMessage("Invalid call ID format"),
];

// Validation middleware for call end/reject
const validateCallEnd = [
    body("reason")
        .optional()
        .isIn(["completed", "missed", "rejected", "failed", "timeout"])
        .withMessage("Invalid end reason"),
];

// All routes require authentication
router.use(protect);

// Initiate a call
router.post("/initiate", validateCallInitiation, initiateCall);

// Answer a call
router.patch("/:callId/answer", validateCallId, answerCall);

// End a call
router.patch("/:callId/end", validateCallId, validateCallEnd, endCall);

// Reject a call
router.patch("/:callId/reject", validateCallId, validateCallEnd, rejectCall);

// Get call history
router.get("/history", getCallHistory);

// Get active calls
router.get("/active", getActiveCalls);

// Get call statistics
router.get("/stats", getCallStats);

// Get specific call
router.get("/:callId", validateCallId, getCallById);

export default router;
