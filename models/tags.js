module.exports = (sequelize, DataTypes) => {
  const tags = sequelize.define(
    "tags",
    {
      tag_id: {
        allowNull: false,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      tag_name: { 
        type: DataTypes.STRING, 
        allowNull: false, 
        // unique: true 
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

  tags.associate = (models) => {
    tags.hasMany(models.posts, {
      as: "posts",
      foreignKey: "tag_id",
      targetKey: "tag_id",
    });
  };

  return tags;
};
