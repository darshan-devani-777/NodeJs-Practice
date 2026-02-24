// GET DASHBOARD
exports.getDashboard = async (req, res) => {
  try {
    if (!req.user.permissions.includes("DASHBOARD:VIEW")) {
      return res.status(403).json({
        traceId: req.traceId,
        status: "DENIED",
        message: "You do not have permission to access the dashboard."
      });
    }

    const currentTime = new Date();
    const currentHour = currentTime.getHours();
    const currentMinute = currentTime.getMinutes();
    const isInTimeWindow =
      (currentHour === 16 && currentMinute >= 0) ||
      (currentHour === 17 && currentMinute === 0);

    if (!isInTimeWindow) {
      return res.status(403).json({
        traceId: req.traceId,
        status: "DENIED",
        message: "Dashboard access is only allowed between 4:00 PM to 5:00 PM. Access is denied after the time window."
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
        department: req.user.department
      }
    });

  } catch (error) {
    console.error("Dashboard Error:", error);

    return res.status(500).json({
      traceId: req.traceId,
      status: "ERROR",
      message: error.message
    });
  }
};