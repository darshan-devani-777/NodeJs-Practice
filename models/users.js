const bcrypt = require("bcrypt");

module.exports = (sequelize, DataTypes) => {
  const users = sequelize.define(
    "users",
    {
      user_id: {
        allowNull: false,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      first_name: {
        type: DataTypes.STRING(50),
        defaultValue: "Default",
      },
      last_name: DataTypes.STRING(50),
      password: {
        type: DataTypes.STRING(500),
        defaultValue: "Default",
      },
      email: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      image_name: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      profile_image: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      bio: DataTypes.STRING(500),
      country: {
        type: DataTypes.STRING(50),
        allowNull: true,
      },
      password_otp: DataTypes.STRING(10),
      signup_otp: DataTypes.STRING(6),
      is_verified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      otp_expires_at: DataTypes.DATE,
      email_subscription: {
        type: DataTypes.JSON,
        defaultValue: [],
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: 1,
      },
      is_admin: {
        type: DataTypes.BOOLEAN,
        defaultValue: 0,
      },
      refreshToken: DataTypes.STRING(500),
      deleted_at: {
        allowNull: true,
        type: DataTypes.DATE,
      },
    },
    {
      tableName: "users",
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
      paranoid: true,
    }
  );

  users.beforeCreate(async (user) => {
    user.created_at = new Date();
    if (user.changed("password")) {
      user.password = bcrypt.hashSync(user.password, 10);
    }
  });

  users.beforeUpdate(async (user) => {
    user.updated_at = new Date();
    if (user.changed("password")) {
      user.password = bcrypt.hashSync(user.password, 10);
    }
  });

  users.associate = (models) => {
    users.hasMany(models.posts, {
      as: "posts",
      foreignKey: "posted_by",
      targetKey: "user_id",
    });
    users.hasMany(models.comments, {
      as: "comments",
      foreignKey: "posted_by",
      targetKey: "user_id",
    });
    users.hasMany(models.purchases, {
      as: "purchases",
      foreignKey: "user_id",
      targetKey: "user_id",
    });
    users.hasMany(models.saved_names, {
      as: "saved_names",
      foreignKey: "user_id",
      targetKey: "user_id",
    });
    users.hasMany(models.subscriptions, {
      as: "subscriptions",
      foreignKey: "user_id",
      targetKey: "user_id",
    });
  };

  return users;
};
