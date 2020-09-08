const createError = require("http-errors");
const express = require("express");
const path = require("path");
// const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cors = require("cors");
const session = require("express-session");

const listRouter = require("./routes/list");
const authRouter = require("./routes/auth");

const app = express();

console.log(path.join(__dirname, "public", "index.html"));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
<<<<<<< HEAD
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
=======
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
>>>>>>> a73736602ca46cedf26cb3e5e0681aff96972ffc

app.use("/api/list", listRouter);
app.use("/auth", authRouter);
app.use(express.static(path.join(__dirname, "public")));
if(process.env.NODE_ENV === "production") {
  app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
    console.log(path.join(__dirname, "public", "index.html"))
  });
}

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
	res.send('You encountered an error...')
});

module.exports = app;
