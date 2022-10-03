const { onlyAdminUsers } = require("../helpers/onlyAdminUsers");

const router = require("express").Router();
const { SQL } = require("../dbconfig");

// admin adding product
router.post("/", onlyAdminUsers, async (req, res) => {
  try {
    const {
      name,
      gender,
      brand,
      size,
      color,
      price,
      on_sale,
      image,
      category_id,
    } = req.body;

    if (
      !name ||
      !gender ||
      !brand ||
      !size ||
      !color ||
      !price ||
      !on_sale ||
      !image ||
      !category_id
    ) {
      return res.status(500).send({ err: "missing some info about product" });
    }

    await SQL(`INSERT INTO products (name, gender, brand, size, color, price, on_sale, image, category_id) 
    VALUES ("${name}", "${gender}", "${brand}", "${size}", "${color}", ${price}, ${on_sale},"${image}", ${category_id})`);

    res.send({ msg: "product added :)" });
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});
// admin adding product

// admin editing product
router.put("/", onlyAdminUsers, async (req, res) => {
  try {
    const { name, gender, size, color, price, on_sale, image, product_id } =
      req.body;

    if (
      !name ||
      !gender ||
      !size ||
      !color ||
      !price ||
      !on_sale ||
      !image ||
      !product_id
    ) {
      return res.status(500).send({ err: "some info is missing" });
    }

    await SQL(
      `UPDATE products
    SET name = "${name}",
    gender = "${gender}",
    size = "${size}",
    color = "${color}",
    price = ${price},
    on_sale = ${on_sale},
    image = "${image}"
    WHERE products.id = ${product_id};`
    );

    res.send({ msg: "Changes saved :)" });
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});
// admin editing product

module.exports = router;
