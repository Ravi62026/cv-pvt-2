// Middleware to check if lawyer is verified before accessing protected routes
export const requireVerifiedLawyer = (req, res, next) => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        // If user is not a lawyer, allow access (citizens and admins don't need verification)
        if (req.user.role !== "lawyer") {
            return next();
        }

        // Check if lawyer is verified
        if (!req.user.isVerified) {
            return res.status(403).json({
                success: false,
                message: "Your lawyer account is pending verification. Please wait for admin approval before accessing this feature.",
                code: "LAWYER_NOT_VERIFIED",
                data: {
                    verificationStatus: req.user.lawyerDetails?.verificationStatus || "pending",
                    isVerified: false,
                    role: "lawyer"
                }
            });
        }

        // Check if lawyer account is active
        if (!req.user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Your account has been deactivated. Please contact support.",
                code: "ACCOUNT_DEACTIVATED"
            });
        }

        // Lawyer is verified and active, allow access
        next();
    } catch (error) {
        console.error("Lawyer verification middleware error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// Middleware specifically for lawyer-only routes (stricter check)
export const requireLawyerRole = (req, res, next) => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Authentication required",
            });
        }

        // Check if user is a lawyer
        if (req.user.role !== "lawyer") {
            return res.status(403).json({
                success: false,
                message: "This feature is only available to lawyers",
                code: "LAWYER_ROLE_REQUIRED"
            });
        }

        // Check if lawyer is verified
        if (!req.user.isVerified) {
            return res.status(403).json({
                success: false,
                message: "Your lawyer account is pending verification. Please wait for admin approval.",
                code: "LAWYER_NOT_VERIFIED",
                data: {
                    verificationStatus: req.user.lawyerDetails?.verificationStatus || "pending",
                    isVerified: false,
                    role: "lawyer"
                }
            });
        }

        // Check if lawyer account is active
        if (!req.user.isActive) {
            return res.status(403).json({
                success: false,
                message: "Your account has been deactivated. Please contact support.",
                code: "ACCOUNT_DEACTIVATED"
            });
        }

        // All checks passed
        next();
    } catch (error) {
        console.error("Lawyer role middleware error:", error);
        res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

// Middleware to check verification status and provide appropriate response
export const checkVerificationStatus = (req, res, next) => {
    try {
        // Add verification info to response for frontend
        if (req.user && req.user.role === "lawyer") {
            req.verificationInfo = {
                isVerified: req.user.isVerified,
                verificationStatus: req.user.lawyerDetails?.verificationStatus || "pending",
                canAccessFeatures: req.user.isVerified && req.user.isActive
            };
        }
        
        next();
    } catch (error) {
        console.error("Verification status check error:", error);
        next(); // Don't block the request, just continue
    }
};
