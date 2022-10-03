const { onlyLoggedUsers } = require("../helpers/onlyLoggedUsers");

const router = require("express").Router();
const { SQL } = require("../dbconfig");
const fs = require("fs");
const path = require("path");

// gets products by category
router.get("/category/:category", onlyLoggedUsers, async (req, res) => {
  try {
    const cat = req.params.category;
    let products;

    const catId = await SQL(
      `SELECT id FROM shoes_online.categories WHERE category = "${cat}";`
    );

    if (cat == "all") {
      products = await SQL(`SELECT * FROM shoes_online.products;`);
    } else {
      products = await SQL(
        `SELECT * FROM products WHERE category_id = ${catId[0].id};`
      );
    }

    res.send({ products });
  } catch (err) {
    res.send(err);
    console.log(err);
  }
});
// gets products by category

// gets products by size , brand , color
router.get("/filterBy", onlyLoggedUsers, async (req, res) => {
  try {
    let products = await SQL(`SELECT * FROM shoes_online.products;`);
    const { brand_g, size_g, color_g } = req.query;

    // filter by brand
    if (brand_g) {
      const brandArray = brand_g.split(",");
      products = products.filter((p) => brandArray.includes(p.brand));
    }

    // filter by size
    if (size_g) {
      let sizeArray = size_g.split(",");
      sizeArray = sizeArray.map((s) => parseInt(s));
      products = products.filter((p) => {
        const pSizes = p.size.split("-");
        for (let i = parseInt(pSizes[0]); i <= parseInt(pSizes[1]); i++) {
          if (sizeArray.includes(i)) {
            return p;
          }
        }
      });
    }

    // filter by color
    if (color_g) {
      const colorArray = color_g.split(",");
      products = products.filter((p) => {
        const pColors = p.color.split("/");
        for (let i = 0; i < pColors.length; i++) {
          if (colorArray.includes(pColors[i])) {
            return p;
          }
        }
      });
    }

    res.send({ products });
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});
// gets products by size , brand , color

// gets products by search value
router.get("/search", onlyLoggedUsers, async (req, res) => {
  try {
    const { searchValue } = req.query;

    const products = await SQL(
      `SELECT * FROM products WHERE name LIKE "%${searchValue}%" OR brand LIKE "%${searchValue}%";`
    );

    res.send({ products });
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});
// gets products by search value

// get all dates that are full booked
router.get("/takenDates", onlyLoggedUsers, async (req, res) => {
  try {
    const takenDates = await SQL(
      `SELECT arrivalTime, COUNT(arrivalTime)
    FROM shoes_online.orders
    WHERE orders.arrivalTime = orders.arrivalTime
    GROUP BY arrivalTime
    HAVING COUNT(arrivalTime) > 2;
    `
    );

    res.send({ takenDates });
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});
// get all dates that are full booked

// get user cart
router.get("/cart", onlyLoggedUsers, async (req, res) => {
  try {
    const userId = req.session.user_id;

    const cart = await SQL(`SELECT id FROM carts WHERE user_id = ${userId};`);

    if (cart.length == 0) {
      return res.send({ msg: "Your cart is empty please add products" });
    }

    const cartId = cart[0].id;

    const userCart = await SQL(`SELECT items.cart_id,
    products.name,
    products.brand, 
    items.amount,
    items.price,
    products.gender,
    items.size,
    products.color,
    products.image,
    products.id
    FROM shoes_online.items
    INNER JOIN carts
    ON items.cart_id = carts.id
    INNER JOIN products
    ON items.product_id = products.id
    WHERE cart_id = ${cartId};`);

    let sumPrice = 0;

    userCart.map((i) => (sumPrice += i.price));

    res.send({ userCart, sumPrice });
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});
// get user cart

// adding product to user cart
router.post("/", onlyLoggedUsers, async (req, res) => {
  try {
    const { amount, product_id, size } = req.body;

    if (!amount || !product_id || !size) {
      return res.status(500).send({ err: "Missing some info" });
    }

    const user_id = req.session.user_id;

    const product = await SQL(
      `SELECT price FROM products WHERE id = ${product_id};`
    );

    const item = await SQL(
      `SELECT * FROM items WHERE product_id = ${product_id} AND size = ${size};`
    );

    let sizeBool = item.find((i) => i.size == size);

    const fPrice = amount * product[0].price;
    const cartId = await SQL(
      `SELECT id FROM carts WHERE user_id = ${user_id};`
    );

    if (!sizeBool) {
      // if this item is not in the users cart
      await SQL(`INSERT INTO items (amount, price, product_id, cart_id, size)
      VALUES (${amount}, ${fPrice}, ${product_id}, ${cartId[0].id}, ${size});`);
    } else {
      // if item is allready in the user cart
      console.log(item[0].id, size);
      await SQL(`UPDATE items 
      SET amount = ${item[0].amount + amount},
      price = ${item[0].price + fPrice} 
      WHERE id = ${item[0].id} AND size = ${size};`);
    }

    res.send({ msg: "item added succsesfully :)" });
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});
// adding product to user cart

// removing product from user cart
router.delete("/item", onlyLoggedUsers, async (req, res) => {
  try {
    const { product_id, size } = req.body;

    if (!product_id || !size) {
      return res.status(500).send({ err: "Mssing some info" });
    }

    const item = await SQL(
      `SELECT * FROM items WHERE product_id = ${product_id} AND size = ${size};`
    );

    let priceToBeReduced = item[0].price / item[0].amount;

    if (item[0].amount == 1) {
      await SQL(
        `DELETE FROM items WHERE id = ${item[0].id} AND size = ${size};`
      );
    } else {
      await SQL(`UPDATE items
      SET amount = ${item[0].amount - 1},
      price = ${item[0].price - priceToBeReduced}
      WHERE id = ${item[0].id} AND size = ${size};`);
    }

    res.send({ msg: "item removed :)" });
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});
// removing product from user cart

// empty user cart
router.delete("/all", onlyLoggedUsers, async (req, res) => {
  try {
    const user_id = req.session.user_id;

    const cart = await SQL(`SELECT id FROM carts WHERE user_id = ${user_id};`);

    const cartId = cart[0].id;

    await SQL(`DELETE FROM items WHERE cart_id = ${cartId};`);

    res.send({ msg: "all products has removed from your cart :)" });
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});
// empty user cart

// handling user checkout
router.post("/checkout", onlyLoggedUsers, async (req, res) => {
  try {
    const { city, street, arrivalDate, digits } = req.body;

    if (!city || !street || !arrivalDate || !digits) {
      return res.status(500).send({ err: "missing some info" });
    }

    const client = await SQL(
      `SELECT id, username, name, lastname, city, street FROM shoes_online.users WHERE id = ${req.session.user_id};`
    );

    const cartId = (
      await SQL(`SELECT id FROM carts WHERE user_id = ${req.session.user_id};`)
    )[0].id;

    const clientCart = await SQL(`SELECT items.cart_id,
    products.name,
    products.brand, 
    items.amount,
    items.price,
    products.gender,
    items.size,
    products.color,
    products.image
    FROM shoes_online.items
    INNER JOIN carts
    ON items.cart_id = carts.id
    INNER JOIN products
    ON items.product_id = products.id
    WHERE cart_id = ${cartId};`);

    let subTotal = 0;

    clientCart.map((i) => {
      console.log(typeof i.price);
      subTotal += i.price;
    });

    let total = subTotal + 15;

    await SQL(
      `INSERT INTO orders (finalPrice, city, street, arrivalTime, digits, user_id, cart_id)
      VALUES (${total}, "${city}", "${street}", "${arrivalDate}", "${digits}", ${req.session.user_id}, ${cartId});`
    );

    const currentOrder = await SQL(
      `SELECT id, orderDate FROM orders ORDER BY ID DESC LIMIT 1;`
    );

    let checkoutInfo = {};
    checkoutInfo.client = client;
    checkoutInfo.digits = digits;
    checkoutInfo.cart = clientCart;
    checkoutInfo.orderId = currentOrder[0].id;
    checkoutInfo.orderDate = currentOrder[0].orderDate;
    checkoutInfo.dueDate = arrivalDate;
    checkoutInfo.subTotal = subTotal;
    checkoutInfo.total = total;

    const userOrder = await SQL(
      `SELECT orderDate FROM orders WHERE user_id = ${req.session.user_id};`
    );

    let strDate = JSON.stringify(userOrder[userOrder.length - 1].orderDate);

    strDate = strDate.substring(0, strDate.length - 3);

    await SQL(
      `UPDATE users SET last_purchase = ${strDate}" WHERE id = ${req.session.user_id};`
    );

    await SQL(`DELETE FROM items WHERE cart_id = ${cartId};`);

    let recp = `ORDER #${currentOrder[0].id}`;

    for (const item of clientCart) {
      recp += `\n\n ${item.price}: ${item.price}$, X${item.amount} \n --------------------------------`;
    }

    recp += `\n\n Sub Total: ${subTotal}$ \n --------------------------------`;

    recp += `\n\n Total Price: ${total}$`;

    const filePath = path.join(
      __dirname,
      `../orders/order#${currentOrder[0].id}.txt`
    );

    fs.writeFile(filePath, recp, (err) => {
      if (err) {
        console.log(err);
      }
    });

    res.send({ checkoutInfo });
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});
// handling user checkout

// download receipt
router.get("/download/:orderId", onlyLoggedUsers, async (req, res) => {
  try {
    const { orderId } = req.params;

    if (!orderId) {
      return res.send({ err: "Please provide order id" });
    }

    const filePath = path.join(__dirname, `../orders/order#${orderId}.txt`);

    res.download(filePath, `order#${orderId}.txt`);
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});
// download receipt

// ***I TRIED TO CEATE AN IMG FOR THE INVOICE AND TO STORE IT INSIDE A FOLDER I COULDENT DO IT :/*** */
// *** ALSO I TRIED YOUR METHOD WITH THE TXT AND COULD NOT FIGURE IT OU *** //

module.exports = router;
