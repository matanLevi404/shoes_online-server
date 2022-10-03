const mysql = require("mysql");

const con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "gaSZdEEfTHYUJ120iokLp_O%01R",
  database: "shoes_online",
  timezone: "utc",
});

con.connect((err) => {
  if (err) {
    return console.log(err);
  }

  console.log("Connected to mySql server");
});

const SQL = (q) => {
  return new Promise((resolve, reject) => {
    con.query(q, (err, results) => {
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  });
};

module.exports = { SQL };
