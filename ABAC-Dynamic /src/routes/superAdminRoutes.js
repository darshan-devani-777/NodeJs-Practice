const router = require("express").Router();
const trace = require("../middleware/trace");
const auth = require("../middleware/auth");
const abac = require("../middleware/abac");

const { finalApprove,auditLogs, createRole, getAuditByTraceId } = require("../controllers/superAdminController");

// CREATE ROLE
router.post("/create-role", trace, auth, abac("create", "Role"), createRole);

// FINAL APPROVE
router.post("/final-approve/:id",trace,auth, abac("manage", "PermissionRequest"),finalApprove);

// AUDIT LOGS
router.get("/audit-logs",trace,auth, abac("view", "AuditLog"),auditLogs);

// GET AUDITLOGS_BY_TRACEID
router.get("/audit-logs/by-traceID/:traceId", trace, auth, abac("view", "AuditLog"), getAuditByTraceId);

module.exports = router;