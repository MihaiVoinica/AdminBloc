// packages
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// config
const { serverConfig, usersConfig, secrets } = require("./config");

// routes
const router = require("./router");
// schemas
const { Users } = require("./schemas");

// Server config
const app = express();

// Middlewares
app.use(cors());

// Use to parse JSON requests
app.use(express.json());
app.use(express.urlencoded());

// Database
mongoose
  .connect(secrets.MONGO_URI, { useNewUrlParser: true })
  .then(async () => {
    console.log(`${serverConfig.LOGGER_PREFIX} MongoDB successfully connected`);

    try {
      const users = await Users.find({});
      if (!users || users.length <= 0) {
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(
          secrets.SUPER_ADMIN_DEFAULTS.PASSWORD,
          salt
        );

        const user = await Users.create({
          name: secrets.SUPER_ADMIN_DEFAULTS.NAME,
          email: secrets.SUPER_ADMIN_DEFAULTS.EMAIL,
          password: hash,
          role: usersConfig.ROLES.SUPER_ADMIN,
        });

        console.log(
          `${serverConfig.LOGGER_PREFIX}[CREATE SUPERADMIN] Successfully created {${user._id}}`
        );
      }
    } catch (e) {
      console.log(
        `${serverConfig.LOGGER_PREFIX}[CREATE ERROR] Could NOT create SuperAdmin user`,
        e
      );
    }
  })
  .catch((err) =>
    console.log(`${serverConfig.LOGGER_PREFIX} MongoDB could not connect`)
  );

// Routes
app.use("/auth", router.auth);

// Server init
app.listen(serverConfig.PORT, () => {
  console.log(
    `${serverConfig.LOGGER_PREFIX} Server started at http://localhost:${serverConfig.PORT}`
  );
});

// Server close
function cleanup() {
  console.log(`${serverConfig.LOGGER_PREFIX} Server is shutting down...`);
  process.exit();
}

process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);
