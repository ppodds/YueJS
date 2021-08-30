const { Model, DataTypes } = require("sequelize");

class User extends Model {}

module.exports = {
    User: User,
    init(sequelize) {
        this.instance = User.init(
            {
                id: {
                    type: DataTypes.STRING,
                    unique: true,
                    primaryKey: true,
                },
                contribution: {
                    type: DataTypes.INTEGER,
                    defaultValue: 0,
                    allowNull: false,
                },
            },
            { sequelize }
        );
    },
};
