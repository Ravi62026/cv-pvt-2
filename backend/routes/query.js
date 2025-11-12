import express from "express";
import {
    createQuery,
    getQueries,
    getQueryById,
    sendQueryRequest,
    requestToHandleQuery,
    offerHelpOnQuery,
    respondToQueryRequest,
    respondToLawyerRequest,
    updateQueryStatus,
} from "../controllers/queryController.js";
import { validateQuery } from "../middleware/validation.js";
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
router.post("/", authorize("citizen"), validateQuery, createQuery); // No cache for mutations

// Bidirectional request routes (both citizen and lawyer can use)
router.post(
    "/:queryId/send-request",
    sendQueryRequest
); // No cache for mutations
router.post(
    "/:queryId/requests/:requestId/respond",
    respondToQueryRequest
); // No cache for mutations

// Legacy routes for backward compatibility
router.post(
    "/:queryId/request",
    authorize("lawyer"),
    requireVerifiedLawyer,
    requestToHandleQuery
); // No cache for mutations
router.post(
    "/:queryId/offer-help",
    authorize("lawyer"),
    requireVerifiedLawyer,
    offerHelpOnQuery
); // No cache for mutations

// Common routes (with caching for GET requests)
router.get("/",
    withPagination({
        allowedFields: ['title', 'description', 'category', 'priority', 'status', 'createdAt', 'citizen', 'assignedLawyer']
    }),
    cacheMiddleware(180),
    getQueries
); // Cache for 3 minutes
router.get("/:queryId", cacheMiddleware(300), getQueryById); // Cache for 5 minutes
router.patch("/:queryId/status", updateQueryStatus); // No cache for mutations

export default router;
