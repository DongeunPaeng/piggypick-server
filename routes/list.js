const express = require("express");
const mysql = require("mysql");
const axios = require('axios');

const router = express.Router();

console.log(process.env.SLACK_HOOK_URL);

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
    console.log("db connected...⬆️");
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

/* GET list */
router.get("/", function(req, res, next) {
  const sql = `select name from restaurants order by date desc`;
  connection.query(sql, (err, data, fields) => {
    if (err) throw err;
    restaurants = data;
    res.status(200).send(data);
  });
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
    body: { name }
  } = req;
  const sql = `insert into restaurants (name, visits, date) values (?, 0, now())`;
  connection.query(sql, name, (err, data, fields) => {
    if (err) throw err;
    res.json({
      status: 200,
      message: "New restaurant registered."
    });
    axios.post(process.env.SLACK_HOOK_URL, {
      text: `New Restaurant registered: ${name}`
    }).then(() => console.log('ok')).catch(err => console.log(err));
  });
});

module.exports = router;
