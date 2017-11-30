'use strict';
const fs = require('fs'),
  path = require('path'),
  Sequelize = require('sequelize'),
  basename = path.basename(module.filename),
  env = process.env.NODE_ENV || 'development',
  config = require(__dirname + '/../config/config.json')[env],
  db = {};

let database, username, password;
if (config.use_env_variable) {
  database = process.env.DB_DB;
  username = process.env.DB_USER || database;
  password = process.env.DB_PASS;
  config.host = process.env.DB_HOST;
} else {
  database = config.database;
  username = config.username;
  password = config.password;
}

const sequelize = new Sequelize(database, username, password, config);

fs
  .readdirSync(__dirname)
  .filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
  })
  .forEach(function(file) {
    let model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
  });

const modulesPath = __dirname + '/../modules'
fs
    .readdirSync(modulesPath)
    .filter(function(dir) {
        return dir.indexOf('.') == -1 && fs.statSync(modulesPath + '/' + dir).isDirectory();
    })
    .forEach(dir => {
      if (fs.existsSync(`${modulesPath}/${dir}/dbModel`) && fs.statSync(`${modulesPath}/${dir}/dbModel`).isDirectory()) {
          fs.readdirSync(`${modulesPath}/${dir}/dbModel`).forEach(file => {
            try {
                let model = sequelize['import'](path.join(`${modulesPath}/${dir}/dbModel`, file));
                db[model.name] = model;
            } catch (e) {
              console.warn(e);
            }
          });
      }
    });

Object.keys(db).forEach(function(modelName) {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = new Promise((r, rj) => {
    db.sequelize.sync().then(() => r(db)).catch(err => rj(err));
});
