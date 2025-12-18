module.exports = (sequelize, DataTypes) => {
  const articles = sequelize.define("articles", {
    article_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: DataTypes.TEXT,
    content: DataTypes.TEXT("long"),
    image: DataTypes.TEXT,
    posted_by: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    article_topic_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: "article_topics",
        key: "article_topic_id",
      },
    },
    deleted_at: {
      allowNull: true,
      type: DataTypes.DATE,
    },
  }, {
    paranoid: true,
    deletedAt: 'deleted_at',
  });

  articles.associate = (models) => {
    articles.belongsTo(models.article_topics, {
      foreignKey: "article_topic_id",
      as: "topic",
    });

    articles.belongsTo(models.users, {
      foreignKey: "posted_by",
      targetKey: "user_id",
      as: "user",
    });
  };

  return articles;
};
