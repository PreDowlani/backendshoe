const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, uppercase: true, trim: true },
  age: { type: Number, required: true },
  phone: { type: String },
  email: { type: String, lowercase: true, required: true },
  password: { type: String, required: true },
  cart: [{ type: mongoose.Types.ObjectId, ref: "Products" }],
});

userSchema.plugin(uniqueValidator);

module.exports = new mongoose.model("User", userSchema);
