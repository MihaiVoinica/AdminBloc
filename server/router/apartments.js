// packages
const express = require("express");
const { checkToken } = require("../middlewares");
const { usersConfig } = require("../config");

// express router
const router = express.Router();

// validators
const {
  validateCreateApartmentInput,
  validateUpdateApartmentInput,
  validateAssignOwnerInput,
  validateRemoveOwnerInput,
  validateCreateMeterInput,
  validateUpdateMeterInput,
  validateRemoveMeterInput,
} = require("../validators");

// schemas
const { Apartments, Buildings, Users } = require("../schemas");

// roles
const { NORMAL, ADMIN, SUPERADMIN } = usersConfig.ROLES;

// @route GET /apartments/list
// @desc
// @access Private [SUPERADMIN, ADMIN, NORMAL]
router.get("/list", checkToken, async (req, res) => {
  const userAccess = [SUPERADMIN, ADMIN, NORMAL];
  const requestingUser = req.user || {};
  const requestingUserId = requestingUser.id;
  const requestingUserRole = requestingUser.role;
  const requestingUserEmail = requestingUser.email;

  // Check requesting user role
  if (
    !requestingUserId ||
    !requestingUserRole ||
    !requestingUserEmail ||
    !userAccess.includes(requestingUserRole)
  ) {
    return res.status(403).json({ msg: "User doesn't have enough rights" });
  }

  try {
    let apartments = null;
    if (requestingUserRole === NORMAL) {
      apartments = await Apartments.find({
        userId: requestingUserId,
        active: true,
      });
    } else if (requestingUserRole === ADMIN) {
      const buildingsIds = (
        await Buildings.find({
          userId: requestingUserId,
          active: true,
        })
      ).map((_id) => _id);

      apartments = await Apartments.find({
        buildingId: { $in: buildingsIds },
        active: true,
      });
    } else {
      apartments = await Apartments.find({
        active: true,
      });
    }

    const buildingsHash = {};
    const buildingsIds = [];
    const usersHash = {};
    const usersIds = [];

    apartments.forEach(({ buildingId, userId }) => {
      buildingsIds.push(buildingId);
      usersIds.push(userId);
    });
    const [users, buildings] = await Promise.all([
      Users.find({ _id: { $in: usersIds }, role: NORMAL, active: true }),
      Buildings.find({
        _id: { $in: buildingsIds },
        active: true,
      }),
    ]);
    users.forEach(({ _id, email }) => {
      usersHash[_id] = email;
    });
    buildings.forEach(({ _id, name }) => {
      buildingsHash[_id] = name;
    });

    res.status(200).json(
      apartments.map((apartment) => ({
        ...apartment.toObject(),
        userName: usersHash[apartment.userId],
        buildingName: buildingsHash[apartment.buildingId],
      }))
    );
  } catch (e) {
    console.log("[/apartments/list] ERROR:", e);
    res.status(500).json(e);
  }
});

// @route GET /apartments/get
// @desc
// @access Private [SUPERADMIN, ADMIN, NORMAL]
router.get("/get", checkToken, async (req, res) => {
  const userAccess = [SUPERADMIN, ADMIN, NORMAL];
  const requestingUser = req.user || {};
  const requestingUserId = requestingUser.id;
  const requestingUserRole = requestingUser.role;
  const requestingUserEmail = requestingUser.email;
  const data = req.query;

  // Check requesting user role
  if (
    !requestingUserId ||
    !requestingUserRole ||
    !requestingUserEmail ||
    !userAccess.includes(requestingUserRole)
  ) {
    return res.status(403).json({ msg: "User doesn't have enough rights" });
  }

  const { id } = data;

  if (!id) {
    return res.status(400).json({ msg: "Id is required" });
  }

  try {
    let apartment = null;
    let user = null;
    if (requestingUserRole === NORMAL) {
      apartment = await Apartments.findOne({
        _id: id,
        userId: requestingUserId,
        active: true,
      });
    } else if (requestingUserRole === ADMIN) {
      apartment = await Apartments.findOne({
        _id: id,
        active: true,
      });

      const building = await Buildings.findOne({
        _id: apartment.buildingId,
        userId: requestingUserId,
        active: true,
      });

      if (!building) {
        return res.status(400).json({ msg: "Invalid Building" });
      }
    } else {
      apartment = await Apartments.findOne({
        _id: id,
        active: true,
      });
    }

    if (!apartment) {
      return res.status(400).json({ msg: "Invalid Apartment" });
    }

    if (apartment.userId) {
      user = await Users.findOne({
        _id: apartment.userId,
        role: NORMAL,
        active: true,
      });

      if (!user) {
        return res.status(400).json({ msg: "Invalid User" });
      }

      Object.assign(apartment, { userEmail: user.email });
    }

    res
      .status(200)
      .json(
        Object.assign(apartment.toObject(), user && { userEmail: user.email })
      );
  } catch (e) {
    console.log("[/apartments/get] ERROR:", e);
    res.status(500).json(e);
  }
});

// @route POST /apartments/create
// @desc
// @access Private [SUPERADMIN, ADMIN]
router.post("/create", checkToken, async (req, res) => {
  const userAccess = [SUPERADMIN, ADMIN];
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
  const { errors, isValid } = validateCreateApartmentInput(data);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const {
    buildingId,
    name,
    number,
    peopleCount,
    totalArea,
    radiantArea,
    share,
    thermalProvider,
    userEmail,
  } = data;

  try {
    const createObj = {
      buildingId,
      name,
      number,
      peopleCount,
      totalArea,
      radiantArea,
      share,
      thermalProvider,
    };

    if (userEmail) {
      const user = await Users.findOne({
        email: userEmail,
        role: NORMAL,
        active: true,
      });

      if (!user) {
        return res.status(400).json({ userEmail: "Invalid Email" });
      }

      Object.assign(createObj, { userId: user._id });
    }

    let building = null;
    if (requestingUserRole === ADMIN) {
      building = await Buildings.findOne({
        _id: buildingId,
        active: true,
        userId: requestingUserId,
      });
    } else {
      building = await Buildings.findOne({
        _id: buildingId,
        active: true,
      });
    }

    if (!building) {
      return res.status(400).json({ msg: "Invalid Building" });
    }

    const apartment = await Apartments.create(createObj);

    res.status(200).json(apartment);
  } catch (e) {
    console.log("[/apartments/create] ERROR:", e);
    res.status(500).json(e);
  }
});

// @route POST /apartments/update/:apartmentId
// @desc
// @access Private [SUPERADMIN, ADMIN]
router.post("/update/:apartmentId", checkToken, async (req, res) => {
  const userAccess = [SUPERADMIN, ADMIN];
  const { apartmentId } = req.params;
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
  const { errors, isValid } = validateUpdateApartmentInput(data);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const {
    buildingId,
    name,
    number,
    peopleCount,
    totalArea,
    radiantArea,
    share,
    thermalProvider,
    userEmail,
  } = data;

  try {
    const updateObj = {
      buildingId,
      name,
      number,
      peopleCount,
      totalArea,
      radiantArea,
      share,
      thermalProvider,
    };

    if (userEmail) {
      const user = await Users.findOne({
        email: userEmail,
        role: NORMAL,
        active: true,
      });

      if (!user) {
        return res.status(400).json({ userEmail: "Invalid Email" });
      }

      Object.assign(updateObj, { userId: user._id });
    }

    let building = null;
    if (requestingUserRole === ADMIN) {
      building = await Buildings.findOne({
        _id: buildingId,
        userId: requestingUserId,
        active: true,
      });
    } else {
      building = await Buildings.findOne({
        _id: buildingId,
        active: true,
      });
    }

    if (!building) {
      return res.status(400).json({ msg: "Invalid Building" });
    }

    const apartment = await Apartments.findOneAndUpdate(
      { _id: apartmentId, active: true },
      updateObj,
      { new: true }
    );

    res.status(200).json(apartment);
  } catch (e) {
    console.log("[/apartments/update] ERROR:", e);
    res.status(500).json(e);
  }
});

// @route PATCH /apartments/remove/:apartmentId
// @desc
// @access Private [SUPERADMIN, ADMIN]
router.patch("/remove/:apartmentId", checkToken, async (req, res) => {
  const userAccess = [SUPERADMIN, ADMIN];
  const requestingUser = req.user || {};
  const requestingUserId = requestingUser.id;
  const requestingUserRole = requestingUser.role;
  const { apartmentId } = req.params;

  // Check requesting user role
  if (
    !requestingUserRole ||
    !requestingUserId ||
    !userAccess.includes(requestingUserRole)
  ) {
    return res.status(403).json({ msg: "User doesn't have enough rights" });
  }

  try {
    const apartment = await Apartments.findOne({
      _id: apartmentId,
      active: true,
    });

    if (requestingUserRole === ADMIN) {
      const building = await Buildings.findOne({
        _id: apartment.buildingId,
        userId: requestingUserId,
        active: true,
      });

      if (!building) {
        return res.status(400).json({ msg: "Invalid Building" });
      }
    } else {
      const building = await Buildings.findOne({
        _id: apartment.buildingId,
        active: true,
      });

      if (!building) {
        return res.status(400).json({ msg: "Invalid Building" });
      }
    }

    const newApartment = await Apartments.findOneAndUpdate(
      { _id: apartmentId, active: true },
      { active: false },
      { new: true }
    );

    res.status(200).json(newApartment);
  } catch (e) {
    console.log("[/apartments/remove] ERROR:", e);
    res.status(500).json(e);
  }
});

// @route PATCH /apartments/assign-owner/:apartmentId
// @desc
// @access Private [SUPERADMIN, ADMIN]
router.patch("/assign-owner/:apartmentId", checkToken, async (req, res) => {
  const userAccess = [SUPERADMIN, ADMIN];
  const requestingUserRole = (req.user || {}).role;
  const { apartmentId } = req.params;
  const data = req.body;

  // Check required params
  if (!apartmentId) {
    return res.status(400).json({ msg: "ApartmentId is required" });
  }

  // Check requesting user role
  if (!requestingUserRole || !userAccess.includes(requestingUserRole)) {
    return res.status(403).json({ msg: "User doesn't have enough rights" });
  }

  // Form validation
  const { errors, isValid } = validateAssignOwnerInput(data);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const { email } = data;

  try {
    // TODO: find building before create
    // TODO: check requesting user has rights on the specific building

    const [user, apartment] = await Promise.all([
      Users.findOne({ email, active: true }),
      Apartments.findOne({
        _id: apartmentId,
        active: true,
      }),
    ]);

    if (!user) {
      return res.status(400).json({ msg: "Invalid User" });
    }

    if (!apartment) {
      return res.status(400).json({ msg: "Invalid Apartment" });
    }

    if (apartment.userId) {
      return res.status(400).json({
        msg:
          "Owner already assigned, remove the current one before trying to add another.",
      });
    }

    const newApartment = await Apartments.findOneAndUpdate(
      { _id: apartmentId, active: true },
      { $set: { userId: user._id }, $pull: { pastUserIds: user._id } },
      { new: true }
    );

    res.status(200).json(newApartment);
  } catch (e) {
    console.log("[/apartments/assign-owner/:apartmentId] ERROR:", e);
    res.status(500).json(e);
  }
});

// @route PATCH /apartments/remove-owner/:apartmentId
// @desc
// @access Private [SUPERADMIN, ADMIN]
router.patch("/remove-owner/:apartmentId", checkToken, async (req, res) => {
  const userAccess = [SUPERADMIN, ADMIN];
  const requestingUserRole = (req.user || {}).role;
  const { apartmentId } = req.params;
  const data = req.body;

  // Check required params
  if (!apartmentId) {
    return res.status(400).json({ msg: "ApartmentId is required" });
  }

  // Check requesting user role
  if (!requestingUserRole || !userAccess.includes(requestingUserRole)) {
    return res.status(403).json({ msg: "User doesn't have enough rights" });
  }

  // Form validation
  const { errors, isValid } = validateRemoveOwnerInput(data);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const { email } = data;

  try {
    // TODO: find building before create
    // TODO: check requesting user has rights on the specific building

    const user = await Users.findOne({ email, active: true });

    if (!user) {
      return res.status(400).json({ msg: "Invalid Email" });
    }

    const apartment = await Apartments.findOneAndUpdate(
      { _id: apartmentId, userId: user._id, active: true },
      { $unset: { userId: "" }, $addToSet: { pastUserIds: user._id } },
      { new: true }
    );

    if (!apartment) {
      return res.status(400).json({ msg: "Invalid Apartment" });
    }

    res.status(200).json(apartment);
  } catch (e) {
    console.log("[/apartments/remove-owner/:apartmentId] ERROR:", e);
    res.status(500).json(e);
  }
});

// @route GET /apartments/list-bills
// @desc
// @access Private [SUPERADMIN, ADMIN, NORMAL]
router.get("/list-bills", checkToken, async (req, res) => {
  const userAccess = [SUPERADMIN, ADMIN, NORMAL];
  const requestingUser = req.user || {};
  const requestingUserId = requestingUser.id;
  const requestingUserRole = requestingUser.role;
  const requestingUserEmail = requestingUser.email;
  const data = req.query;

  // Check requesting user role
  if (
    !requestingUserId ||
    !requestingUserRole ||
    !requestingUserEmail ||
    !userAccess.includes(requestingUserRole)
  ) {
    return res.status(403).json({ msg: "User doesn't have enough rights" });
  }

  const { apartmentId } = data;

  try {
    let apartments = null;
    if (requestingUserRole === NORMAL) {
      apartments = await Apartments.find(
        Object.assign(
          {
            userId: requestingUserId,
            active: true,
          },
          apartmentId && {
            _id: apartmentId,
          }
        )
      );
    } else if (requestingUserRole === ADMIN) {
      const buildingsIds = (
        await Buildings.find({
          userId: requestingUserId,
          active: true,
        })
      ).map((_id) => _id);

      apartments = await Apartments.find(
        Object.assign(
          {
            buildingId: { $in: buildingsIds },
            active: true,
          },
          apartmentId && {
            _id: apartmentId,
          }
        )
      );
    } else {
      apartments = await Apartments.find(
        Object.assign(
          {
            active: true,
          },
          apartmentId && {
            _id: apartmentId,
          }
        )
      );
    }

    const buildingsHash = {};
    const buildingsIds = apartments.map(({ buildingId }) => buildingId);
    const buildings = await Buildings.find({
      _id: { $in: buildingsIds },
      active: true,
    });

    buildings.forEach(({ _id, name }) => {
      buildingsHash[_id] = name;
    });

    const bills = [];

    apartments.forEach((apartment) => {
      const {
        _id: apartmentId,
        name: apartmentName,
        bills: apartmentBills,
      } = apartment;
      const buildingName = buildingsHash[apartment.buildingId];

      apartmentBills.forEach((bill) => {
        if (bill.active) {
          bills.push({
            ...bill.toObject(),
            apartmentId,
            apartmentName,
            buildingId: apartment.buildingId,
            buildingName,
          });
        }
      });
    });

    res.status(200).json(bills);
  } catch (e) {
    console.log("[/apartments/list-bills] ERROR:", e);
    res.status(500).json(e);
  }
});

// @route GET /apartments/list-meters
// @desc
// @access Private [SUPERADMIN, ADMIN, NORMAL]
router.get("/list-meters", checkToken, async (req, res) => {
  const userAccess = [SUPERADMIN, ADMIN, NORMAL];
  const requestingUser = req.user || {};
  const requestingUserId = requestingUser.id;
  const requestingUserRole = requestingUser.role;
  const requestingUserEmail = requestingUser.email;
  const data = req.query;

  // Check requesting user role
  if (
    !requestingUserId ||
    !requestingUserRole ||
    !requestingUserEmail ||
    !userAccess.includes(requestingUserRole)
  ) {
    return res.status(403).json({ msg: "User doesn't have enough rights" });
  }

  const { apartmentId, buildingId } = data;

  try {
    let apartments = null;
    if (requestingUserRole === NORMAL) {
      apartments = await Apartments.find(
        Object.assign(
          {
            userId: requestingUserId,
            active: true,
          },
          buildingId && { buildingId },
          apartmentId && {
            _id: apartmentId,
          }
        )
      );
    } else if (requestingUserRole === ADMIN) {
      const buildingsIds = (
        await Buildings.find(
          Object.assign(
            {
              userId: requestingUserId,
              active: true,
            },
            buildingId && {
              _id: buildingId,
            }
          )
        )
      ).map((_id) => _id);

      apartments = await Apartments.find(
        Object.assign(
          {
            buildingId: { $in: buildingsIds },
            active: true,
          },
          apartmentId && {
            _id: apartmentId,
          }
        )
      );
    } else {
      apartments = await Apartments.find(
        Object.assign(
          {
            active: true,
          },
          buildingId && { buildingId },
          apartmentId && {
            _id: apartmentId,
          }
        )
      );
    }

    const buildingsHash = {};
    const buildingsIds = apartments.map(({ buildingId }) => buildingId);
    const buildings = await Buildings.find({
      _id: { $in: buildingsIds },
      active: true,
    });

    buildings.forEach(({ _id, name }) => {
      buildingsHash[_id] = name;
    });

    const meters = [];

    apartments.forEach((apartment) => {
      const {
        _id: apartmentId,
        name: apartmentName,
        meters: apartmentMeters,
      } = apartment;
      const buildingName = buildingsHash[apartment.buildingId];

      apartmentMeters.forEach((meter) => {
        if (meter.active) {
          meters.push({
            ...meter.toObject(),
            apartmentId,
            apartmentName,
            buildingName,
          });
        }
      });
    });

    res.status(200).json(meters);
  } catch (e) {
    console.log("[/apartments/list-meters] ERROR:", e);
    res.status(500).json(e);
  }
});

// @route GET /apartments/get-meter/:apartmentId
// @desc
// @access Private [SUPERADMIN, ADMIN, NORMAL]
router.get("/get-meter/:apartmentId", checkToken, async (req, res) => {
  const userAccess = [SUPERADMIN, ADMIN, NORMAL];
  const requestingUser = req.user || {};
  const requestingUserId = requestingUser.id;
  const requestingUserRole = requestingUser.role;
  const requestingUserEmail = requestingUser.email;
  const { apartmentId } = req.params;
  const data = req.query;

  // Check requesting user role
  if (
    !requestingUserId ||
    !requestingUserRole ||
    !requestingUserEmail ||
    !userAccess.includes(requestingUserRole)
  ) {
    return res.status(403).json({ msg: "User doesn't have enough rights" });
  }

  const { id } = data;

  if (!id) {
    return res.status(400).json({ msg: "Id field is required" });
  }

  try {
    let apartment = null;

    if (requestingUserRole === NORMAL) {
      apartment = await Apartments.findOne({
        _id: apartmentId,
        userId: requestingUserId,
        active: true,
      });
    } else if (requestingUserRole === ADMIN) {
      apartment = await Apartments.findOne({
        _id: apartmentId,
        active: true,
      });

      const building = await Buildings.findOne({
        _id: apartment.buildingId,
        userId: requestingUserId,
        active: true,
      });

      if (!building) {
        return res.status(400).json({ msg: "Invalid Building" });
      }
    } else {
      apartment = await Apartments.findOne({
        _id: apartmentId,
        active: true,
      });
    }

    if (!apartment) {
      return res.status(400).json({ msg: "Invalid Apartment" });
    }

    const { meters = [] } = apartment;

    res
      .status(200)
      .json(meters.find(({ _id, active }) => _id.equals(id) && active));
  } catch (e) {
    console.log("[/apartments/get-meter/:apartmentId] ERROR:", e);
    res.status(500).json(e);
  }
});

// @route PATCH /apartments/create-meter/:apartmentId
// @desc
// @access Private [SUPERADMIN, ADMIN, NORMAL]
router.patch("/create-meter/:apartmentId", checkToken, async (req, res) => {
  const userAccess = [SUPERADMIN, ADMIN, NORMAL];
  const requestingUser = req.user || {};
  const requestingUserId = requestingUser.id;
  const requestingUserRole = requestingUser.role;
  const requestingUserEmail = requestingUser.email;
  const { apartmentId } = req.params;
  const data = req.body;

  // Check requesting user role
  if (
    !requestingUserId ||
    !requestingUserRole ||
    !requestingUserEmail ||
    !userAccess.includes(requestingUserRole)
  ) {
    return res.status(403).json({ msg: "User doesn't have enough rights" });
  }

  // Form validation
  const { errors, isValid } = validateCreateMeterInput(data);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const { name } = data;

  try {
    let apartment = null;

    if (requestingUserRole === NORMAL) {
      apartment = await Apartments.findOne({
        _id: apartmentId,
        userId: requestingUserId,
        active: true,
      });
    } else if (requestingUserRole === ADMIN) {
      apartment = await Apartments.findOne({
        _id: apartmentId,
        active: true,
      });

      const building = await Buildings.findOne({
        _id: apartment.buildingId,
        userId: requestingUserId,
        active: true,
      });

      if (!building) {
        return res.status(400).json({ msg: "Invalid Building" });
      }
    } else {
      apartment = await Apartments.findOne({
        _id: apartmentId,
        active: true,
      });
    }

    if (!apartment) {
      return res.status(400).json({ msg: "Invalid Apartment" });
    }

    const newApartment = await Apartments.findOneAndUpdate(
      { _id: apartmentId, active: true },
      { $push: { meters: { name } } },
      { new: true }
    );

    res.status(200).json(newApartment);
  } catch (e) {
    console.log("[/apartments/create-meter/:apartmentId] ERROR:", e);
    res.status(500).json(e);
  }
});

// @route PATCH /apartments/update-meter/:apartmentId
// @desc
// @access Private [SUPERADMIN, ADMIN, NORMAL]
router.patch("/update-meter/:apartmentId", checkToken, async (req, res) => {
  const userAccess = [SUPERADMIN, ADMIN, NORMAL];
  const requestingUser = req.user || {};
  const requestingUserId = requestingUser.id;
  const requestingUserRole = requestingUser.role;
  const requestingUserEmail = requestingUser.email;
  const { apartmentId } = req.params;
  const data = req.body;

  // Check requesting user role
  if (
    !requestingUserId ||
    !requestingUserRole ||
    !requestingUserEmail ||
    !userAccess.includes(requestingUserRole)
  ) {
    return res.status(403).json({ msg: "User doesn't have enough rights" });
  }

  // Form validation
  const { errors, isValid } = validateUpdateMeterInput(data);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const { id, name, value } = data;

  try {
    let apartment = null;

    if (requestingUserRole === NORMAL) {
      apartment = await Apartments.findOne({
        _id: apartmentId,
        userId: requestingUserId,
        active: true,
      });
    } else if (requestingUserRole === ADMIN) {
      apartment = await Apartments.findOne({
        _id: apartmentId,
        active: true,
      });

      const building = await Buildings.findOne({
        _id: apartment.buildingId,
        userId: requestingUserId,
        active: true,
      });

      if (!building) {
        return res.status(400).json({ msg: "Invalid Building" });
      }
    } else {
      apartment = await Apartments.findOne({
        _id: apartmentId,
        active: true,
      });
    }

    if (!apartment) {
      return res.status(400).json({ msg: "Invalid Apartment" });
    }

    const meterIndex = apartment.meters.findIndex(
      ({ _id, active }) => _id.equals(id) && active
    );

    if (meterIndex < 0) {
      return res.status(400).json({ msg: "Invalid Meter" });
    }

    const currentMeterDetails = apartment.meters[meterIndex];
    const { prevValue } = currentMeterDetails;

    if (value < prevValue) {
      return res.status(400).json({ msg: "Invalid Value" });
    }

    const newApartment = await Apartments.findOneAndUpdate(
      { _id: apartmentId, active: true },
      {
        $set: {
          [`meters.${meterIndex}.name`]: name,
          [`meters.${meterIndex}.value`]: value,
          [`meters.${meterIndex}.consumption`]: value - prevValue,
        },
      },
      { new: true }
    );

    res.status(200).json(newApartment);
  } catch (e) {
    console.log("[/apartments/update-meter/:apartmentId] ERROR:", e);
    res.status(500).json(e);
  }
});

// @route PATCH /apartments/remove-meter/:apartmentId
// @desc
// @access Private [SUPERADMIN, ADMIN]
router.patch("/remove-meter/:apartmentId", checkToken, async (req, res) => {
  const userAccess = [SUPERADMIN, ADMIN];
  const { apartmentId } = req.params;
  const requestingUser = req.user || {};
  const requestingUserId = requestingUser.id;
  const requestingUserRole = requestingUser.role;
  const data = req.body;

  // Check requesting user role
  if (
    !requestingUserRole ||
    !requestingUserId ||
    !userAccess.includes(requestingUserRole)
  ) {
    return res.status(403).json({ msg: "User doesn't have enough rights" });
  }

  // Form validation
  const { errors, isValid } = validateRemoveMeterInput(data);

  // Check validation
  if (!isValid) {
    return res.status(400).json(errors);
  }

  const { id } = data;

  try {
    const apartment = await Apartments.findOne({
      _id: apartmentId,
      active: true,
    });

    if (requestingUserRole === ADMIN) {
      const building = await Buildings.findOne({
        _id: apartment.buildingId,
        userId: requestingUserId,
        active: true,
      });

      if (!building) {
        return res.status(400).json({ msg: "Invalid Building" });
      }
    } else {
      const building = await Buildings.findOne({
        _id: apartment.buildingId,
        active: true,
      });

      if (!building) {
        return res.status(400).json({ msg: "Invalid Building" });
      }
    }

    const meterIndex = apartment.meters.findIndex(
      ({ _id, active }) => _id.equals(id) && active
    );

    if (meterIndex < 0) {
      return res.status(400).json({ msg: "Invalid Meter" });
    }

    await Apartments.findOneAndUpdate(
      { _id: apartmentId, active: true },
      { $set: { [`meters.${meterIndex}.active`]: false } },
      { new: true }
    );

    res.status(200).json(apartment.meters[meterIndex]);
  } catch (e) {
    console.log("[/apartments/remove-meter/:apartmentId] ERROR:", e);
    res.status(500).json(e);
  }
});

module.exports = router;
