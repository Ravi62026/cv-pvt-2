import Consultation from "../models/Consultation.js";
import User from "../models/User.js";
import { validationResult } from "express-validator";

// Create a new consultation request
export const createConsultationRequest = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors.array(),
            });
        }

        const { 
            targetUserId, 
            scheduledDateTime, 
            duration, 
            description, 
            consultationType = 'video' 
        } = req.body;

        // Validate target user exists and is a lawyer
        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: "Target user not found",
            });
        }

        if (targetUser.role !== 'lawyer') {
            return res.status(400).json({
                success: false,
                message: "Consultations can only be requested with lawyers",
            });
        }

        // Check if the requested time is in the future
        const requestedTime = new Date(scheduledDateTime);
        const now = new Date();
        if (requestedTime <= now) {
            return res.status(400).json({
                success: false,
                message: "Consultation time must be in the future",
            });
        }

        // Check for conflicts (optional - can be enhanced later)
        const existingConsultation = await Consultation.findOne({
            lawyer: targetUserId,
            scheduledDateTime: {
                $gte: new Date(requestedTime.getTime() - 30 * 60 * 1000), // 30 minutes before
                $lte: new Date(requestedTime.getTime() + 30 * 60 * 1000), // 30 minutes after
            },
            status: { $in: ['scheduled', 'confirmed', 'in-progress'] }
        });

        if (existingConsultation) {
            return res.status(409).json({
                success: false,
                message: "The lawyer has another consultation scheduled at this time",
            });
        }

        // Create consultation
        const consultation = await Consultation.create({
            title: `Consultation with ${targetUser.name}`,
            description,
            citizen: req.user._id,
            lawyer: targetUserId,
            consultationType,
            scheduledDateTime: requestedTime,
            duration: duration || 30,
            status: 'requested'
        });

        // Populate the consultation with user details
        await consultation.populate([
            { path: 'citizen', select: 'name email role' },
            { path: 'lawyer', select: 'name email role lawyerDetails.specialization' }
        ]);

        // Send real-time notification to lawyer
        const io = req.app.get("socketio");
        if (io) {
            io.to(`user_${targetUserId}`).emit("new_consultation_request", {
                consultationId: consultation._id,
                citizen: {
                    _id: req.user._id,
                    name: req.user.name,
                    email: req.user.email,
                },
                scheduledDateTime: requestedTime,
                duration,
                description,
                consultationType,
                timestamp: new Date(),
            });
        }

        res.status(201).json({
            success: true,
            message: "Consultation request created successfully",
            data: { consultation },
        });
    } catch (error) {
        console.error("Create consultation error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to create consultation request",
            error: error.message,
        });
    }
};

// Get user's consultations
export const getUserConsultations = async (req, res) => {
    try {
        const { page = 1, limit = 20, status } = req.query;
        const userId = req.user._id;

        // Build query based on user role
        let query = {};
        if (req.user.role === 'citizen') {
            query.citizen = userId;
        } else if (req.user.role === 'lawyer') {
            query.lawyer = userId;
        } else {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        // Add status filter if provided
        if (status) {
            query.status = status;
        }

        const consultations = await Consultation.find(query)
            .populate('citizen', 'name email role')
            .populate('lawyer', 'name email role lawyerDetails.specialization')
            .sort({ scheduledDateTime: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Consultation.countDocuments(query);

        res.json({
            success: true,
            data: {
                consultations,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        console.error("Get consultations error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch consultations",
            error: error.message,
        });
    }
};

// Get consultation by ID
export const getConsultationById = async (req, res) => {
    try {
        const { consultationId } = req.params;
        const userId = req.user._id;

        const consultation = await Consultation.findById(consultationId)
            .populate('citizen', 'name email role')
            .populate('lawyer', 'name email role lawyerDetails.specialization');

        if (!consultation) {
            return res.status(404).json({
                success: false,
                message: "Consultation not found",
            });
        }

        // Check if user is authorized to view this consultation
        const isAuthorized = consultation.citizen._id.toString() === userId.toString() ||
                           consultation.lawyer._id.toString() === userId.toString();

        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        res.json({
            success: true,
            data: { consultation },
        });
    } catch (error) {
        console.error("Get consultation error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch consultation",
            error: error.message,
        });
    }
};

// Update consultation status (for lawyers)
export const updateConsultationStatus = async (req, res) => {
    try {
        const { consultationId } = req.params;
        const { status, meetingLink, notes } = req.body;
        const userId = req.user._id;

        const consultation = await Consultation.findById(consultationId);
        if (!consultation) {
            return res.status(404).json({
                success: false,
                message: "Consultation not found",
            });
        }

        // Only lawyers can update consultation status
        if (req.user.role !== 'lawyer' || consultation.lawyer.toString() !== userId.toString()) {
            return res.status(403).json({
                success: false,
                message: "Only the assigned lawyer can update consultation status",
            });
        }

        // Update consultation
        consultation.status = status;
        if (meetingLink) {
            consultation.meetingDetails.meetingLink = meetingLink;
            consultation.meetingDetails.platform = 'custom';
        }
        if (notes) {
            consultation.notes.lawyerNotes = notes;
        }

        // Generate meeting link if confirming
        if (status === 'confirmed' && !consultation.meetingDetails.meetingLink) {
            consultation.generateMeetingLink();
        }

        await consultation.save();

        // Populate for response
        await consultation.populate([
            { path: 'citizen', select: 'name email role' },
            { path: 'lawyer', select: 'name email role lawyerDetails.specialization' }
        ]);

        // Send real-time notification to citizen
        const io = req.app.get("socketio");
        if (io) {
            io.to(`user_${consultation.citizen._id}`).emit("consultation_status_updated", {
                consultationId: consultation._id,
                status,
                meetingLink: consultation.meetingDetails.meetingLink,
                lawyer: {
                    _id: req.user._id,
                    name: req.user.name,
                },
                timestamp: new Date(),
            });
        }

        res.json({
            success: true,
            message: "Consultation status updated successfully",
            data: { consultation },
        });
    } catch (error) {
        console.error("Update consultation error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update consultation",
            error: error.message,
        });
    }
};

// Cancel consultation
export const cancelConsultation = async (req, res) => {
    try {
        const { consultationId } = req.params;
        const { reason } = req.body;
        const userId = req.user._id;

        const consultation = await Consultation.findById(consultationId);
        if (!consultation) {
            return res.status(404).json({
                success: false,
                message: "Consultation not found",
            });
        }

        // Check if user is authorized to cancel
        const isAuthorized = consultation.citizen.toString() === userId.toString() ||
                           consultation.lawyer.toString() === userId.toString();

        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        // Check if consultation can be cancelled
        if (!consultation.canBeCancelled()) {
            return res.status(400).json({
                success: false,
                message: "Consultation cannot be cancelled (less than 2 hours remaining)",
            });
        }

        // Update consultation
        consultation.status = 'cancelled';
        consultation.cancellation = {
            cancelledBy: userId,
            reason: reason || 'No reason provided',
            cancelledAt: new Date(),
        };

        await consultation.save();

        // Populate for response
        await consultation.populate([
            { path: 'citizen', select: 'name email role' },
            { path: 'lawyer', select: 'name email role lawyerDetails.specialization' }
        ]);

        // Send real-time notification to the other party
        const otherUserId = consultation.citizen.toString() === userId.toString() 
            ? consultation.lawyer._id 
            : consultation.citizen._id;

        const io = req.app.get("socketio");
        if (io) {
            io.to(`user_${otherUserId}`).emit("consultation_cancelled", {
                consultationId: consultation._id,
                cancelledBy: {
                    _id: req.user._id,
                    name: req.user.name,
                    role: req.user.role,
                },
                reason,
                timestamp: new Date(),
            });
        }

        res.json({
            success: true,
            message: "Consultation cancelled successfully",
            data: { consultation },
        });
    } catch (error) {
        console.error("Cancel consultation error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to cancel consultation",
            error: error.message,
        });
    }
};
