import express from "express";
import {
    getVerifiedLawyers,
    getLawyerProfile,
    offerHelpOnCase,
    getAvailableCases,
    getMyAssignedCases,
    acceptClientConnection,
    getMyClients,
    getMyDirectClients,
    getLawyerDashboardStats,
    getPendingDirectRequests,
    acceptDirectRequest,
    getMyDirectChats,
    getPendingDirectConnectionRequests,
    acceptDirectConnectionRequest,
    rejectDirectConnectionRequest,
    getMyConnectedCitizens,
    getMyCaseRequests,
    getReceivedCaseRequests,
    acceptCaseRequest,
    rejectCaseRequest,
} from "../controllers/lawyerController.js";
import {
    protect,
    authorize,
    requireVerifiedLawyer,
} from "../middleware/auth.js";
import { cacheMiddleware } from "../middleware/cache.js";
import { withPagination } from "../utils/pagination.js";

const router = express.Router();

// Public routes (with caching)
router.get("/verified",
    withPagination({
        allowedFields: ['name', 'email', 'role', 'lawyerDetails.specialization', 'lawyerDetails.experience', 'createdAt']
    }),
    cacheMiddleware(600),
    getVerifiedLawyers
); // Cache for 10 minutes
router.get("/:lawyerId/profile", cacheMiddleware(300), getLawyerProfile); // Cache for 5 minutes

// Protected routes - Lawyer only
router.use(protect);
router.use(authorize("lawyer"));

// Dashboard and stats (with caching)
router.get("/dashboard/stats", requireVerifiedLawyer, cacheMiddleware(120), getLawyerDashboardStats); // Cache for 2 minutes

// Case management (with caching for GET requests)
router.get("/available-cases",
    requireVerifiedLawyer,
    withPagination({
        allowedFields: ['title', 'description', 'category', 'priority', 'status', 'createdAt', 'caseType', 'hasLawyerRequested']
    }),
    cacheMiddleware(180),
    getAvailableCases
); // Cache for 3 minutes
router.get("/my-cases",
    requireVerifiedLawyer,
    withPagination({
        allowedFields: ['title', 'description', 'category', 'priority', 'status', 'createdAt', 'caseType', 'chatRoom']
    }),
    cacheMiddleware(120),
    getMyAssignedCases
); // Cache for 2 minutes
router.post(
    "/offer-help/:caseType/:caseId",
    requireVerifiedLawyer,
    offerHelpOnCase
); // No cache for mutations

// Client management (with caching for GET requests)
router.get("/my-clients",
    requireVerifiedLawyer,
    withPagination({
        allowedFields: ['name', 'email', 'phone', 'role', 'connectedAt']
    }),
    cacheMiddleware(300),
    getMyClients
); // Cache for 5 minutes
router.get("/my-direct-clients",
    requireVerifiedLawyer,
    withPagination({
        allowedFields: ['name', 'email', 'phone', 'role', 'connectedAt', 'chatId', 'lastChatUpdate']
    }),
    cacheMiddleware(300),
    getMyDirectClients
); // Cache for 5 minutes
router.post(
    "/accept-client/:citizenId",
    requireVerifiedLawyer,
    acceptClientConnection
); // No cache for mutations

// Direct message request management (legacy) - with caching for GET requests
router.get("/pending-requests",
    requireVerifiedLawyer,
    withPagination({
        allowedFields: ['chatId', 'status', 'createdAt', 'participants']
    }),
    cacheMiddleware(60),
    getPendingDirectRequests
); // Cache for 1 minute
router.post("/accept-request/:chatId", requireVerifiedLawyer, acceptDirectRequest); // No cache for mutations
router.get("/my-chats",
    requireVerifiedLawyer,
    withPagination({
        allowedFields: ['chatId', 'status', 'createdAt', 'participants', 'lastMessage']
    }),
    cacheMiddleware(120),
    getMyDirectChats
); // Cache for 2 minutes

// Direct connection management (new system) - with caching for GET requests
router.get("/pending-connection-requests",
    requireVerifiedLawyer,
    withPagination({
        allowedFields: ['citizen', 'status', 'requestedAt', 'requestMessage']
    }),
    cacheMiddleware(60),
    getPendingDirectConnectionRequests
); // Cache for 1 minute
router.post("/accept-connection-request/:connectionId", requireVerifiedLawyer, acceptDirectConnectionRequest); // No cache for mutations
router.post("/reject-connection-request/:connectionId", requireVerifiedLawyer, rejectDirectConnectionRequest); // No cache for mutations
router.get("/connected-citizens",
    requireVerifiedLawyer,
    withPagination({
        allowedFields: ['citizen', 'status', 'connectedAt', 'chatId', 'chatInfo']
    }),
    cacheMiddleware(300),
    getMyConnectedCitizens
); // Cache for 5 minutes

// Case request management (with caching for GET requests)
router.get("/my-case-requests",
    requireVerifiedLawyer,
    withPagination({
        allowedFields: ['requestId', 'caseId', 'caseType', 'caseTitle', 'status', 'message', 'requestedAt', 'citizen']
    }),
    cacheMiddleware(120),
    getMyCaseRequests
); // Cache for 2 minutes
router.get("/received-case-requests",
    requireVerifiedLawyer,
    withPagination({
        allowedFields: ['requestId', 'caseId', 'caseType', 'caseTitle', 'status', 'message', 'requestedAt', 'citizen']
    }),
    cacheMiddleware(120),
    getReceivedCaseRequests
); // Cache for 2 minutes
router.post("/accept-case-request/:requestId", requireVerifiedLawyer, acceptCaseRequest); // No cache for mutations
router.post("/reject-case-request/:requestId", requireVerifiedLawyer, rejectCaseRequest); // No cache for mutations

export default router;
