const { ENUM } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  const babyNames = sequelize.define(
    "baby_names",
    {
      name_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      meaning: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      gender: {
        type: DataTypes.ENUM("male", "female"),
        allowNull: false,
      },
      origin: {
        type: DataTypes.ENUM("hindu", "muslim", "british", "english"),
        allowNull: false,
      },
      deleted_at: {
        allowNull: true,
        type: DataTypes.DATE,
      },
    },
    {
      timestamps: false,
      paranoid: true,
      deletedAt: 'deleted_at'
    }
  );

  babyNames.associate = (models) => {
    babyNames.hasMany(models.saved_names, {
      as: "saved_names",
      foreignKey: "name_id",
      sourceKey: "name_id",
    });
  };

  return babyNames;
};
