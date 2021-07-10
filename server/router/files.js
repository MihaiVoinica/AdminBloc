// packages
const express = require("express");
const multer = require("multer");
const { checkToken } = require("../middlewares");
const { usersConfig } = require("../config");

// express router
const router = express.Router();

// validators
const { validateCreateFileInput } = require("../validators");

// schemas
const { Apartments, Buildings, Files, Users } = require("../schemas");

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

  const { buildingId } = data;

  try {
    let files = null;
    if (requestingUserRole === NORMAL) {
      if (!buildingId) {
        const buildingsIdsSet = new Set(
          (
            await Apartments.find({
              userId: requestingUserId,
              active: true,
            })
          ).map(({ buildingId }) => buildingId)
        );
        files = await Files.find({
          buildingId: { $in: [...buildingsIdsSet] },
          active: true,
        });
      } else {
        const apartment = await Apartments.findOne({
          buildingId,
          userId: requestingUserId,
          active: true,
        });

        if (!apartment) {
          return res.status(400).json({ msg: "Invalid Apartment/Building" });
        }

        files = await Files.find({
          buildingId,
          active: true,
        });
      }
    } else if (requestingUserRole === ADMIN) {
      if (!buildingId) {
        const buildingsIds = (
          await Buildings.find({
            userId: requestingUserId,
            active: true,
          })
        ).map((_id) => _id);

        files = await Files.find({
          buildingId: { $in: buildingsIds },
          active: true,
        });
      } else {
        const building = await Buildings.findOne({
          buildingId,
          userId: requestingUserId,
          active: true,
        });

        if (!building) {
          return res.status(400).json({ msg: "Invalid Building" });
        }

        files = await Files.find({
          buildingId,
          active: true,
        });
      }
    } else {
      files = await Files.find(
        Object.assign(
          {
            active: true,
          },
          buildingId && { buildingId }
        )
      );
    }

    const usersIdsSet = new Set();
    const usersHash = {};
    const buildingsIdsSet = new Set();
    const buildingsHash = {};

    files.forEach(({ buildingId, userId }) => {
      usersIdsSet.add(userId);
      buildingsIdsSet.add(buildingId);
    });

    const [users, buildings] = await Promise.all([
      Users.find({ _id: { $in: [...usersIdsSet] } }),
      Buildings.find({ _id: { $in: [...buildingsIdsSet] } }),
    ]);

    users.forEach(({ _id, email }) => {
      usersHash[_id] = email;
    });

    buildings.forEach(({ _id, name }) => {
      buildingsHash[_id] = name;
    });

    res.status(200).json(
      files.map((file) => ({
        ...file.toObject(),
        userEmail: usersHash[file.userId],
        buildingName: buildingsHash[file.buildingId],
      }))
    );
  } catch (e) {
    console.log("[/files/list] ERROR:", e);
    res.status(400).json(e);
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
  const data = req.query;

  // Check requesting user role
  if (
    !requestingUserId ||
    !requestingUserRole ||
    !userAccess.includes(requestingUserRole)
  ) {
    return res.status(403).json({ msg: "User doesn't have enough rights" });
  }

  const { id } = data;

  if (!id) {
    return res.status(400).json({ msg: "Id is required" });
  }

  try {
    const file = await Files.findOne({
      _id: id,
      active: true,
    });

    if (!file) {
      return res.status(400).json({ msg: "Invalid Document" });
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
    res.status(400).json(e);
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
    const { errors, isValid } = validateCreateFileInput(data);

    // Check validation
    if (!isValid) {
      return res.status(400).json(errors);
    }

    const { buildingId, name } = data;
    const { originalname, path } = file;

    try {
      if (requestingUserRole === ADMIN) {
        const building = await Buildings.findOne({
          _id: buildingId,
          userId: requestingUserId,
          active: true,
        });

        if (!building) {
          return res.status(400).json({ msg: "Invalid Building" });
        }
      }

      const result = await Files.create({
        userId: requestingUserId,
        buildingId,
        name,
        originalname,
        path,
      });

      res.status(200).json(result);
    } catch (e) {
      console.log("[/files/create] ERROR:", e);
      res.status(400).json(e);
    }
  }
);
// @route PATCH /files/remove/:fileId
// @desc
// @access Private [SUPERADMIN, ADMIN]
router.patch("/remove/:fileId", checkToken, async (req, res) => {
  const userAccess = [SUPERADMIN, ADMIN];
  const requestingUser = req.user || {};
  const requestingUserId = requestingUser.id;
  const requestingUserRole = requestingUser.role;
  const { fileId } = req.params;

  // Check requesting user role
  if (
    !requestingUserRole ||
    !requestingUserId ||
    !userAccess.includes(requestingUserRole)
  ) {
    return res.status(403).json({ msg: "User doesn't have enough rights" });
  }

  try {
    const file = await Files.findOne({ _id: fileId, active: true });

    if (!file) {
      return res.status(400).json({ msg: "Invalid file" });
    }

    if (requestingUserRole === ADMIN) {
      const building = await Buildings.findOne({
        _id: file.buildingId,
        userId: requestingUserId,
        active: true,
      });

      if (!building) {
        return res.status(400).json({ msg: "Invalid Building" });
      }
    }

    const newFile = await Files.findOneAndUpdate(
      { _id: fileId, active: true },
      { active: false },
      { new: true }
    );

    res.status(200).json(newFile);
  } catch (e) {
    console.log("[/apartments/remove] ERROR:", e);
    res.status(500).json(e);
  }
});

module.exports = router;
