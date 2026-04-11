const Product = require("../models/productModel");

exports.getAllProducts = async (req, res) => {
  try {
    let query = Product.find();
    const products = await query;

    res.json({
      data: products,
    });
  } catch (error) {
    res.status(400);
    console.log("Error at getting all produt", error.message);
  }
};

exports.createProduct = async (req, res) => {
  try {
    const product = new Product(req.body);
    const savedProduct = await product.save();
    res.json(savedProduct);
  } catch (error) {
    res.status(400);
    console.log("Error at creating product", error.message);
  }
};

exports.getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    res.json(product);
  } catch (error) {
    res.status(400);
    console.log("Error at getting a particular produt", error.message);
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    Object.assign(product, req.body);
    await product.save();
    res.json(product);
  } catch (error) {
    res.status(400);
    console.log("Error at updating a particular product", error.message);
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    res.status(400);
    console.log("Error at deleting a particular product", error.message);
  }
};
