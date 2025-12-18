module.exports = (sequelize, DataTypes) => {
    const feedbacks = sequelize.define("feedbacks", {
      feedback_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      name: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      feedback_text: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      image: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      image_name: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      deleted_at: {
        allowNull: true,
        type: DataTypes.DATE,
      },
    }, {
        paranoid: true,
        timestamps: false
    });
    
    return feedbacks;
  };
  