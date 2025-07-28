import express from "express";
import {
    register,
    login,
    logout,
    refreshToken,
    getCurrentUser,
    updateProfile,
    forgotPassword,
    resetPassword,
    updatePassword,
} from "../controllers/authController.js";
import {
    validateRegister,
    validateLogin,
    validateProfileUpdate,
    validateForgotPassword,
    validateResetPassword,
    validatePasswordChange,
} from "../middleware/validation.js";
import { protect } from "../middleware/auth.js";
import { authLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

// Public routes - Rate limiting disabled for better UX
router.post("/register", validateRegister, register);
router.post("/login", validateLogin, login);
router.post("/refresh-token", refreshToken);
router.post("/forgot-password", validateForgotPassword, forgotPassword);
router.post("/reset-password", validateResetPassword, resetPassword);

// Protected routes
router.use(protect); // All routes below require authentication

router.post("/logout", logout);
router.get("/me", getCurrentUser);
router.put("/profile", validateProfileUpdate, updateProfile);
router.put("/update-password", validatePasswordChange, updatePassword);

export default router;
