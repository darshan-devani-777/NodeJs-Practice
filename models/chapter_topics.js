module.exports = (sequelize, DataTypes) => {
  const chapter_topics = sequelize.define(
    "chapter_topics",
    {
      topic_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      chapter_id: { type: DataTypes.UUID, allowNull: false },
      title: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.TEXT, allowNull: true },
      order: { type: DataTypes.INTEGER, allowNull: false },
      deleted_at: { type: DataTypes.DATE, allowNull: true },
    },
    { paranoid: true, deletedAt: "deleted_at" }
  );

  chapter_topics.associate = (models) => {
    chapter_topics.belongsTo(models.course_chapters, {
      foreignKey: "chapter_id",
      as: "chapter",
    });

    chapter_topics.hasMany(models.topic_subtopics, {
      foreignKey: "topic_id",
      as: "subtopics",
    });
  };

  return chapter_topics;
};
