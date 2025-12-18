module.exports = (Sequelize, DataTypes) => {
    const posts = Sequelize.define("posts", {
        post_id: {
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
        group_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        tag_id: {
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

    posts.associate = (models) => {
        posts.belongsTo(models.users, {
            foreignKey: "posted_by",
            targetKey: "user_id",
            as: "user",
        });
        posts.belongsTo(models.tags, {
            foreignKey: "tag_id",
            targetKey: "tag_id",
            as: "tags",
        });
        posts.hasMany(models.comments, {
            foreignKey: "post_id",
            targetKey: "post_id",
            as: "comments",
        });
        posts.hasMany(models.likes, {
            foreignKey: "post_id",
            targetKey: "post_id",
            as: "likes",
        });
        posts.hasMany(models.bookmarks, {
            foreignKey: "post_id",
            targetKey: "post_id",
            as: "bookmarks",
        });
        posts.belongsTo(models.groups, {
            foreignKey: "group_id",
            targetKey: "group_id",
            as: "group",
        })
    };

    return posts;
};
