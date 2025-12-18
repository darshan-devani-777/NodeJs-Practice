module.exports = (Sequelize, DataTypes) => {
  const topics = Sequelize.define("email_topics", {
    topic_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    topic_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    deleted_at: {
      allowNull: true,
      type: DataTypes.DATE,
    },
  }, {
    paranoid: true,
    deletedAt: 'deleted_at',
  });

  topics.associate = (models) => {
    topics.hasMany(models.email_sub_topics, { 
      foreignKey: "topic_id", 
      targetKey: "topic_id", 
      as: "email_sub_topics" 
    });
  };

  return topics;
};
