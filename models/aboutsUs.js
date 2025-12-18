module.exports = (sequelize, DataTypes) => {
  const AboutUs = sequelize.define(
    "about_us",
    {
      about_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      hero_image: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      main_heading: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      main_content: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      testimonial_quote: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      testimonial_author: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      sections: {
        type: DataTypes.JSON,
        allowNull: true,
      },
      created_by: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      deleted_by: {
        type: DataTypes.UUID,
        allowNull: true,
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

  AboutUs.associate = (models) => {
    AboutUs.belongsTo(models.users, {
      as: "creator",
      foreignKey: "created_by",
      targetKey: "user_id",
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });

    AboutUs.belongsTo(models.users, {
      as: "deleter",
      foreignKey: "deleted_by",
      targetKey: "user_id",
      onDelete: "SET NULL",
      onUpdate: "CASCADE",
    });
  };

  return AboutUs;
};
