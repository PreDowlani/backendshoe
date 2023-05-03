const express = require("express");
const router = express.Router();

const Products = require("../models/modelProducts");

router.get("/", async (req, res, next) => {
  let products;
  try {
    products = await Products.find({});
  } catch (error) {
    res.status(404).json({
      message: `Cant list all the products`,
      error: error.messaje,
    });
    return next(error);
  }
  res.status(200).json({
    message: `Showing Products `,
    products: products,
  });
});

router.get("/:id", async (req, res, next) => {
  let productId = req.params.id;
  let specificProduct;
  try {
    specificProduct = await Shoe.findById(productId);
    console.log(prodcurId);
  } catch (err) {
    res.status(500).json({
      message: `Cant show the product `,
      error: err.messaje,
    });
    return next(err);
  }
  res.status(200).json({
    message: `Showing specific product`,
    product: specificProduct,
  });
});

router.post("/", async (req, res, next) => {
  const { name, brand, category, price, quantity } = req.body;
  let productExists;

  try {
    productExists = await Products.findOne({ nombre: productExists });
  } catch (err) {
    res.status(500).json({
      message: `Error in the data `,
      error: err.messaje,
    });
    return next(err);
  }

  if (productExists) {
    const error = new Error(" The prodcut alredy exists in the data base ");
    error.code = 401;
    return next(error);
  } else {
    const newProduct = new Products({
      name,
      brand,
      category,
      price,
      quantity,
    });
    console.log(newProduct);

    try {
      await newProduct.save();
    } catch (err) {
      const error = new Error("Cant save the data");
      error.code = 500;
      return next(err);
    }

    console.log(newProduct);
    res.status(200).json({
      message: `Product created`,
      product: newProduct,
    });
  }
});

router.patch("/:id", async (req, res, next) => {
  const prodcutId = req.params.id;
  let changesToDo = req.body;
  let editProduct;
  try {
    editProduct = await Products.findByIdAndUpdate(prodcutId, changesToDo, {
      new: true,
      runValidators: true,
    });
  } catch (error) {
    const err = new Error("Error with the data");
    error.code = 500;
    return next(err);
  }
  res.status(200).json({
    message: "Product updates",
    product: editProduct,
  });
});

router.delete("/:id", async (req, res, next) => {
  let prodcutId = req.params.id;
  let deleteProduct;
  try {
    deleteProduct = await Products.findByIdAndDelete(prodcutId);
  } catch (err) {
    res.status(404).json({
      message: `Cant delete the product`,
      error: err.messaje,
    });
    return next(err);
  }
  res.status(200).json({
    message: `Product deleted from the data base`,
    delete: deleteProduct,
  });
});

module.exports = router;
