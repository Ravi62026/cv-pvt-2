import Call from "../models/Call.js";
import User from "../models/User.js";
import Chat from "../models/Chat.js";
import { validationResult } from "express-validator";
import { v4 as uuidv4 } from "uuid";

// Initiate a call
export const initiateCall = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: "Validation failed",
                errors: errors.array(),
            });
        }

        const { targetUserId, callType, chatId } = req.body;
        const initiatorId = req.user._id;

        // Validate target user exists
        const targetUser = await User.findById(targetUserId);
        if (!targetUser) {
            return res.status(404).json({
                success: false,
                message: "Target user not found",
            });
        }

        // Validate chat exists and user has access
        const chat = await Chat.findOne({
            chatId,
            "participants.user": { $all: [initiatorId, targetUserId] },
        });

        if (!chat) {
            return res.status(404).json({
                success: false,
                message: "Chat not found or access denied",
            });
        }

        // Check if either user is already in an active call
        const activeCall = await Call.findOne({
            "participants.user": { $in: [initiatorId, targetUserId] },
            status: { $in: ["initiated", "ringing", "answered"] },
        });

        if (activeCall) {
            return res.status(409).json({
                success: false,
                message: "One or both users are already in an active call",
            });
        }

        // Create call record
        const callId = uuidv4();
        const call = await Call.create({
            callId,
            participants: [
                { user: initiatorId, role: req.user.role },
                { user: targetUserId, role: targetUser.role },
            ],
            initiator: initiatorId,
            callType,
            relatedChat: chatId,
            status: "initiated",
            metadata: {
                userAgent: req.get("User-Agent"),
                ipAddress: req.ip,
            },
        });

        // Populate call data
        await call.populate([
            { path: "participants.user", select: "name role" },
            { path: "initiator", select: "name role" },
        ]);

        // Send real-time notification to target user
        const io = req.app.get("socketio");
        if (io) {
            io.to(`user_${targetUserId}`).emit("incoming_call", {
                callId: call.callId,
                callType,
                chatId,
                fromUserId: initiatorId,
                fromUserName: req.user.name,
                fromUserRole: req.user.role,
                timestamp: new Date(),
            });
        }

        res.status(201).json({
            success: true,
            message: "Call initiated successfully",
            data: { call },
        });
    } catch (error) {
        console.error("Initiate call error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to initiate call",
            error: error.message,
        });
    }
};

// Answer a call
export const answerCall = async (req, res) => {
    try {
        const { callId } = req.params;
        const userId = req.user._id;

        const call = await Call.findOne({ callId });
        if (!call) {
            return res.status(404).json({
                success: false,
                message: "Call not found",
            });
        }

        // Check if user is a participant
        const isParticipant = call.participants.some(
            (p) => p.user.toString() === userId.toString()
        );

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        // Check if call can be answered
        if (!["initiated", "ringing"].includes(call.status)) {
            return res.status(400).json({
                success: false,
                message: "Call cannot be answered in current state",
            });
        }

        // Update call status
        call.status = "answered";
        call.addParticipant(userId, req.user.role);
        await call.save();

        // Populate call data
        await call.populate([
            { path: "participants.user", select: "name role" },
            { path: "initiator", select: "name role" },
        ]);

        // Notify other participants
        const io = req.app.get("socketio");
        if (io) {
            call.participants.forEach((participant) => {
                if (participant.user._id.toString() !== userId.toString()) {
                    io.to(`user_${participant.user._id}`).emit("call_answered", {
                        callId: call.callId,
                        answeredBy: {
                            _id: userId,
                            name: req.user.name,
                            role: req.user.role,
                        },
                        timestamp: new Date(),
                    });
                }
            });
        }

        res.json({
            success: true,
            message: "Call answered successfully",
            data: { call },
        });
    } catch (error) {
        console.error("Answer call error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to answer call",
            error: error.message,
        });
    }
};

// End a call
export const endCall = async (req, res) => {
    try {
        const { callId } = req.params;
        const { reason = "completed" } = req.body;
        const userId = req.user._id;

        const call = await Call.findOne({ callId });
        if (!call) {
            return res.status(404).json({
                success: false,
                message: "Call not found",
            });
        }

        // Check if user is a participant
        const isParticipant = call.participants.some(
            (p) => p.user.toString() === userId.toString()
        );

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        // End the call
        call.endCall(reason);
        await call.save();

        // Populate call data
        await call.populate([
            { path: "participants.user", select: "name role" },
            { path: "initiator", select: "name role" },
        ]);

        // Notify other participants
        const io = req.app.get("socketio");
        if (io) {
            call.participants.forEach((participant) => {
                if (participant.user._id.toString() !== userId.toString()) {
                    io.to(`user_${participant.user._id}`).emit("call_ended", {
                        callId: call.callId,
                        endedBy: {
                            _id: userId,
                            name: req.user.name,
                            role: req.user.role,
                        },
                        reason,
                        duration: call.getCallDuration(),
                        timestamp: new Date(),
                    });
                }
            });
        }

        res.json({
            success: true,
            message: "Call ended successfully",
            data: { call },
        });
    } catch (error) {
        console.error("End call error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to end call",
            error: error.message,
        });
    }
};

// Reject a call
export const rejectCall = async (req, res) => {
    try {
        const { callId } = req.params;
        const { reason = "rejected" } = req.body;
        const userId = req.user._id;

        const call = await Call.findOne({ callId });
        if (!call) {
            return res.status(404).json({
                success: false,
                message: "Call not found",
            });
        }

        // Check if user is a participant
        const isParticipant = call.participants.some(
            (p) => p.user.toString() === userId.toString()
        );

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        // Check if call can be rejected
        if (!["initiated", "ringing"].includes(call.status)) {
            return res.status(400).json({
                success: false,
                message: "Call cannot be rejected in current state",
            });
        }

        // Update call status
        call.status = "rejected";
        call.endTime = new Date();
        call.endReason = reason;
        await call.save();

        // Populate call data
        await call.populate([
            { path: "participants.user", select: "name role" },
            { path: "initiator", select: "name role" },
        ]);

        // Notify other participants
        const io = req.app.get("socketio");
        if (io) {
            call.participants.forEach((participant) => {
                if (participant.user._id.toString() !== userId.toString()) {
                    io.to(`user_${participant.user._id}`).emit("call_rejected", {
                        callId: call.callId,
                        rejectedBy: {
                            _id: userId,
                            name: req.user.name,
                            role: req.user.role,
                        },
                        reason,
                        timestamp: new Date(),
                    });
                }
            });
        }

        res.json({
            success: true,
            message: "Call rejected successfully",
            data: { call },
        });
    } catch (error) {
        console.error("Reject call error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to reject call",
            error: error.message,
        });
    }
};

// Get call history
export const getCallHistory = async (req, res) => {
    try {
        const { page = 1, limit = 20, callType, status } = req.query;
        const userId = req.user._id;

        const calls = await Call.getCallHistory(userId, {
            page: parseInt(page),
            limit: parseInt(limit),
            callType,
            status,
        });

        const total = await Call.countDocuments({
            "participants.user": userId,
            ...(callType && { callType }),
            ...(status && { status }),
        });

        res.json({
            success: true,
            data: {
                calls,
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total,
                    pages: Math.ceil(total / limit),
                },
            },
        });
    } catch (error) {
        console.error("Get call history error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch call history",
            error: error.message,
        });
    }
};

// Get active calls for user
export const getActiveCalls = async (req, res) => {
    try {
        const userId = req.user._id;

        const activeCalls = await Call.findActiveCallsForUser(userId);

        res.json({
            success: true,
            data: { activeCalls },
        });
    } catch (error) {
        console.error("Get active calls error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch active calls",
            error: error.message,
        });
    }
};

// Get call statistics
export const getCallStats = async (req, res) => {
    try {
        const { timeframe = "month" } = req.query;
        const userId = req.user._id;

        const stats = await Call.getCallStats(userId, timeframe);

        res.json({
            success: true,
            data: { stats: stats[0] || {} },
        });
    } catch (error) {
        console.error("Get call stats error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch call statistics",
            error: error.message,
        });
    }
};

// Get call by ID
export const getCallById = async (req, res) => {
    try {
        const { callId } = req.params;
        const userId = req.user._id;

        const call = await Call.findOne({ callId })
            .populate("participants.user", "name role")
            .populate("initiator", "name role");

        if (!call) {
            return res.status(404).json({
                success: false,
                message: "Call not found",
            });
        }

        // Check if user is a participant
        const isParticipant = call.participants.some(
            (p) => p.user._id.toString() === userId.toString()
        );

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: "Access denied",
            });
        }

        res.json({
            success: true,
            data: { call },
        });
    } catch (error) {
        console.error("Get call error:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch call",
            error: error.message,
        });
    }
};
