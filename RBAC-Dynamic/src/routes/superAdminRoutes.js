const router = require("express").Router();
const trace = require("../middleware/trace");
const auth = require("../middleware/auth");
const rbac = require("../middleware/rbac");
const { finalApprove,auditLogs, createRole, getAuditByTraceId } = require("../controllers/superAdminController");

// CREATE ROLE
router.post(
  "/create-role",
  trace,
  auth,
  async (req,res,next)=>{
    if(req.user.role !== "SuperAdmin"){
      return res.status(403).json({
        traceId: res.locals.traceId,
        status:"DENIED",
        message:"Access denied. Only SuperAdmin can create roles."
      });
    }
    next();
  },
  rbac("ROLES:CREATE"),
  createRole
);

// FINAL APPROVE
router.post("/final-approve/:id",trace,auth,rbac("APPROVE_PERMISSION"),finalApprove);

// AUDIT LOGS
router.get("/audit-logs",trace,auth,rbac("VIEW_AUDIT_LOGS"),auditLogs);

// GET AUDITLOGS_BY_TRACEID
router.get("/audit-logs/by-traceID/:traceId", trace, auth, rbac("VIEW_AUDIT_LOGS"), getAuditByTraceId);

module.exports = router;