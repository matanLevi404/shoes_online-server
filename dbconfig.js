const mysql = require("mysql");

const con = mysql.createConnection({
  host: "database.c4s5ntv6m3pf.eu-west-1.rds.amazonaws.com",
  user: "matan",
  password: "12345678",
  database: "database",
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
