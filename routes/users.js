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

router.get("/:uid/teams", (req, res, next) => {
  const {
    params: { uid }
  } = req;

  const sql1 = `select id from users where uid = ?`;
  connection.query(sql1, uid, (err, data, fields) => {
    if (err) throw err;
    const userId = data[0].id;
    const sql2 = `select team_id from users_teams_roles where user_id = ?`;
    connection.query(sql2, userId, (err, data, fields) => {
      if (err) throw err;
      teams = data;
      res.status(200).send(data);
    });
  });
});

// Register new user

router.post("/", (req, res, next) => {
  const {
    body: { uid, email }
  } = req;

  console.log(uid, email);

  const sql = `insert ignore into users (email, uid) values (?, ?)`;
  connection.query(sql, [email, uid], (err, _, __) => {
    if (err) throw err;
    res.json({
      status: 200,
      message: "registered user successfully"
    });
  });
});

module.exports = router;
