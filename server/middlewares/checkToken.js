const jwt = require("jsonwebtoken");
const { secrets } = require("../config");

module.exports = function (req, res, next) {
  const token = req.header("x-auth-token");

  if (!token) res.status(401).json({ msg: "User is not authenticated" });

  try {
    const decoded = jwt.verify(token, secrets.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(400).json({ msg: "Invalid authentication" });
  }
};
