// imports
const exp = require("express");
const session = require("express-session");
const cors = require("cors");
require("dotenv").config();

// inits
const app = exp();
const corsOptions = {
  origin: "http://localhost:57349",
  credentials: true,
};

// middlewares
app.use(exp.json());
app.use(cors(corsOptions));
app.use(
  session({
    secret: "@shoes_onlineKeyHolder@",
    name: "session",
    saveUninitialized: true,
    resave: true,
    cookie: {
      maxAge: 1000 * 60 * 60,
    },
  })
);
app.use(exp.static("orders"));

// listen

app.use("/shoesOnline", require("./routes/starters"));
app.use("/shoesOnline/main", require("./routes/main"));
app.use("/shoesOnline/main/admin", require("./routes/admin"));

app.listen(process.env.PORT || 1001, () => {
  console.log("Server is up and running");
});
