// packages
const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cryptoRandomString = require("crypto-random-string");
const { checkToken } = require("../middlewares");
const {
  serverConfig,
  usersConfig,
  nodemailerTransporter,
  secrets,
} = require("../config");

// express router
const router = express.Router();

// validators
const {
  validateActivateUserInput,
  validateLoginInput,
  validateRegisterInput,
} = require("../validators");

// schemas
const { Users } = require("../schemas");

// @route GET /auth/validate-user/:token
// @desc validate that token is assigned to an existing and blocked user
// @access Public
router.get("/validate-user/:token", async (req, res) => {
  const { token } = req.params;

  // Check required params
  if (!token) {
    return res.status(400).json({ msg: "Token is required" });
  }

  try {
    const user = await Users.findOne({ activationToken: token, blocked: true });

    if (!user) {
      return res.status(400).json({ msg: "Invalid Token" });
    }

    res.status(200).json({ isValid: true });
  } catch (e) {
    res.status(500).json({ msg: e });
  }
});

// @route POST /auth/login
// @desc login and create token for a user
// @access Public
router.post("/login", async (req, res) => {
  const data = req.body;
  // Form validation
  const { errors, isValid } = validateLoginInput(data);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const { email, password } = data;

  try {
    const user = await Users.findOne({ email });

    if (!user) {
      return res.status(400).json({
        email: "Invalid email or password",
        password: "Invalid email or password",
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(400).json({
        email: "Invalid email or password",
        password: "Invalid email or password",
      });
    }

    const jwtToken = await jwt.sign(
      {
        id: user._id,
        email,
        role: user.role,
      },
      secrets.JWT_SECRET,
      {
        expiresIn: serverConfig.TOKEN_EXPIRY_TIME,
      }
    );

    res.status(200).json({
      name: user.name,
      email,
      role: user.role,
      userToken: jwtToken,
    });
  } catch (e) {
    console.error(`${serverConfig.LOGGER_PREFIX}[LOGIN] ${e}`);
    res.status(500).json({ msg: e });
  }
});

// @route POST /auth/activate-user/:token
// @desc activate an account and setting the new password
// @access Public
router.post("/activate-user/:token", async (req, res) => {
  const { token } = req.params;
  const data = req.body;

  // Check validation
  if (!token) {
    return res.status(400).json({ msg: "Token is required" });
  }

  // Form validation
  const { errors, isValid } = validateActivateUserInput(data);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const { activationPin, password } = data;

  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);

    const user = await Users.findOneAndUpdate(
      { activationPin, activationToken: token, blocked: true },
      {
        $set: { password: hash },
        $unset: { activationPin: "", activationToken: "", blocked: "" },
      }
    );

    if (!user) {
      return res.status(400).json({ msg: "Invalid user" });
    }

    const jwtToken = await jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      secrets.JWT_SECRET,
      {
        expiresIn: serverConfig.TOKEN_EXPIRY_TIME,
      }
    );

    res.status(200).json({
      name: user.name,
      email: user.email,
      role: user.role,
      userToken: jwtToken,
    });
  } catch (e) {
    console.error(`${serverConfig.LOGGER_PREFIX}[LOGIN] ${e}`);
    res.status(500).json({ msg: e });
  }
});

// @route POST /auth/register
// @desc register and create token for a user
// @access Private [specific]
router.post("/register", checkToken, async (req, res) => {
  const requestingUser = req.user;
  const data = req.body;

  // Check requesting user role
  if (
    !requestingUser.role ||
    !usersConfig.CAN_CREATE_ROLES[requestingUser.role] ||
    usersConfig.CAN_CREATE_ROLES[requestingUser.role].length <= 0
  ) {
    return res.status(403).json({ msg: "User doesn't have enough rights" });
  }

  // Form validation
  const { errors, isValid } = validateRegisterInput(data);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const {
    name,
    email,
    role = usersConfig.CAN_CREATE_ROLES[requestingUser.role][0],
  } = data;

  try {
    const user = await Users.findOne({ email });

    if (user) {
      return res.status(400).json({ email: "This email is already in use" });
    }

    // User details
    const activationToken = cryptoRandomString({
      length: 20,
      type: "alphanumeric",
    });
    const activationPin = cryptoRandomString({ length: 6, type: "numeric" });

    // Create user
    await Users.create({
      name,
      email,
      activationToken,
      activationPin,
      role,
      blocked: true,
    });

    // Send email
    const message = {
      from: requestingUser.email,
      to: "mihaivoinica@gmail.com",
      subject: "[test email] Licenta",
      html: `<h1>Utilizator [nume: ${name}] [email: ${email}] [rol: ${role}] a fost creat</h1><br/><p>Pentru activarea lui accesati urmatorul <a href="http://localhost:3000/activate-user/${activationToken}">link</a>.</p><p>Apoi introduceti PIN-ul format din 6 cifre <b>${activationPin}</b> si noua dvs parola.</p>`,
    };
    await nodemailerTransporter.sendMail(message);

    res.status(200).json({
      name,
      email,
      role,
    });
  } catch (e) {
    console.error(`${serverConfig.LOGGER_PREFIX}[REGISTER] ${e}`);
    res.status(500).json({ msg: e });
  }
});

module.exports = router;
