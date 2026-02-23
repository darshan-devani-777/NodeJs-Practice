// GET DASHBOARD
exports.getDashboard = async (req, res) => {
  try {
    const userPermissions = req.user.permissions || [];

    if (!userPermissions.includes("DASHBOARD:VIEW")) {
      return res.status(403).json({
        traceId: req.traceId,
        status: "DENIED",
        message: "Access denied. Permission not approved by SuperAdmin."
      });
    }

    return res.status(200).json({
      traceId: req.traceId,
      status: "SUCCESS",
      message: "Dashboard accessed successfully.",
      data: {
        userId: req.user._id,
        name: req.user.name,
        role: req.user.role,
        permissions: userPermissions
      }
    });
  } catch (error) {
    return res.status(500).json({
      traceId: req.traceId,
      status: "FAILED",
      message: "Error fetching dashboard.",
      error: error.message
    });
  }
};