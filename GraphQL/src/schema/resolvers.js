const userController = require("../controllers/userController");
const authController = require("../controllers/authController");
const { requireUser, requireAdmin } = require("../helpers/roleAuth");

const { validateEmail, validatePassword, validateName, validateRole } = require("../helpers/validation");

const resolvers = {
  Query: {
    users: async (_, __, context) => {
      const authResult = await requireAdmin()(context);
      if (!authResult.success) {
        return authResult;
      }
      return userController.getUsers();
    },
    usersConnection: async (_, { first, after, last, before }, context) => {
      const authResult = await requireAdmin()(context);
      if (!authResult.success) {
        return authResult;
      }
      return userController.getUsersPaginated({ first, after, last, before });
    },
    user: async (_, { id }, context) => {
      const authResult = await requireAdmin()(context);
      if (!authResult.success) {
        return authResult;
      }
      return userController.getUserById(id);
    },
  },

  Mutation: {
    register: (_, { name, email, password, role }) => {
      const validName = validateName(name);
      const validEmail = validateEmail(email);
      const validPassword = validatePassword(password);
      const validRole = role ? validateRole(role) : 'user';
      return authController.register(validName, validEmail, validPassword, validRole);
    },
    login: (_, { email, password }) => {
      const validEmail = validateEmail(email);
      return authController.login(validEmail, password);
    },

    updateUser: async (_, { name, email }, context) => {
      const authResult = await requireUser()(context);
      if (!authResult.success) {
        return authResult;
      }

      const update = {};
      if (typeof name !== "undefined") update.name = validateName(name);
      if (typeof email !== "undefined") update.email = validateEmail(email);

      return userController.updateUser(authResult.user.id, update);
    },

    deleteUser: async (_, __, context) => {
      const authResult = await requireUser()(context);
      if (!authResult.success) {
        return authResult;
      }
      return userController.deleteUser(authResult.user.id);
    },

    // Admin mutations
    updateUserRole: async (_, { id, role }, context) => {
      const authResult = await requireAdmin()(context);
      if (!authResult.success) {
        return authResult;
      }
      const validRole = validateRole(role);
      return userController.updateUserRole(id, validRole);
    },
    deleteUserByAdmin: async (_, { id }, context) => {
      const authResult = await requireAdmin()(context);
      if (!authResult.success) {
        return authResult;
      }
      return userController.deleteUserByAdmin(id);
    },
  },
};

module.exports = resolvers;
