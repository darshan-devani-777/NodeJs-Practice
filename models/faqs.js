module.exports = (sequelize, DataTypes) => {
    const faqs = sequelize.define("faqs", {
      faq_id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        allowNull: false,
        primaryKey: true,
      },
      question: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      answer: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      deleted_at: {
        allowNull: true,
        type: DataTypes.DATE,
      },
    }, {
        paranoid: true,
        createdAt: 'created_at',
        updatedAt: 'updated_at',
        deletedAt: 'deleted_at'
    });
    
    return faqs;
  };
  