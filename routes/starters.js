const router = require("express").Router();
const bcrypt = require("bcrypt");
const { SQL } = require("../dbconfig");
const { onlyLoggedUsers } = require("../helpers/onlyLoggedUsers");

router.get("/", async (req, res) => {
  try {
    const orders = await SQL(`SELECT id FROM orders;`);

    const products = await SQL(`SELECT id FROM products;`);

    productsAmount = products.length;
    ordersAmount = orders.length;

    if (!req.session.user_id) {
      return res.send({
        err: "no user has logged in",
        hasSession: false,
        hasCart: false,
        username: "Guest",
        productsAmount,
        ordersAmount,
      });
    }

    const user = await SQL(
      `SELECT * FROM users WHERE id = ${req.session.user_id};`
    );

    if (req.session.role == 1) {
      return res.send({
        msg: "admin has logged in",
        hasSession: true,
        hasCart: false,
        username: user[0].username,
        productsAmount,
        ordersAmount,
        isAdmin: true,
      });
    }

    const cart = await SQL(
      `SELECT * FROM carts WHERE user_id = ${req.session.user_id};`
    );

    const checkIfCartIsEmpty = await SQL(
      `SELECT * FROM items WHERE cart_id = ${cart[0].id}`
    );

    if (checkIfCartIsEmpty.length != 0) {
      return res.send({
        msg: "you have an open cart since " + cart[0].created,
        hasSession: true,
        hasCart: true,
        username: user[0].username,
        productsAmount,
        ordersAmount,
        isAdmin: false,
        city: user[0].city,
        street: user[0].street,
      });
    }

    const checkLastPurchase = await SQL(
      `SELECT last_purchase FROM users WHERE id = ${req.session.user_id}`
    );

    if (checkLastPurchase[0].last_purchase != null) {
      const date = JSON.stringify(checkLastPurchase[0].last_purchase).slice(
        0,
        11
      );
      return res.send({
        msg: "Your last purchase was on the " + date,
        hasSession: true,
        hasCart: false,
        username: user[0].username,
        productsAmount,
        ordersAmount,
        isAdmin: false,
        city: user[0].city,
        street: user[0].street,
      });
    }

    res.send({
      msg: "Welcome " + user[0].username + " :)",
      hasSession: true,
      hasCart: false,
      username: user[0].username,
      productsAmount,
      ordersAmount,
      isAdmin: false,
      city: user[0].city,
      street: user[0].street,
    });
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

// router.get("/generalInfo", async (req, res) => {
//   try {
//     const orders = await SQL(`SELECT id FROM orders;`);

//     const products = await SQL(`SELECT id FROM products;`);

//     productsAmount = products.length;
//     ordersAmount = orders.length;

//     res.send({ productsAmount, ordersAmount });
//   } catch (err) {
//     console.log(err);
//     res.send(err);
//   }
// });

// login
router.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(500).send({ err: "missing username or pasword" });
    }

    const users = await SQL(`SELECT * FROM users;`);

    const user = users.find((u) => u.username == username);

    if (!user) {
      return res.status(500).send({ err: "user not found" });
    }

    if (user.role) {
      if (!(await bcrypt.compare(password, user.password))) {
        res.status(500).send({ err: `Wrong username or password` });
      }

      req.session.user_id = user.id;
      req.session.role = user.role;

      return res.send({ isAdmin: true, msg: "admin logged succssesfully" });
    }

    if (!(await bcrypt.compare(password, user.password))) {
      res.status(500).send({ err: `Wrong username or password` });
    }

    req.session.user_id = user.id;

    const cart = await SQL(
      `SELECT id FROM carts WHERE user_id = ${req.session.user_id};`
    );

    if (cart.length == 0) {
      await SQL(`INSERT INTO carts (user_id) VALUES (${req.session.user_id})`);
    }

    res.send({ isAdmin: false, msg: "user logged succssesfully" });
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});
// login

// checks id id is allready in use
router.post("/checkId", async (req, res) => {
  try {
    const { userID } = req.body;

    const users = await SQL(`SELECT * FROM users`);

    if (users.find((u) => u.userID == userID)) {
      return res.send({ err: "This ID is allready in use" });
    }

    res.send({ msg: "ID is Okay" });
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});
// checks id id is allready in use

// registretion
router.post("/register", async (req, res) => {
  try {
    const { name, lastname, username, userID, password, city, street } =
      req.body;

    if (
      !name ||
      !lastname ||
      !username ||
      !userID ||
      !password ||
      !city ||
      !street
    ) {
      return res
        .status(500)
        .send({ err: "please make sure you feild the form completely" });
    }
    const users = await SQL(`SELECT * FROM shoes_online.users;`);

    //checks if userID is allready used
    // if (users.find((u) => u.userID == userID)) {
    //   return res.status(500).send({ err: "this ID is allready used" });
    // }

    // checks if username allready exists
    if (users.find((u) => u.username == username)) {
      return res.status(500).send({ err: "username allready taken" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await SQL(`INSERT INTO users (name, lastname, username, userID, password, city, street)
    VALUES ("${name}", "${lastname}", "${username}", "${userID}", "${hashedPassword}", "${city}", "${street}"); `);

    // const user = await SQL(`SELECT id FROM users WHERE userID = "${userID}";`);

    // req.session.user_id = user[0].id;

    res.send({ msg: "user added successfully" });
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});
// registretion

// handling user login out
router.delete("/", onlyLoggedUsers, (req, res) => {
  req.session.destroy();
  res.send({ msg: "bye bye! hope to see you again :)" });
});
// handling user login out

module.exports = router;
