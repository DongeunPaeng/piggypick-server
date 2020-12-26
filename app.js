const createError = require("http-errors");
const express = require("express");
const path = require("path");
const logger = require("morgan");
const cors = require("cors");

const itemRouter = require("./routes/items");
const teamRouter = require("./routes/teams");
const userRouter = require("./routes/users");

const app = express();

console.log('app.js: ', path.join(__dirname, "public", "index.html"));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/items", itemRouter);
app.use("/api/teams", teamRouter);
app.use("/api/users", userRouter);

app.use(express.static(path.join(__dirname, "public")));
if(process.env.NODE_ENV === "production") {
  app.get("/*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
    console.log('app.js-2: ', path.join(__dirname, "public", "index.html"))
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
