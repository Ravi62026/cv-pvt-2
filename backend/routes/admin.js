import express from "express";
import {
    getDashboardAnalytics,
    getAllUsers,
    getPendingLawyerVerifications,
    updateLawyerVerification,
    toggleUserStatus,
    getSystemStats,
} from "../controllers/adminController.js";
import { protect, authorize } from "../middleware/auth.js";
import { cacheMiddleware } from "../middleware/cache.js";

const router = express.Router();

// All routes require admin authentication
router.use(protect);
router.use(authorize("admin"));

// Dashboard and analytics (with caching)
router.get("/dashboard/analytics", cacheMiddleware(120), getDashboardAnalytics); // Cache for 2 minutes
router.get("/system/stats", cacheMiddleware(60), getSystemStats); // Cache for 1 minute

// User management (with caching)
router.get("/users", cacheMiddleware(300), getAllUsers); // Cache for 5 minutes
router.patch("/users/:userId/toggle-status", toggleUserStatus); // No cache for mutations

// Lawyer verification (with caching)
router.get("/lawyers/pending-verifications", cacheMiddleware(60), getPendingLawyerVerifications); // Cache for 1 minute
router.patch("/lawyers/:lawyerId/verification", updateLawyerVerification); // No cache for mutations

export default router;
