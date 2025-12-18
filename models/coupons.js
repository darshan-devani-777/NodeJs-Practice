module.exports = (sequelize, DataTypes) => {
  const coupons = sequelize.define("coupons", {
    coupon_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    coupon_name: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    discount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    end_date: {
      type: DataTypes.DATEONLY(),
      allowNull: false,
    },
    deleted_at: {
      allowNull: true,
      type: DataTypes.DATE,
    },
  }, {
    paranoid: true,
    deletedAt: 'deleted_at',
  });

  coupons.associate = (models) => {
    coupons.hasMany(models.courses, {
      as: "courses", 
      foreignKey: "coupon_id" 
    });
    coupons.hasMany(models.purchases, { 
      as: "purchases",
      foreignKey: "coupon_id" 
    });
  };

  return coupons;
};
