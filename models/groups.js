module.exports = (sequelize, DataTypes) => {
  const groups = sequelize.define("groups", {
    group_id: {
      allowNull: false,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
      // unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    created_by: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    is_public: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    tag_id:{
      type: DataTypes.UUID,
      allowNull: false
    },
    image: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    deleted_at: {
      allowNull: true,
      type: DataTypes.DATE,
    },
  }, {
    paranoid: true,
    deletedAt: 'deleted_at',
  });

  groups.associate = (models) => {
    groups.hasMany(models.group_members, {
      as: "members",
      foreignKey: "group_id",
      sourceKey: "group_id",
    });
    
    groups.hasMany(models.group_members, {
      as: "owners",
      foreignKey: "group_id",
      targetKey: "group_id",
    });

    groups.hasMany(models.posts, {
      as: "posts",
      foreignKey: "group_id",
      targetKey: "group_id",
    });

    groups.belongsTo(models.group_tags, {
      as: "group_tags",
      foreignKey: "tag_id",
      targetKey: "tag_id",
    });
  };

  return groups;
};
