module.exports = (sequelize, DataTypes) => {
    const Report = sequelize.define('reports', {
        report_id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        group_id:{
            type: DataTypes.UUID,
            allowNull: true
        },
        post_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        comment_id: {
            type: DataTypes.UUID,
            allowNull: true,
        },
        reported_by: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        reason: {
            type: DataTypes.STRING,
            allowNull: false
        },
        addtional_info:{
            type: DataTypes.TEXT,
            allowNull: true
        },
        deleted_at: {
            allowNull: true,
            type: DataTypes.DATE,
        }
    }, {
        paranoid: true,
        deletedAt: 'deleted_at'
    });
    Report.associate = (models) => {
        Report.belongsTo(models.posts, { foreignKey: 'post_id', as: 'post', targetKey: 'post_id' });
        Report.belongsTo(models.comments, { foreignKey: 'comment_id', as: 'comment', targetKey: 'comment_id' });
        Report.belongsTo(models.users, { foreignKey: 'reported_by', as: 'user', targetKey: 'user_id' });
        Report.belongsTo(models.groups, { foreignKey: 'group_id', as: 'group', targetKey: 'group_id' });
    }
    return Report;
}