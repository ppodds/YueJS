const { Model, DataTypes } = require("sequelize");

class User extends Model {
    static async get(id) {
        const [user, created] = await User.findOrCreate({
            where: {
                id: id,
            },
        });
        return user;
    }
}

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
