module.exports = (sequelize, DataTypes) => {
  const course_chapters = sequelize.define(
    "course_chapters",
    {
      chapter_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      course_id: { type: DataTypes.UUID, allowNull: false },
      title: { type: DataTypes.STRING, allowNull: false },
      description: { type: DataTypes.STRING, allowNull: false },
      order: { type: DataTypes.INTEGER, allowNull: false },
      video_url: { type: DataTypes.STRING, allowNull: true },
      video_name: { type: DataTypes.STRING, allowNull: true },
      deleted_at: { type: DataTypes.DATE, allowNull: true },
    },
    { paranoid: true, deletedAt: "deleted_at" }
  );

  course_chapters.associate = (models) => {
    course_chapters.belongsTo(models.courses, {
      foreignKey: "course_id",
      as: "course",
    });

    course_chapters.hasMany(models.chapter_topics, {
      foreignKey: "chapter_id",
      as: "topics",
    });
  };

  return course_chapters;
};
