module.exports = (sequelize, DataTypes) => {
  const savedNames = sequelize.define("saved_names", {
    saved_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    name_id: {
      type: DataTypes.UUID,
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

  savedNames.associate = (models) => {
    savedNames.belongsTo(models.users, {
      as: "user",
      foreignKey: "user_id",
      targetKey: "user_id",
    });
    savedNames.belongsTo(models.baby_names, {
      as: "baby_name",
      foreignKey: "name_id",
      targetKey: "name_id",
    });
  };

  return savedNames;
};
