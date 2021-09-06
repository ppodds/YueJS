const { Sequelize, Model, DataTypes } = require("sequelize");

class Grab extends Model {}

module.exports = {
    Grab: Grab,
    init(sequelize) {
        this.instance = Grab.init(
            {
                guild: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                channel: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                time: {
                    type: DataTypes.DATE,
                    defaultValue: Sequelize.NOW,
                    allowNull: false,
                },
            },
            { sequelize }
        );
    },
};
