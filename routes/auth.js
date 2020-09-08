const express = require("express");
const router = express.Router();
const dotenv = require('dotenv');

dotenv.config();

/* GET list */
router.post("/", function(req, res, next) {
  const {
    body: { password }
  } = req;
  console.log(password);
  if (password === process.env.SECRET) {
    res.json("authenticated");
  } else {
    res.json("unauthenticated");
  }
});

module.exports = router;
