module.exports = (Sequelize, DataTypes) => {
  const CommunityTags = Sequelize.define("community_tags", {
    community_id: {
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
    paranoid: true,
    deletedAt: 'deleted_at'
  });

  return CommunityTags;
};
