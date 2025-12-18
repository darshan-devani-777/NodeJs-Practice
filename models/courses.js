module.exports = (sequelize, DataTypes) => {
  const courses = sequelize.define(
    "courses",
    {
      course_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      title: { type: DataTypes.TEXT, allowNull: false },
      subtitle: { type: DataTypes.TEXT, allowNull: true },
      description: { type: DataTypes.TEXT, allowNull: false },
      additional_info: { type: DataTypes.TEXT, allowNull: true },
      thumbnail: { type: DataTypes.TEXT, allowNull: false },
      price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      coupon_id: { type: DataTypes.UUID, allowNull: true },
      deleted_at: { type: DataTypes.DATE, allowNull: true },
    },
    {
      tableName: "courses",
      paranoid: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
      deletedAt: "deleted_at",
    }
  );

  courses.associate = (models) => {
    courses.belongsTo(models.coupons, {
      foreignKey: "coupon_id",
      targetKey: "coupon_id",
      as: "coupons",
    });

    courses.hasMany(models.course_chapters, {
      foreignKey: "course_id",
      as: "chapters",
    });
  };

  return courses;
};
