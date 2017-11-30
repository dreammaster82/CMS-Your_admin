'use strict';

module.exports = {
  up: function (queryInterface, Sequelize) {
      return queryInterface.createTable('Users',
          {
              id: {type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
              token: {type: Sequelize.STRING(32), },
              ref_token: {type: Sequelize.STRING(32)},
              login: {type: Sequelize.STRING(32)},
              password: {type: Sequelize.STRING(32)},
              permissions: {type: Sequelize.JSON},
          }, {

              charset: 'utf8',
              engine: 'InnoDB',
              collate: 'utf8_general_ci'
          }).then(() => queryInterface.addIndex('Users', ['login', 'password']))
          .then(() => queryInterface.addIndex('Users', ['token']))
          .then(() => queryInterface.addIndex('Users', ['ref_token']))
          .then(() => queryInterface.sequelize.query("INSERT INTO Users SET login='Admin', password=MD5('Admin'), permissions='{\"admin\": [\"edit\", \"view\"], \"content\": [\"edit\", \"view\"]}'"));
  },

  down: function (queryInterface, Sequelize) {
      return queryInterface.dropTable('Users');
  }
};
