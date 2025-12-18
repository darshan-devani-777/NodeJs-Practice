module.exports = (sequelize, DataTypes) => {
  const blog = sequelize.define("blog", {
    blog_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    title: DataTypes.TEXT,
    content: DataTypes.TEXT("long"),
    description: DataTypes.TEXT,
    image: DataTypes.TEXT,
    posted_by: {
      type: DataTypes.UUID,
      allowNull: false,
    },
    type: DataTypes.ENUM("baby", "pregnancy", "parenthood", "family"),
    is_published: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
  });

  blog.associate = (models) => {
    blog.belongsTo(models.users, {
      foreignKey: "posted_by",
      targetKey: "user_id",
      as: "user",
    });
  };
  return blog;
};
