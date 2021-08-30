const { Model, DataTypes } = require("sequelize");

class Reply extends Model {}

module.exports = {
    Reply: Reply,
    init(sequelize) {
        this.instance = Reply.init(
            {
                dm: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                },
                scope: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                key: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                response: {
                    type: DataTypes.STRING(2000),
                    allowNull: false,
                },
                fomatted: {
                    type: DataTypes.BOOLEAN,
                    allowNull: false,
                },
            },
            { sequelize }
        );
    },
};
