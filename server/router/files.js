// packages
const express = require("express");
const multer = require("multer");
const { checkToken } = require("../middlewares");
const { usersConfig } = require("../config");

// express router
const router = express.Router();

// validators
const {} = require("../validators");

// schemas
const { Apartments, Buildings, Files } = require("../schemas");

// roles
const { NORMAL, ADMIN, SUPERADMIN } = usersConfig.ROLES;

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `${file.fieldname}-${Date.now()}.${ext}`);
  },
});

//Calling the "multer" Function
const upload = multer({
  storage: multerStorage,
});

// @route GET /files/list
// @desc
// @access Private [SUPERADMIN, ADMIN, NORMAL]
router.get("/list", checkToken, async (req, res) => {
  const userAccess = [SUPERADMIN, ADMIN, NORMAL];
  const requestingUser = req.user || {};
  const requestingUserId = requestingUser.id;
  const requestingUserRole = requestingUser.role;
  const data = req.query;

  // Check requesting user role
  if (
    !requestingUserId ||
    !requestingUserRole ||
    !userAccess.includes(requestingUserRole)
  ) {
    return res.status(403).json({ msg: "User doesn't have enough rights" });
  }

  // Form validation
  const { errors, isValid } = validateCreateApartmentInput(data);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const { id } = data;

  try {
    const homeworks = await Homework.find({ teacherId, courseId });
    const studentsSet = new Set(homeworks.map(({ studentId }) => studentId));
    const students = await User.find(
      { _id: { $in: [...studentsSet] }, role: USER_ROLE_STUDENT },
      { _id: 1, name: 1, year: 1 }
    );
    const studentsHash = {};

    students.forEach(({ _id, name, year }) => {
      studentsHash[_id] = { name, year };
    });
    console.log(homeworks, studentsSet, students, studentsHash);

    return res.status(200).json(
      homeworks.map(
        ({
          _id,
          studentId,
          teacherId,
          courseId,
          originalname,
          path,
          date,
        }) => ({
          _id,
          studentId,
          teacherId,
          courseId,
          originalname,
          path,
          date,
          student: studentsHash[studentId],
        })
      )
    );
  } catch (e) {
    console.log("[/files/list] ERROR:", e);
    return res.status(400).json(e);
  }
});

// @route GET /files/download
// @desc
// @access Private [SUPERADMIN, ADMIN, NORMAL]
router.get("/download", checkToken, async (req, res) => {
  const userAccess = [SUPERADMIN, ADMIN, NORMAL];
  const requestingUser = req.user || {};
  const requestingUserId = requestingUser.id;
  const requestingUserRole = requestingUser.role;
  const data = req.body;

  // Check requesting user role
  if (
    !requestingUserId ||
    !requestingUserRole ||
    !userAccess.includes(requestingUserRole)
  ) {
    return res.status(403).json({ msg: "User doesn't have enough rights" });
  }

  // Form validation
  const { errors, isValid } = validateCreateTicketInput(data);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const { id } = data;

  try {
    const file = await Files.findOne({
      _id: id,
      active: true,
    });

    if (!file) {
      return res.status(400).json({ msg: "Invalid Ticket" });
    }

    if (requestingUserRole === NORMAL) {
      const apartment = await Apartments.findOne({
        buildingId: file.buildingId,
        userId: requestingUserId,
        active: true,
      });

      if (!apartment) {
        return res.status(400).json({ msg: "Invalid Apartment" });
      }
    } else if (requestingUserRole === ADMIN) {
      const building = await Buildings.findOne({
        _id: file.buildingId,
        userId: requestingUserId,
        active: true,
      });

      if (!building) {
        return res.status(400).json({ msg: "Invalid Building" });
      }
    }

    const { path, originalname } = file;

    res.download(path, originalname);
  } catch (e) {
    console.log("[/files/download] ERROR:", e);
    return res.status(400).json(e);
  }
});

// @route POST /files/create
// @desc
// @access Private [SUPERADMIN, ADMIN]
router.post(
  "/create",
  [checkToken, upload.single("files")],
  async (req, res) => {
    const userAccess = [SUPERADMIN, ADMIN];
    const requestingUser = req.user || {};
    const requestingUserId = requestingUser.id;
    const requestingUserRole = requestingUser.role;
    const data = req.body;
    const file = req.file;

    // Check requesting user role
    if (
      !requestingUserId ||
      !requestingUserRole ||
      !userAccess.includes(requestingUserRole)
    ) {
      return res.status(403).json({ msg: "User doesn't have enough rights" });
    }

    // Form validation
    const { errors, isValid } = validateCreateTicketInput(data);

    // Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    const { buildingId, name } = data;
    const { originalname, path } = file;

    try {
      const building = await Buildings.findOne({
        _id: buildingId,
        userId: requestingUserId,
        active: true,
      });

      if (!building) {
        return res.status(400).json({ msg: "Invalid Building" });
      }

      const result = await Files.create({
        buildingId,
        name,
        originalname,
        path,
      });

      return res.status(200).json(result);
    } catch (e) {
      console.log("[/files/create] ERROR:", e);
      return res.status(400).json(e);
    }
  }
);

module.exports = router;
