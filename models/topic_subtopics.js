module.exports = (sequelize, DataTypes) => {
  const topic_subtopics = sequelize.define(
    "topic_subtopics",
    {
      subtopic_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false,
      },
      topic_id: { type: DataTypes.UUID, allowNull: false },
      title: { type: DataTypes.STRING, allowNull: false },
      content: { type: DataTypes.TEXT, allowNull: true },
      order: { type: DataTypes.INTEGER, allowNull: false },
      deleted_at: { type: DataTypes.DATE, allowNull: true },
    },
    { paranoid: true, deletedAt: "deleted_at" }
  );

  topic_subtopics.associate = (models) => {
    topic_subtopics.belongsTo(models.chapter_topics, {
      foreignKey: "topic_id",
      as: "topic",
    });
  };

  return topic_subtopics;
};
