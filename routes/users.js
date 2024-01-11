const express = require("express");
const router = express.Router();
const Joi = require("joi");
const { db } = require("../services/db.js");
const { getUserJwt } = require("../services/auth.js");
const bcrypt = require("bcrypt");

// GET /users/signin
router.get("/signin", function (req, res, next) {
  res.render("users/signin", { result: { display_form: true } });
});

// SCHEMA signin
const schema_signin = Joi.object({
  email: Joi.string().email().max(50).required(),
  password: Joi.string().min(3).max(50).required()
});

// POST /users/signin
router.post("/signin", function (req, res, next) {
  // do validation
  const result = schema_signin.validate(req.body);
  if (result.error) {
    res.render("users/signin", { result: { validation_error: true, display_form: true } });
    return;
  }

  const email = req.body.email;
  //const password = req.body.password;
  const password = req.body.password;

  const passwordHash = bcrypt.hashSync(req.body.password, 10);

  const stmt = db.prepare("SELECT * FROM users WHERE email = ?");
  const dbResult = stmt.get(email);
  console.log("DB RESULT", dbResult);
  if (dbResult) {

    const passwordHash = dbResult.password;
    const compareResult = bcrypt.compareSync(password, passwordHash);
    if (!compareResult) {
      res.render("users/signin", { result: { invalid_credentials: true } });
      console.log(compareResult);
      return;
    }
    const token = getUserJwt(dbResult.id, dbResult.email, dbResult.name, dbResult.role);
    console.log("NEW TOKEN", token);
    res.cookie("auth", token);
    //stvaramo json web token
    //spremamo JWT u cookie
    //preusmjeravamo korisnika na uspješan rezulat
    res.render("users/signin", { result: { success: true } });

  } else {
    res.render("users/signin", { result: { invalid_credentials: true } });
  }

});

// SCHEMA signup
const schema_signup = Joi.object({
  name: Joi.string().min(3).max(50).required(),
  email: Joi.string().email().max(50).required(),
  password: Joi.string().min(3).max(50).required(),
  password_check: Joi.ref("password")
});

// GET /users/signin
router.get("/signup", function (req, res, next) {
  res.render("users/signup", { result: { display_form: true } });
});

// POST /users/signup
router.post("/signup", function (req, res, next) {
  // do validation
  const result = schema_signup.validate(req.body);
  console.log(req.body);
  if (result.error) {
    console.log(result.error);
    res.render("users/signup", { result: { validation_error: true, display_form: true } });
    return;
  }

  const stmt1 = db.prepare("SELECT * FROM users WHERE email = ?");
  const selectResult = stmt1.get(req.body.email);
  if(selectResult) {
  res.render("users/signup", { result: { email_in_use: true, display_form: true } });
  return;

  }
  

  const passwordHash = bcrypt.hashSync(req.body.password, 10);

  const stmt2 = db.prepare("INSERT INTO users (email, password, name, signed_at, role) VALUES (?, ?, ?, ?, ?);");
  const insert_result = stmt2.run(req.body.email, passwordHash, req.body.name, Date.now(), "user");


  console.log("RES", insert_result);

  if (insert_result.changes && insert_result.changes === 1) {

    res.render("users/signup", { result: { success: true } });

  } else {
    res.render("users/signup", { result: { database_error: true } });

    return;
  }

});

router.post("/signup", function (req, res, next) {
  res.render("users/signup", { result: { display_form: true } });
});

module.exports = router;
