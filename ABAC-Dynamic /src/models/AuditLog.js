const mongoose = require("mongoose");

const auditSchema = new mongoose.Schema(
  {
    traceId: {
      type: String,
      required: true,
      index: true
    },

    performedBy: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      email: String,
      role: String
    },

    target: {
      userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      email: String,
      role: String
    },

    resource: {
      type: {
        type: String, 
      },
      resourceId: mongoose.Schema.Types.ObjectId,
    },

    action: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ["SUCCESS", "FAILED", "ERROR"],
      default: "SUCCESS"
    },

    ipAddress: String,

    userAgent: String,

    oldValues: Object,
    newValues: Object, 

    metadata: Object
  },
  { timestamps: true }
);

module.exports = mongoose.model("AuditLog", auditSchema);