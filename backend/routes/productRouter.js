const express = require("express");
const productRouter = express.Router();
const productController = require("../controller/productController");

productRouter
  .route("/")
  .get(productController.getAllProducts)
  .post(productController.createProduct);

productRouter
  .route("/:id")
  .get(productController.getProduct)
  .put(productController.updateProduct)
  .delete(productController.deleteProduct);

module.exports = productRouter;
