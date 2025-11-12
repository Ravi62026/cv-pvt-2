import express from "express";
import {
    createDispute,
    getDisputes,
    getDisputeById,
    sendDisputeRequest,
    requestToHandleDispute,
    offerHelpOnDispute,
    respondToDisputeRequest,
    respondToLawyerRequest,
    updateDisputeStatus,
} from "../controllers/disputeController.js";
import { validateDispute } from "../middleware/validation.js";
import {
    protect,
    authorize,
    requireVerifiedLawyer,
} from "../middleware/auth.js";
import { cacheMiddleware } from "../middleware/cache.js";
import { withPagination } from "../utils/pagination.js";

const router = express.Router();

// All routes require authentication
router.use(protect);

// Citizen routes
router.post("/", authorize("citizen"), validateDispute, createDispute); // No cache for mutations

// Bidirectional request routes (both citizen and lawyer can use)
router.post(
    "/:disputeId/send-request",
    sendDisputeRequest
); // No cache for mutations
router.post(
    "/:disputeId/requests/:requestId/respond",
    respondToDisputeRequest
); // No cache for mutations

// Legacy routes for backward compatibility
router.post(
    "/:disputeId/request",
    authorize("lawyer"),
    requireVerifiedLawyer,
    requestToHandleDispute
); // No cache for mutations
router.post(
    "/:disputeId/offer-help",
    authorize("lawyer"),
    requireVerifiedLawyer,
    offerHelpOnDispute
); // No cache for mutations

// Common routes (with caching for GET requests)
router.get("/",
    withPagination({
        allowedFields: ['title', 'description', 'category', 'priority', 'status', 'disputeValue', 'createdAt', 'citizen', 'assignedLawyer', 'opposingParty']
    }),
    cacheMiddleware(180),
    getDisputes
); // Cache for 3 minutes
router.get("/:disputeId", cacheMiddleware(300), getDisputeById); // Cache for 5 minutes
router.patch("/:disputeId/status", updateDisputeStatus); // No cache for mutations

export default router;
