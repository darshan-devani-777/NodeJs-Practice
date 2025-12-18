module.exports = (sequelize, DataTypes) => {
  const ContactInfo = sequelize.define(
    "contact_info",
    {
      info_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: { isEmail: true },
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      location: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "user_id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      deleted_by: {
        type: DataTypes.UUID,
        allowNull: true,
        references: {
          model: "users",
          key: "user_id",
        },
        onUpdate: "CASCADE",
        onDelete: "SET NULL",
      },
      deleted_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      timestamps: true,
      paranoid: true, 
      deletedAt: "deleted_at",
    }
  );

  ContactInfo.associate = (models) => {
    ContactInfo.belongsTo(models.users, {
      as: "creator",
      foreignKey: "created_by",
      targetKey: "user_id",
    });

    ContactInfo.belongsTo(models.users, {
      as: "deleter",
      foreignKey: "deleted_by",
      targetKey: "user_id",
    });
  };

  return ContactInfo;
};
