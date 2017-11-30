/**
 * Created by Denis on 13.09.2017.
 */
module.exports = function (Sequelize, DataTypes) {
    let Images = Sequelize.define('Images', {
        id: {type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true},
        path: {type: DataTypes.STRING(500)},
        name: {type: DataTypes.STRING(255)},
        group: {type: DataTypes.INTEGER}
    }, {charset: 'utf8', collate: 'utf8_general_ci', underscored: true});

    return Images;
};