const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const Users = require("../models/modelUser");
const Products = require("../models/modelProducts");

//to list all the users
router.get("/", async (req, res, next) => {
  let users;
  try {
    users = await Users.find({});
  } catch (error) {
    res.status(404).json({
      message: `Cant list all the users`,
      error: error.messaje,
    });
    return next(error);
  }
  res.status(200).json({
    message: `Showing all the users`,
    users: users,
  });
});

//to get a specific user by its id
router.get("/:id", async (req, res, next) => {
  let idUser = req.params.id;
  let uniqueUser;

  try {
    uniqueUser = await Users.findById(idUser);
  } catch (err) {
    res.status(500).json({
      message: `Error in showing the user `,
      error: err.messaje,
    });
    return next(err);
  }
  res.status(200).json({
    message: `Showing specific user`,
    user: uniqueUser,
  });
});

// to create a new user in the database
router.post("/", async (req, res, next) => {
  const { name, age, email, password, phone } = req.body;
  let userExists;

  //Comprobamos primero si el email del nuevo usuario ya existe en nuestro Base de Datos:
  try {
    userExists = await Users.findOne({ email: email });
  } catch (err) {
    res.status(500).json({
      message: `Error in the data base `,
      error: err.messaje,
    });
    return next(err);
  }

  //Si ya existe un usuario con el mismo e-mail , le saldra error:
  // let nuevoUsuario;
  if (userExists) {
    const error = new Error(" Alredy exisiting a user with the same e-mail");
    error.code = 401;
    return next(error);
    // Si en caso contrario , tras verificar que no existe el nuevo email en nuestro base de datos , procedemos a crear el  nuevo usuario siguiendo nuestro modelo Schema.
  } else {
    //creamos el variable para encriptar la contraseña
    let hashedPassword;
    try {
      // hacemos la encriptacion con un  valor de 10(son las capas de seguridad) recomdable entre 10-14
      hashedPassword = await bcrypt.hash(password, 10);
    } catch (error) {
      const err = new Error("Problem creating the user");
      err.code = 500;
      return next(err);
    }
    console.log(hashedPassword);
    const newUser = new Users({
      name,
      age,
      email,
      password: hashedPassword,
      phone,
    });
    console.log(newUser);

    //procedemos a guardar dicho usuario en nuestro BDD.
    try {
      await newUser.save();

      // si produce algun fallo , lo comunicaremos
    } catch (err) {
      const error = new Error("Couldnt save the user");
      error.code = 500;
      return next(err);
    }
    // si todo esta bien , mostraremos que el usuario nuevo esta creado
    console.log(newUser);
    res.status(200).json({
      message: `User created`,
      createdUser: newUser,
    });
  }
});

//to edit a user by its id
router.put("/:id", async (req, res, next) => {
  let idUser = req.params.id;
  let editUser;
  let thingsToEdit = req.body;

  try {
    editUser = await Users.findByIdAndUpdate(idUser, thingsToEdit, {
      //dentro de aqui podemos cambiar los parametros del usuario
      new: true,
      runValidators: true,
    });
  } catch (error) {
    res.status(404).json({
      message: "Cant update the changes",
      error: error.message,
    });
  }
  res.status(200).json({
    message: `User updated`,
    changes: editUser,
  });
});

//to delete a user by its id
router.delete("/:id", async (req, res, next) => {
  let idUser = req.params.id;
  let deleteUser;

  try {
    deleteUser = await Users.findByIdAndDelete(idUser);
  } catch (err) {
    res.status(404).json({
      message: `Cant delete the user`,
      error: err.messaje,
    });
    return next(err);
  }
  res.status(200).json({
    message: `User deleted in the data base`,
    deleted: deleteUser,
  });
});

//create a login and check if the password is encripted
router.post("/login", async (req, res, next) => {
  const { email, password } = req.body;
  let userExists;

  //Primero comprobaremos el email introducido
  try {
    userExists = await Users.findOne({
      email: email,
    });
  } catch (error) {
    const err = new Error("Problems with this operation.");
    err.code = 500;
    return next(err);
  }
  console.log(userExists);

  // si el email introducido no existe en la BDD , dara un error
  if (!userExists) {
    const error = new Error("The user doesnt exist");
    error.code = 505;
    return next(error);
  }

  //ahora vamos con la Contraseñan , simpre ponemos el contraseña falsa , pordefecto
  let isValidPassword = false;

  //  Encriptamos la contraseña !!
  isValidPassword = bcrypt.compareSync(password, userExists.password);
  // aqui es true cuando comprueba que la contraseña y la contraseña del usuario coincide

  if (!isValidPassword) {
    const error = new Error("User unidentified");
    error.code = 505;
    return next(error);
  }
  // ? Código para la creación del token
  let token;
  try {
    token = jwt.sign(
      {
        userId: userExists.id,
        email: userExists.email,
      },
      "elputoamo18",
      {
        expiresIn: "30min",
      }
    );
  } catch (error) {
    const err = new Error("Login Failed");
    err.code = 500;
    return next(err);
  }

  res.status(200).json({
    message: `User logged in `,
    userId: userExists.id,
    email: userExists.email,
    token: token,
  });
});

//to see the users cart by its id
router.get("/:id/cart", async (req, res, next) => {
  let idUser = req.params.id;
  let usersCart;

  try {
    usersCart = await Users.findById(idUser).populate("cart");
  } catch (err) {
    res.status(500).json({
      message: `User Error `,
      error: err.messaje,
    });
    return next(err);
  }

  res.status(200).json({
    message: ` Showing Users cart`,
    cart: usersCart.cart,
  });
});

//to add the products to the users cart by using the users id
router.put("/:id/cart", async (req, res, next) => {
  let idUser = req.params.id; //el id del usuario
  let usersCart; //el carrito del usuario
  let addProducts; //y el zapato que le vamos a añadir en el array
  try {
    usersCart = await Users.findById(idUser); //buscamos al usuario
    console.log(usersCart);
    addProducts = await Products.findById(req.body.cart);
    console.log(addProducts); //buscamos el id del zapato (se pone req.body.zapato xk es lo que vamos a modificar/o añadir)

    usersCart.cart.push(addProducts); //subimos el id del zapato al array del carrito del usuario

    await usersCart.save(); //lo guuardamos
  } catch (error) {
    res.status(500).json({
      message: `Fail adding the prodcut to the users cart`,
      error: error.message,
    });
    return next(error);
  }

  res.status(200).json({
    message: `Product added !!`,
    cart: usersCart, //y ya esta mandado , lo verificamos.
  });
});

//to delete the product from the users cart , by using the users id
router.delete("/:id/cart", async (req, res, next) => {
  let idUser = req.params.id; //buscamos al usuario
  let productId = req.body.id;
  let usersCart;
  let deleteProduct;

  try {
    usersCart = await Users.findById(idUser); //encontramos el usuario
    deleteProduct = await Products.findById(productId); //buscamos en su carrito
    console.log(deleteProduct);

    usersCart.cart.pull(deleteProduct); // eliminiamos el id del zapato de su carrito
    await usersCart.save(); // guardarmos su carrito
  } catch (error) {
    console.log(error);
    res.status(500).json({
      message: `Error cant delete the product from the cart`,
      error: error.message,
    });
    return next(error);
  }
  res.status(200).json({
    message: `Product deleted from the users cart`,
    cart: usersCart, //mostramos el usuario con todos sus datos y lo que tiene en el carrito
  });
});

module.exports = router;
