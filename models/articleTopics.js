module.exports = (sequelize, DataTypes) => {
  const articleTopics = sequelize.define(
    "article_topics",
    {
      article_topic_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      topic: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      article_tag_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: "article_tags",
          key: "article_tag_id",
        },
      },
      lowercase_topic: {
        type: DataTypes.STRING,
        allowNull: false,
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
    },
    {
      indexes: [
        {
          unique: true,
          fields: ["lowercase_topic"],
        },
      ],
    }
  );

  articleTopics.associate = (models) => {
    articleTopics.belongsTo(models.article_tags, {
      foreignKey: "article_tag_id",
      as: "tag",
    });

    articleTopics.hasOne(models.articles, {
      foreignKey: "article_topic_id",
      as: "article",
    });
  };

  return articleTopics;
};
