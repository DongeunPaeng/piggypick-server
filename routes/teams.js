const express = require("express");
const mysql = require("mysql");
const dotenv = require("dotenv");

dotenv.config();

const router = express.Router();

let connection;

const handleDisconnect = () => {
  connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
  });

  connection.connect(err => {
    if (err) {
      console.log("error when connecting to db:", err);
      setTimeout(handleDisconnect, 2000);
    }
    console.log("route: db connected...⬆️");
  });

  connection.on("error", err => {
    console.log("db error", err);
    if (err.code === "PROTOCOL_CONNECTION_LOST") {
      handleDisconnect();
    } else {
      throw err;
    }
  });
};

handleDisconnect();

/* GET teams */
router.get("/", function(req, res, next) {
  const sql = `select id, name from teams order by date desc`;
  connection.query(sql, (err, data, fields) => {
    if (err) throw err;
    teams = data;
    res.status(200).send(data);
  });
});

// POST teams
router.post("/", (req, res, next) => {
  const {
    body: { id }
  } = req;
  const sql = `insert into users_teams_roles (user_id, team_id, role) values (1, ?, 0)`;
  connection.query(sql, id, (err, data, fields) => {
    if (err) throw err;
    res.json({
      status: 200,
      message: "Newly joined to the team."
    });
    // SLACK alert needed
  });
});

module.exports = router;
