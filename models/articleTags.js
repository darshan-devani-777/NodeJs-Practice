module.exports = (sequelize, DataTypes) => {
  const articleTags = sequelize.define(
    "article_tags",
    {
      article_tag_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      type: {
        type: DataTypes.ENUM("baby", "pregnancy", "parenthood", "family"),
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lowercase_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      image: {
        type: DataTypes.TEXT,
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
          fields: ["lowercase_name"],
        },
      ],
    }
  );

  articleTags.associate = (models) => {
    articleTags.hasMany(models.article_topics, {
      foreignKey: "article_tag_id",
      as: "topics",
    });
  };

  return articleTags;
};
