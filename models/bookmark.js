module.exports = (sequelize, DataTypes) => {
    const bookmarks = sequelize.define(
      "bookmarks",
      {
        bookmark_id: {
          allowNull: false,
          type: DataTypes.UUID,
          defaultValue: DataTypes.UUIDV4,
          primaryKey: true,
        },
        post_id: {
          allowNull: false,
          type: DataTypes.UUID, // id of post
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
        paranoid: true,
        deletedAt: 'deleted_at'
      }
    );
  
    bookmarks.associate = (models) => {
      bookmarks.belongsTo(models.users, {
        foreignKey: "user_id",
        targetKey: 'user_id',
        as: "user",
      });
      bookmarks.belongsTo(models.posts, {
        foreignKey: "post_id",
        targetKey: "post_id",
        as: "posts",
      });
    };
  
    return bookmarks;
  };
  
  