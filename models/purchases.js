module.exports = (sequelize, DataTypes) => {
  const purchases = sequelize.define("purchases", {
    purchase_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
  },
    purchase_time: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    purchase_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    original_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    course_id: {
      type: DataTypes.UUID,
      allowNull: true,
    },
    coupon_id: {
      type: DataTypes.UUID,
      allowNull: true,
      onDelete: "SET NULL",
    },
    deleted_at: {
      allowNull: true,
      type: DataTypes.DATE,
    },
  }, {
    paranoid: true,
    deletedAt: 'deleted_at',
  });

  purchases.associate = (models) => {
    purchases.belongsTo(models.users, {
      as: "user",
      foreignKey: "user_id",
      targetKey: "user_id",
    }),
    purchases.belongsTo(models.courses, {
      as: "course",
      foreignKey: "course_id",
      targetKey: "course_id",
    });
    purchases.belongsTo(models.coupons, {
      as: "coupon",
      foreignKey: "coupon_id",
      targetKey: "coupon_id",
    });
  };

  return purchases;
};
