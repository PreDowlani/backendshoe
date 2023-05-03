const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
// require("dotenv").config();
const port = 5000;

app.use(cors());

app.use(express.json());

const routeUser = require("./routes/routeUsers");
app.use("/api/users", routeUser);

const routeProducts = require("./routes/routeProducts");
app.use("/api/products", routeProducts);

app.use((req, res) => {
  res.status(404).json({
    message: `Unable to connect with the server..`,
  });
});

mongoose
  .connect(
    "mongodb+srv://Prashanth:Prashanth150492@cluster0.udzwxfp.mongodb.net/onlinestore?retryWrites=true&w=majority"
  )
  .then(() => {
    app.listen(port, () => console.log(`User listing through port ${port}`));
  })
  .catch((error) => console.log(error));
