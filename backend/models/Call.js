import mongoose from "mongoose";

const callSchema = new mongoose.Schema({
    callId: {
        type: String,
        required: true,
        unique: true,
    },
    participants: [
        {
            user: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "User",
                required: true,
            },
            role: {
                type: String,
                enum: ["citizen", "lawyer", "admin"],
                required: true,
            },
            joinedAt: Date,
            leftAt: Date,
        },
    ],
    initiator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },
    callType: {
        type: String,
        enum: ["voice", "video"],
        required: true,
    },
    status: {
        type: String,
        enum: ["initiated", "ringing", "answered", "ended", "missed", "rejected"],
        default: "initiated",
    },
    relatedChat: {
        type: String, // chatId
        required: true,
    },
    relatedConsultation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Consultation",
    },
    startTime: {
        type: Date,
        default: Date.now,
    },
    endTime: Date,
    duration: {
        type: Number, // in seconds
        default: 0,
    },
    endReason: {
        type: String,
        enum: ["completed", "missed", "rejected", "failed", "timeout"],
    },
    quality: {
        rating: {
            type: Number,
            min: 1,
            max: 5,
        },
        issues: [String], // e.g., ["audio_quality", "video_quality", "connection"]
        feedback: String,
    },
    metadata: {
        platform: {
            type: String,
            default: "web",
        },
        userAgent: String,
        ipAddress: String,
        connectionType: String, // e.g., "wifi", "cellular"
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Indexes for better query performance
callSchema.index({ callId: 1 });
callSchema.index({ "participants.user": 1 });
callSchema.index({ initiator: 1 });
callSchema.index({ status: 1 });
callSchema.index({ startTime: -1 });
callSchema.index({ relatedChat: 1 });

// Update timestamps
callSchema.pre("save", function (next) {
    this.updatedAt = Date.now();
    next();
});

// Calculate duration when call ends
callSchema.pre("save", function (next) {
    if (this.endTime && this.startTime && !this.duration) {
        this.duration = Math.floor((this.endTime - this.startTime) / 1000);
    }
    next();
});

// Instance methods
callSchema.methods.addParticipant = function (userId, role) {
    const existingParticipant = this.participants.find(
        (p) => p.user.toString() === userId.toString()
    );
    
    if (!existingParticipant) {
        this.participants.push({
            user: userId,
            role,
            joinedAt: new Date(),
        });
    } else if (!existingParticipant.joinedAt) {
        existingParticipant.joinedAt = new Date();
    }
};

callSchema.methods.removeParticipant = function (userId) {
    const participant = this.participants.find(
        (p) => p.user.toString() === userId.toString()
    );
    
    if (participant && !participant.leftAt) {
        participant.leftAt = new Date();
    }
};

callSchema.methods.endCall = function (reason = "completed") {
    this.status = "ended";
    this.endTime = new Date();
    this.endReason = reason;
    
    // Mark all participants as left if they haven't already
    this.participants.forEach((participant) => {
        if (!participant.leftAt) {
            participant.leftAt = this.endTime;
        }
    });
};

callSchema.methods.getCallDuration = function () {
    if (this.duration) {
        return this.duration;
    }
    
    if (this.endTime && this.startTime) {
        return Math.floor((this.endTime - this.startTime) / 1000);
    }
    
    if (this.startTime && this.status === "answered") {
        return Math.floor((new Date() - this.startTime) / 1000);
    }
    
    return 0;
};

callSchema.methods.isActive = function () {
    return ["initiated", "ringing", "answered"].includes(this.status);
};

callSchema.methods.wasSuccessful = function () {
    return this.status === "ended" && this.endReason === "completed" && this.duration > 0;
};

// Static methods
callSchema.statics.findActiveCallsForUser = function (userId) {
    return this.find({
        "participants.user": userId,
        status: { $in: ["initiated", "ringing", "answered"] },
    }).populate("participants.user", "name role");
};

callSchema.statics.getCallHistory = function (userId, options = {}) {
    const { page = 1, limit = 20, callType, status } = options;
    
    let query = {
        "participants.user": userId,
    };
    
    if (callType) {
        query.callType = callType;
    }
    
    if (status) {
        query.status = status;
    }
    
    return this.find(query)
        .populate("participants.user", "name role")
        .populate("initiator", "name role")
        .sort({ startTime: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
};

callSchema.statics.getCallStats = function (userId, timeframe = "month") {
    const now = new Date();
    let startDate;
    
    switch (timeframe) {
        case "day":
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
            break;
        case "week":
            startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            break;
        case "month":
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            break;
        default:
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    return this.aggregate([
        {
            $match: {
                "participants.user": new mongoose.Types.ObjectId(userId),
                startTime: { $gte: startDate },
            },
        },
        {
            $group: {
                _id: null,
                totalCalls: { $sum: 1 },
                successfulCalls: {
                    $sum: {
                        $cond: [
                            {
                                $and: [
                                    { $eq: ["$status", "ended"] },
                                    { $eq: ["$endReason", "completed"] },
                                    { $gt: ["$duration", 0] },
                                ],
                            },
                            1,
                            0,
                        ],
                    },
                },
                totalDuration: { $sum: "$duration" },
                avgDuration: { $avg: "$duration" },
                voiceCalls: {
                    $sum: { $cond: [{ $eq: ["$callType", "voice"] }, 1, 0] },
                },
                videoCalls: {
                    $sum: { $cond: [{ $eq: ["$callType", "video"] }, 1, 0] },
                },
            },
        },
    ]);
};

const Call = mongoose.model("Call", callSchema);

export default Call;
