module.exports = (Sequelize, DataTypes) => {
  const community = Sequelize.define("community", {
    community_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    title: DataTypes.TEXT,
    content: DataTypes.TEXT,
    image: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    posted_by: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    deleted_at: {
      allowNull: true,
      type: DataTypes.DATE,
    },
  }, {
    timestamps: true,
    paranoid: true,
    deletedAt: 'deleted_at'
  });

  community.associate = (models) => {
    community.belongsTo(models.users, {
      foreignKey: "posted_by",
      as: "user",
    });
    community.belongsToMany(models.tags, {
      through: "community_tags",
      foreignKey: "community_id",
      as: "tags",
    });
    community.hasMany(models.comments, {
      foreignKey: "community_id",
      as: "comments",
    });
    community.hasMany(models.likes, {
      foreignKey: "likeable_id",
      constraints: false,
      as: "likes",
    });
    community.hasMany(models.bookmarks, {
      foreignKey: "bookmarkable_id",
      constraints: false,
      as: "bookmarks",
    });
  };

  return community;
};
