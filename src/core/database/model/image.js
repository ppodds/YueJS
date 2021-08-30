const { Model, DataTypes } = require("sequelize");

class Image extends Model {
    // type
    // 0 pic / 1 hpic / 2 wtfpic
}

module.exports = {
    Image: Image,
    init(sequelize) {
        this.instance = Image.init(
            {
                type: {
                    type: DataTypes.TINYINT,
                    allowNull: false,
                },
                uploader: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                ext: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                image: {
                    type: DataTypes.BLOB("medium"),
                    allowNull: false,
                },
            },
            { sequelize }
        );
    },
};
