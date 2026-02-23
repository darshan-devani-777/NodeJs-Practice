const PermissionRequest = require("../models/PermissionRequest");
const AuditLog = require("../models/AuditLog");
const Role = require("../models/Role");

// CREATE ROLE
exports.createRole = async (req, res) => {
  try {
    const { name, permissions = [] } = req.body;

    const existingRole = await Role.findOne({ name });
    if (existingRole) {
      return res.status(400).json({
        traceId: res.locals.traceId,
        status: "FAILED",
        message: "Role already exists.",
      });
    }

    const role = await Role.create({ name, permissions });

    await AuditLog.create({
      traceId: res.locals.traceId,
      performedBy: {
        userId: req.user._id,
        email: req.user.email,
        role: req.user.role,
      },
      resource: { type: "ROLE", resourceId: role._id },
      action: "ROLE_CREATED",
      status: "SUCCESS",
      newValues: { name: role.name, permissions: role.permissions },
      ipAddress: req.ip,
    });

    res.status(201).json({
      traceId: res.locals.traceId,
      status: "SUCCESS",
      message: "Role created successfully.",
      data: role,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      traceId: res.locals.traceId,
      status: "ERROR",
      message: "Internal server error.",
      error: error.message,
    });
  }
};

// FINAL APPROVE
exports.finalApprove = async (req, res) => {
  try {
    const request = await PermissionRequest.findById(req.params.id).populate("user");

    if (!request) {
      return res.status(404).json({
        traceId: res.locals.traceId,
        status: "FAILED",
        message: "Permission request not found.",
      });
    }

    if (!request.user.permissions.includes(request.permission)) {
      request.user.permissions.push(request.permission);
      await request.user.save();
    }

    request.status = "APPROVED";
    await request.save();

    await AuditLog.create({
      traceId: res.locals.traceId,
      performedBy: {
        userId: req.user._id,
        email: req.user.email,
        role: req.user.role,
      },
      target: {
        userId: request.user._id,
        email: request.user.email,
      },
      resource: {
        type: "PERMISSION_REQUEST",
        resourceId: request._id,
      },
      action: "SUPERADMIN_APPROVED",
      status: "SUCCESS",
      details: { permission: request.permission },
      ipAddress: req.ip,
    });

    res.status(200).json({
      traceId: res.locals.traceId,
      status: "SUCCESS",
      message: "Permission fully approved by SuperAdmin.",
      data: {
        requestId: request._id,
        userId: request.user._id,
        permission: request.permission,
        status: request.status,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      traceId: res.locals.traceId,
      status: "ERROR",
      message: "Internal server error.",
      error: error.message,
    });
  }
};

// AUDIT LOGS
exports.auditLogs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) > 0 ? parseInt(req.query.page) : 1;
    const limit = parseInt(req.query.limit) > 0 ? parseInt(req.query.limit) : 10;
    const skip = (page - 1) * limit;

    const totalLogs = await AuditLog.countDocuments();

    const logs = await AuditLog.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      traceId: res.locals.traceId,
      status: "SUCCESS",
      message: "Audit logs fetched successfully.",
      meta: {
        total: totalLogs,
        page,
        limit,
        totalPages: Math.ceil(totalLogs / limit),
        data: logs,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      traceId: res.locals.traceId,
      status: "FAILURE",
      message: "Failed to fetch audit logs.",
      error: error.message,
    });
  }
};

// GET AUDITLOGS_BY_TRACEID
exports.getAuditByTraceId = async (req, res) => {
  try {
    if (req.user.role !== "SuperAdmin") {
      return res.status(403).json({
        traceId: res.locals.traceId,
        status: "DENIED",
        message: "Access denied. Only SuperAdmin can fetch logs by trace ID."
      });
    }

    const { traceId } = req.params;

    const logs = await AuditLog.find({ traceId }).sort({ createdAt: 1 });

    if (!logs || logs.length === 0) {
      return res.status(404).json({
        traceId: res.locals.traceId,
        status: "FAILED",
        message: `No audit logs found for traceId: ${traceId}`
      });
    }

    res.json({
      traceId: res.locals.traceId,
      status: "SUCCESS",
      message: `Fetched ${logs.length} log(s) for traceId ${traceId}`,
      data: logs
    });

  } catch (error) {
    console.error("Fetch Audit by TraceId Error:", error);
    res.status(500).json({
      traceId: res.locals.traceId,
      status: "ERROR",
      message: "Internal server error",
      error: error.message
    });
  }
};