import express from "express";
import {
    getCitizenDashboard,
    getMyLawyers,
    getMyCases,
    getRecentActivity,
    sendDirectMessageRequest,
    getPendingRequests,
    getReceivedOffers,
    getMyCaseRequests,
    getMyCaseOffers,
    acceptCaseOffer,
    rejectCaseOffer,
    getAvailableLawyers,
    requestLawyerForQuery,
    requestLawyerForDispute,
    sendDirectConnectionRequest,
    revokeConnectionRequest,
    revokeCaseRequest,
    getMyConnectedLawyers,
    getPendingConnectionRequests,
    getMyDirectChats,
    verifyAllLawyers,
} from "../controllers/citizenController.js";
import { protect, authorize } from "../middleware/auth.js";
import { messageLimiter } from "../middleware/rateLimiter.js";
import { cacheMiddleware } from "../middleware/cache.js";
import { withPagination } from "../utils/pagination.js";

const router = express.Router();

// All routes require citizen authentication
router.use(protect);
router.use(authorize("citizen"));

// Dashboard and stats (with caching)
router.get("/dashboard", cacheMiddleware(120), getCitizenDashboard); // Cache for 2 minutes
router.get("/recent-activity", cacheMiddleware(60), getRecentActivity); // Cache for 1 minute

// Lawyer management (with caching)
router.get("/my-lawyers",
    withPagination({
        allowedFields: ['name', 'email', 'phone', 'role', 'lawyerDetails.specialization', 'lawyerDetails.experience', 'connectedAt']
    }),
    cacheMiddleware(300),
    getMyLawyers
); // Cache for 5 minutes
router.get("/available-lawyers",
    withPagination({
        allowedFields: ['name', 'email', 'role', 'lawyerDetails.specialization', 'lawyerDetails.experience', 'createdAt']
    }),
    cacheMiddleware(600),
    getAvailableLawyers
); // Cache for 10 minutes

// Case management (with caching)
router.get("/my-cases",
    withPagination({
        allowedFields: ['title', 'description', 'category', 'priority', 'status', 'createdAt', 'caseType', 'chatRoom']
    }),
    cacheMiddleware(120),
    getMyCases
); // Cache for 2 minutes

// Direct messaging (for general consultation) - Rate limiting disabled
router.post(
    "/message-request/:lawyerId",
    sendDirectMessageRequest
); // No cache for mutations



// Dedicated lawyer request APIs
router.post(
    "/request-lawyer-for-query/:queryId/:lawyerId",
    requestLawyerForQuery
); // No cache for mutations
router.post(
    "/request-lawyer-for-dispute/:disputeId/:lawyerId",
    requestLawyerForDispute
); // No cache for mutations

// Request and offer management (with caching)
router.get("/pending-requests",
    withPagination({
        allowedFields: ['requestId', 'caseId', 'caseType', 'caseTitle', 'status', 'message', 'requestedAt', 'lawyer']
    }),
    cacheMiddleware(60),
    getPendingRequests
); // Cache for 1 minute
router.get("/received-offers",
    withPagination({
        allowedFields: ['requestId', 'caseId', 'caseType', 'caseTitle', 'status', 'message', 'requestedAt', 'lawyer']
    }),
    cacheMiddleware(60),
    getReceivedOffers
); // Cache for 1 minute

// Case-specific request and offer management (with caching for GET requests)
router.get("/my-case-requests",
    withPagination({
        allowedFields: ['requestId', 'caseId', 'caseType', 'caseTitle', 'status', 'message', 'requestedAt', 'lawyer']
    }),
    cacheMiddleware(120),
    getMyCaseRequests
); // Cache for 2 minutes
router.get("/my-case-offers",
    withPagination({
        allowedFields: ['requestId', 'caseId', 'caseType', 'caseTitle', 'status', 'message', 'requestedAt', 'lawyer']
    }),
    cacheMiddleware(120),
    getMyCaseOffers
); // Cache for 2 minutes
router.post("/accept-case-offer/:offerId", acceptCaseOffer); // No cache for mutations
router.post("/reject-case-offer/:offerId", rejectCaseOffer); // No cache for mutations

// Direct connection management (with caching for GET requests)
router.post("/direct-connection-request/:lawyerId", messageLimiter, sendDirectConnectionRequest); // No cache for mutations
router.delete("/revoke-connection-request/:connectionId", revokeConnectionRequest); // Revoke direct connection request
router.get("/connected-lawyers",
    withPagination({
        allowedFields: ['name', 'email', 'phone', 'role', 'lawyerDetails.specialization', 'lawyerDetails.experience', 'connectedAt', 'chatId', 'chatInfo']
    }),
    cacheMiddleware(300),
    getMyConnectedLawyers
); // Cache for 5 minutes
router.get("/pending-connection-requests",
    withPagination({
        allowedFields: ['lawyer', 'status', 'requestedAt', 'requestMessage']
    }),
    cacheMiddleware(60),
    getPendingConnectionRequests
); // Cache for 1 minute
router.get("/direct-chats",
    withPagination({
        allowedFields: ['chatId', 'status', 'createdAt', 'participants', 'lastMessage']
    }),
    cacheMiddleware(120),
    getMyDirectChats
); // Cache for 2 minutes

// Case request management
router.delete("/revoke-case-request/:caseType/:caseId/:lawyerId", revokeCaseRequest); // Revoke case-specific request

export default router;
