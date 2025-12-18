module.exports = (sequelize, DataTypes) => {
  const subscriptions = sequelize.define(
    "subscriptions",
    {
      subscription_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      email: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      unsubscribed_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "subscriptions",
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  subscriptions.associate = (models) => {
    subscriptions.belongsTo(models.users, {
      as: "user",
      foreignKey: "user_id",
      targetKey: "user_id",
    });
  };

  return subscriptions;
};
