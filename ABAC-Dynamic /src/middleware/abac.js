const { subject } = require("@casl/ability");
const defineAbilityFor = require("../abac/ability");

module.exports = (action, subjectName) => {
  return async (req, res, next) => {

    const ability = defineAbilityFor(req.user);

    let resource;

    if (req.body && Object.keys(req.body).length > 0) {
      resource = subject(subjectName, req.body);
    } else {
      resource = subjectName;
    }

    const isAllowed = ability.can(action, resource);

    if (!isAllowed) {
      return res.status(403).json({
        traceId: req.traceId,
        status: "DENIED",
        message: `Access denied. You cannot ${action} ${subjectName}.`
      });
    }

    next();
  };
};