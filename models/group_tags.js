module.exports = (Sequelize, DataTypes) => {
  const group_tags = Sequelize.define("group_tags",
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

  group_tags.associate = (models) => {
    group_tags.hasMany(models.groups, {
      as: "groups",
      foreignKey: "tag_id",
      targetKey: "tag_id",
    });
  };

  return group_tags;
};
