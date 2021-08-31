const { Model, DataTypes } = require("sequelize");

class Donor extends Model {
    /**
     * Get contribution ratio according donate type
     * @param {string} type donate type
     * @returns {number} contribution ratio
     */
    static contributionRatio(type) {
        switch (type) {
            case "pic":
                return 1;
            case "hpic":
                return 3;
            case "wtfpic":
                return 1;
            default:
                throw new Error("type not support");
        }
    }
    /**
     * Get contribution amount user need to increase
     * @returns {number} contribution amount user need to increase
     */
    gainContribution() {
        return this.amount * Donor.contributionRatio(this.type);
    }
}

module.exports = {
    Donor: Donor,
    init(sequelize) {
        this.instance = Donor.init(
            {
                guild: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                channel: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                user: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                type: {
                    type: DataTypes.STRING,
                    allowNull: false,
                },
                amount: {
                    type: DataTypes.INTEGER,
                    defaultValue: 0,
                    allowNull: false,
                },
            },
            { sequelize }
        );
    },
};
