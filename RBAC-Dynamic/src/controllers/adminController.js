const User = require("../models/User");
const Role = require("../models/Role");
const PermissionRequest = require("../models/PermissionRequest");
const AuditLog = require("../models/AuditLog");

// CREATE USER 
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        traceId: res.locals.traceId,
        status: "FAILED",
        message: "Email already exists."
      });
    }

    const user = await User.create({ name, email, password, role });

    const audit = await AuditLog.create({
      traceId: res.locals.traceId,

      performedBy: {
        userId: req.user._id,
        email: req.user.email,
        role: req.user.role
      },

      target: {
        userId: user._id,
        email: user.email,
        role: user.role
      },

      resource: {
        type: "USER",
        resourceId: user._id
      },

      action: "ADMIN_CREATED_USER",
      status: "SUCCESS",

      ipAddress: req.ip,
      userAgent: req.headers["user-agent"],

      newValues: {
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

    const safeUser = user.toObject();
    delete safeUser.password;

    res.status(201).json({
      traceId: res.locals.traceId,
      status: "SUCCESS",
      message: "User created successfully by Admin.",
      data: {
        user: safeUser,
        auditLog: audit
      }
    });

  } catch (error) {
    console.error(error);

    await AuditLog.create({
      traceId: res.locals.traceId,
      performedBy: {
        userId: req.user?._id,
        email: req.user?.email
      },
      action: "ADMIN_CREATED_USER",
      status: "ERROR",
      metadata: { error: error.message }
    });

    res.status(500).json({
      traceId: res.locals.traceId,
      status: "ERROR",
      message: "Internal server error"
    });
  }
};

// ASSIGN ROLE
exports.assignRole = async (req, res) => {
  try {
    const { roleId } = req.body;

    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({
        traceId: res.locals.traceId,
        status: "FAILED",
        message: "Role not found."
      });
    }

    const user = await User.findById(req.params.userId).populate("roles");
    if (!user) {
      return res.status(404).json({
        traceId: res.locals.traceId,
        status: "FAILED",
        message: "User not found."
      });
    }

    const oldRoles = user.roles.map(r => r.name);

    user.roles.push(roleId);

    const rolePermissions = role.permissions || [];
    user.permissions = [...new Set([...user.permissions, ...rolePermissions])];

    await user.save();
    await user.populate("roles");

    const newRoles = user.roles.map(r => r.name);

    const audit = await AuditLog.create({
      traceId: res.locals.traceId,
      performedBy: {
        userId: req.user._id,
        email: req.user.email,
        role: req.user.role
      },
      target: {
        userId: user._id,
        email: user.email
      },
      resource: {
        type: "ROLE",
        resourceId: role._id
      },
      action: "ROLE_ASSIGNED",
      status: "SUCCESS",
      oldValues: { roles: oldRoles },
      newValues: { roles: newRoles },
      ipAddress: req.ip
    });

    res.json({
      traceId: res.locals.traceId,
      status: "SUCCESS",
      message: "Role assigned successfully.",
      data: {
        userId: user._id,
        assignedRole: role.name,
        roles: newRoles,
        permissions: user.permissions, 
        auditLog: audit
      }
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

// REVIEW PERMISSION REQUEST
exports.reviewRequest = async (req, res) => {
  try {
    const request = await PermissionRequest.findById(req.params.id)
      .populate("user");

    if (!request) {
      return res.status(404).json({
        traceId: res.locals.traceId,
        status: "FAILED",
        message: "Permission request not found."
      });
    }

    const oldStatus = request.status;

    if (req.body.action === "APPROVE") {
      request.status = "PENDING_SUPERADMIN";
    } else if (req.body.action === "REJECT") {
      request.status = "REJECTED";
    } else {
      return res.status(400).json({
        traceId: res.locals.traceId,
        status: "FAILED",
        message: "Invalid action."
      });
    }

    request.reviewedBy = req.user._id;
    await request.save();

    const audit = await AuditLog.create({
      traceId: res.locals.traceId,

      performedBy: {
        userId: req.user._id,
        email: req.user.email,
        role: req.user.role
      },

      target: {
        userId: request.user?._id,
        email: request.user?.email
      },

      resource: {
        type: "PERMISSION_REQUEST",
        resourceId: request._id
      },

      action: "ADMIN_REVIEWED_REQUEST",
      status: "SUCCESS",

      oldValues: { status: oldStatus },
      newValues: { status: request.status },

      ipAddress: req.ip
    });

    res.json({
      traceId: res.locals.traceId,
      status: "SUCCESS",
      message: `Request ${request.status}`,
      data: {
        requestId: request._id,
        oldStatus,
        newStatus: request.status,
        auditLog: audit
      }
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