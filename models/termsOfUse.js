module.exports = (sequelize, DataTypes) => {
    const TermsOfUse = sequelize.define(
      "terms_of_use",
      {
        terms_id: {
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          allowNull: false,
          primaryKey: true,
        },
        main_heading: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        sections: {
          type: DataTypes.JSON,
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
  
    TermsOfUse.associate = (models) => {
      TermsOfUse.belongsTo(models.users, {
        as: "creator",
        foreignKey: "created_by",
        targetKey: "user_id",
      });
  
      TermsOfUse.belongsTo(models.users, {
        as: "deleter",
        foreignKey: "deleted_by",
        targetKey: "user_id",
      });
    };
  
    return TermsOfUse;
  };
  