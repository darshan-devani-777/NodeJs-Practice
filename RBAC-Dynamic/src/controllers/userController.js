const PermissionRequest = require("../models/PermissionRequest");
const AuditLog = require("../models/AuditLog");

// CREATE PERMISSION REQUEST
exports.requestPermission = async (req, res) => {
  try {
    const { permission, reason } = req.body;

    const request = await PermissionRequest.create({
      user: req.user._id,
      permission,
      reason
    });

    await AuditLog.create({
      traceId: res.locals.traceId,
      performedBy: {
        userId: req.user._id,
        email: req.user.email,
        role: req.user.role
      },
      resource: { type: "PERMISSION_REQUEST", resourceId: request._id },
      action: "USER_REQUESTED_PERMISSION",
      status: "SUCCESS",
      newValues: { permission, reason },
      ipAddress: req.ip
    });

    res.status(201).json({
      traceId: res.locals.traceId,
      status: "SUCCESS",
      message: "Permission request submitted successfully.",
      data: request
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      traceId: res.locals.traceId,
      status: "ERROR",
      message: "Internal server error"
    });
  }
};