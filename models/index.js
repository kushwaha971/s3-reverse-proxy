const Sequelize = require("sequelize");
const sequelize = new Sequelize(process.env.PG_DB_URL, {
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false,
    },
  },
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.Project = require("./project/project.model")(sequelize, Sequelize);

module.exports = db;
