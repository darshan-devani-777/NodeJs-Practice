module.exports = (sequelize, DataTypes) => {
  const likes = sequelize.define(
    "likes",
    {
      like_id: {
        allowNull: false,
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      post_id: {
        allowNull: true,
        type: DataTypes.UUID,
      },
      comment_id: {
        allowNull: true,
        type: DataTypes.UUID,
      },
      user_id: {
        allowNull: false,
        type: DataTypes.UUID,
      },
      deleted_at: {
        allowNull: true,
        type: DataTypes.DATE,
      },
    },
    {
      timestamps: false,
      updatedAt: false,
      paranoid: true,
      deletedAt: 'deleted_at',
      indexes: [
        {
          unique: true,
          fields: ["user_id", "post_id"],
          where: {
            comment_id: null,
          },
        },
        {
          unique: true,
          fields: ["user_id", "comment_id"],
          where: {
            post_id: null,
          },
        },
      ],
      validate: {
        eitherPostOrComment() {
          if (!this.post_id && !this.comment_id) {
            throw new Error("Either post_id or comment_id must be provided");
          }
          if (this.post_id && this.comment_id) {
            throw new Error("Only one of post_id or comment_id should be provided");
          }
        },
      },
    }
  );

  likes.associate = (models) => {
    likes.belongsTo(models.users, {
      foreignKey: "user_id",
      targetKey: "user_id",
      as: "user",
    });
    likes.belongsTo(models.posts, {
      foreignKey: "post_id",
      targetKey: "post_id",
      as: "post",
    });
    likes.belongsTo(models.comments, {
      foreignKey: "comment_id",
      targetKey: "comment_id",
      as: "comment",
    });
  };

  return likes;
};
