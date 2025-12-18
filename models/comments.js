module.exports = (sequelize, DataTypes) => {
  const comments = sequelize.define("comments", {
    comment_id: {
      allowNull: false,
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    comment: { type: DataTypes.TEXT, allowNull: false },
    post_id: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    image:{
      type: DataTypes.TEXT,
      allowNull: true,
    },
    posted_by: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    parent_id: {
      type: DataTypes.UUID,
      allowNull: true,
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

  comments.associate = (models) => {
    comments.belongsTo(models.users, {
      foreignKey: "posted_by",
      targetKey: "user_id",
      as: "user",
    });
    comments.belongsTo(models.posts, {
      foreignKey: "post_id",
      targetKey: "post_id",
      as: "post",
    });
    comments.belongsTo(models.comments, {
      foreignKey: "parent_id",
      targetKey: "comment_id",
      as: "parent",
    });
    comments.hasMany(models.comments, {
      foreignKey: "parent_id",
      sourceKey: "comment_id",
      as: "replies",
      onDelete: "CASCADE",
    });
    comments.hasMany(models.likes, {
      foreignKey: "comment_id",
      as: "likes",
    });
    // comments.hasMany(models.likes, {
    //   foreignKey: "likeable_id",
    //   constraints: false,
    //   as: "likes",
    // });
  };
  return comments;
};
