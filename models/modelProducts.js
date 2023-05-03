const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const productsSchema = new mongoose.Schema({
  image: { type: String, required: true },
  name: { type: String, required: true, uppercase: true, trim: true },
  brand: { type: String, required: true, uppercase: true, trim: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  quantity: { type: Number, required: true, default: 1 },
});

productsSchema.plugin(uniqueValidator);

module.exports = new mongoose.model("Product", productsSchema);
