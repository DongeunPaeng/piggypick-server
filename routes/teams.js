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
    res.status(200).send(data);
  });
});

// POST teams
router.post("/", (req, res, next) => {
  const {
    body: { id, password, uid }
  } = req;

  const sql1 = `select id from users where uid = ?`;
  connection.query(sql1, uid, (err, data, fields) => {
    if (err) throw err;
    const userId = data[0].id;
    const sql2 = `select password from teams where id = ?`;
    connection.query(sql2, id, (err, data, fields) => {
      if (err) throw err;
      rightPassword = data[0].password;
      if (rightPassword !== password) {
        res.sendStatus(400);
      } else {
        const sql3 = `insert into users_teams_roles (user_id, team_id, role, date) values (?, ?, 1, now())`;
        connection.query(sql3, [userId, id], (err, data, fields) => {
          if (err) throw err;
          res.json({
            status: 200,
            message: "Newly joined to the team."
          });
          // SLACK alert needed
        });
      }
    });
  });
});

router.post("/make", (req, res, next) => {
  const {
    body: { password, name }
  } = req;
  const sql = `insert into teams (password, name, manager_id, date) values (?, ?, 1, now())`;
  connection.query(sql, [password, name], (err, data, fields) => {
    if (err) throw err;
    connection.query(
      "select manager_id, id from teams where id = last_insert_id()",
      (err, data, fields) => {
        const userId = data[0].manager_id;
        const teamId = data[0].id;
        const sql2 = `insert into users_teams_roles (user_id, team_id, role, date) values (?, ?, 3, now())`;
        connection.query(sql2, [userId, teamId], (err, data, fields) => {
          if (err) throw err;
          res.sendStatus(200);
        });
      }
    );
  });
});

module.exports = router;
