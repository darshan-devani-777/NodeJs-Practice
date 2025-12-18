module.exports = (Sequelize, DataTypes) => {
  const sub_topics = Sequelize.define("email_sub_topics", {
    sub_topic_id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    sub_topic_type: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    sub_topic_info: DataTypes.TEXT,
    topic_id: {
      type: DataTypes.UUID,
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

  sub_topics.associate = (models) => {
    sub_topics.belongsTo(models.email_topics, { 
      foreignKey: "topic_id", 
      targetKey: "topic_id", 
      as: "email_topics" 
    });
  };

  return sub_topics;
};
