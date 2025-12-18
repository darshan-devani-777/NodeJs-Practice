module.exports = (sequelize, DataTypes) => {
  const ContactForm = sequelize.define(
    "contact_form",
    {
      form_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      full_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      bio: {
        type: DataTypes.TEXT,
        allowNull: true,
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

  ContactForm.associate = (models) => {
    ContactForm.belongsTo(models.users, {
      as: "creator",
      foreignKey: "created_by",
      targetKey: "user_id",
    });

    ContactForm.belongsTo(models.users, {
      as: "deleter",
      foreignKey: "deleted_by",
      targetKey: "user_id",
    });
  };

  return ContactForm;
};
