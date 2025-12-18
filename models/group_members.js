
module.exports = (sequelize, DataTypes) => {
    const group_members = sequelize.define("group_members", {
        group_member_id: {
            allowNull: false,
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
        },
        user_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        group_id: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        created_by: {
            type: DataTypes.UUID,
            allowNull: false,
        },
        is_owner: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: 0
        },
        deleted_at: {
            allowNull: true,
            type: DataTypes.DATE,
        }
    }, {
        paranoid: true,
        createdAt: 'added_at',
        updatedAt: false,
        deletedAt: 'deleted_at'
    });

    group_members.associate = (models) => {
        group_members.belongsTo(models.users, {
            as: "member",
            foreignKey: "user_id",
            targetKey: "user_id",
        });

        group_members.belongsTo(models.groups, {
            as: "group",
            foreignKey: "group_id",
            targetKey: "group_id",
        });
    };

    return group_members;
};
