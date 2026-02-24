const { AbilityBuilder, createMongoAbility } = require("@casl/ability");

function defineAbilityFor(user) {
  const { can, cannot, build } = new AbilityBuilder(createMongoAbility);

  if (!user) return build();

  if (user.status !== "ACTIVE") {
    cannot("manage", "all");
    return build();
  }

  if (user.role === "SuperAdmin") {
    can("manage", "all");
  }

  if (user.role === "Admin") {
    can("create", "User", { department: user.department });
    can("assignRole", "User", { department: user.department });
    can("review", "PermissionRequest");
    can("create", "Role");
    can("view", "AuditLog");
  }

  if (user.role === "User") {
    can("request", "PermissionRequest");
    can("view", "Dashboard");
  }

  can("update", "User", { _id: user._id });

  return build();
}

module.exports = defineAbilityFor;