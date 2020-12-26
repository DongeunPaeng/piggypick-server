const express = require("express");
const mysql = require("mysql");
const axios = require("axios");
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

/* GET items */
router.get("/:id", function(req, res, next) {
  const {
    params: { id }
  } = req;
  connection.query(
    `select id from teams where id = ?`,
    id,
    (err, data, fields) => {
      if (err) throw err;
      if (data[0] === undefined) {
        res.sendStatus(404);
      } else {
        const sql = `select A.name, A.id, C.email from restaurants A, restaurants_teams B, users C where B.restaurant_id = A.id and A.author_id = C.id and B.team_id = ? order by A.date desc`;
        connection.query(sql, id, (err, data, fields) => {
          if (err) throw err;
          res.status(200).send(data);
        });
      }
    }
  );
});

router.delete("/", function(req, res, next) {
  const {
    body: { name }
  } = req;
  const sql = `delete from restaurants where name = ?`;
  connection.query(sql, name, (err, data, fields) => {
    if (err) throw err;
    res.json({
      status: 200,
      message: "Deleted the option"
    });
  });
});

router.post("/", function(req, res, next) {
  const {
    body: { uid, name, teamId }
  } = req;
  const sql1 = `select id from users where uid = ?`;
  connection.query(sql1, uid, (err, data, fields) => {
    if (err) throw err;
    const id = data[0].id;
    const sql2 = `insert into restaurants (name, visits, date, author_id) values (?, 0, now(), ?)`;
    connection.query(sql2, [name, id], (err, data, fields) => {
      if (err) throw err;
      const sql3 = `insert into restaurants_teams (restaurant_id, team_id) values (?, ?)`;
      connection.query(sql3, [data.insertId, teamId], (err, data, fields) => {
        res.json({
          status: 200,
          message: "New restaurant registered."
        });
        axios
          .post(process.env.SLACK_HOOK_URL, {
            text: `New Restaurant registered: ${name} by ${id}`
          })
          .then(() => console.log("ok"))
          .catch(err => console.log(err));
      });
    });
  });
});

module.exports = router;
