// packages
const express = require("express");
const { checkToken } = require("../middlewares");
const { usersConfig } = require("../config");

// express router
const router = express.Router();

// validators
const { validateCreateTicketInput } = require("../validators");

// schemas
const { Apartments, Buildings, Tickets } = require("../schemas");

// roles
const { NORMAL, ADMIN, SUPERADMIN } = usersConfig.ROLES;

// @route GET /tickets/list
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
    let tickets = null;
    let apartments = null;
    let buildings = null;
    if (requestingUserRole === NORMAL) {
      apartments = await Apartments.find({
        userId: requestingUserId,
        active: true,
      });
      const buildingsIds = apartments.map(({ buildingId }) => buildingId);
      buildings = await Buildings.find({
        _id: { $in: buildingsIds },
        active: true,
      });
      const apartmentsIds = apartments.map(({ _id }) => _id);

      tickets = await Tickets.find({
        apartmentId: { $in: apartmentsIds },
        active: true,
      });
    } else if (requestingUserRole === ADMIN) {
      buildings = await Buildings.find({
        userId: requestingUserId,
        active: true,
      });
      const buildingsIds = buildings.map(({ _id }) => _id);
      apartments = await Apartments.find({
        buildingId: { $in: buildingsIds },
        active: true,
      });
      const apartmentsIds = apartments.map(({ _id }) => _id);

      tickets = await Tickets.find({
        apartmentId: { $in: apartmentsIds },
        active: true,
      });
    } else {
      tickets = await Tickets.find({
        active: true,
      });
      const apartmentsIds = tickets.map(({ apartmentId }) => apartmentId);
      apartments = await Apartments.find({
        _id: { $in: apartmentsIds },
        active: true,
      });
      const buildingsIds = apartments.map(({ buildingId }) => buildingId);
      buildings = await Buildings.find({
        _id: { $in: buildingsIds },
        active: true,
      });
    }

    if (!tickets) {
      return res.status(400).json({ msg: "Invalid Ticket" });
    }

    if (!apartments) {
      return res.status(400).json({ msg: "Invalid Apartment" });
    }

    if (!buildings) {
      return res.status(400).json({ msg: "Invalid Building" });
    }

    const apartmentsHash = {};
    const buildingsHash = {};

    apartments.forEach(({ _id, name, buildingId }) => {
      apartmentsHash[_id] = { name, buildingId };
    });

    buildings.forEach(({ _id, name }) => {
      buildingsHash[_id] = name;
    });

    res.status(200).json(
      tickets.map((ticket) => ({
        ...ticket.toObject(),
        apartmentName: apartmentsHash[ticket.apartmentId].name,
        buildingName:
          buildingsHash[apartmentsHash[ticket.apartmentId].buildingId],
      }))
    );
  } catch (e) {
    console.log("[/tickets/list] ERROR:", e);
    res.status(500).json(e);
  }
});

// @route POST /tickets/create
// @desc
// @access Private [NORMAL]
router.post("/create", checkToken, async (req, res) => {
  const userAccess = [NORMAL];
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

  const { apartmentId, name, comment } = data;

  try {
    const createObj = { userId: requestingUserId, apartmentId, name, comment };

    const apartment = await Apartments.findOne({
      _id: apartmentId,
      userId: requestingUserId,
      active: true,
    });

    if (!apartment || !apartment.buildingId) {
      return res.status(400).json({ msg: "Invalid Apartment" });
    }

    const ticket = await Tickets.create(createObj);

    res.status(200).json(ticket);
  } catch (e) {
    console.log("[/tickets/create] ERROR:", e);
    res.status(500).json(e);
  }
});

// @route PATCH /tickets/confirm/:ticketId
// @desc
// @access Private [SUPERADMIN, ADMIN]
router.patch("/confirm/:ticketId", checkToken, async (req, res) => {
  const userAccess = [SUPERADMIN, ADMIN];
  const requestingUser = req.user || {};
  const requestingUserId = requestingUser.id;
  const requestingUserRole = requestingUser.role;
  const { ticketId } = req.params;

  // Check requesting user role
  if (
    !requestingUserId ||
    !requestingUserRole ||
    !userAccess.includes(requestingUserRole)
  ) {
    return res.status(403).json({ msg: "User doesn't have enough rights" });
  }

  try {
    const ticket = await Tickets.findOne({
      _id: ticketId,
      active: true,
    });

    if (!ticket) {
      return res.status(400).json({ msg: "Invalid Ticket" });
    }

    if (requestingUserRole === ADMIN) {
      const building = await Buildings.findOne({
        userId: requestingUserId,
        active: true,
      });

      if (!building) {
        return res.status(400).json({ msg: "Invalid Building" });
      }

      const apartment = await Apartments.findOne({
        _id: ticket.apartmentId,
        buildingId: building._id,
        active: true,
      });

      if (!apartment) {
        return res.status(400).json({ msg: "Invalid Apartment" });
      }
    }

    const newTicket = await Tickets.findOneAndUpdate(
      {
        _id: ticketId,
        active: true,
      },
      { status: "confirmed" },
      { new: true }
    );

    res.status(200).json(newTicket);
  } catch (e) {
    console.log("[/tickets/confirm/:ticketId] ERROR:", e);
    res.status(500).json(e);
  }
});

// @route PATCH /tickets/resolve/:ticketId
// @desc
// @access Private [SUPERADMIN, ADMIN]
router.patch("/resolve/:ticketId", checkToken, async (req, res) => {
  const userAccess = [SUPERADMIN, ADMIN];
  const requestingUser = req.user || {};
  const requestingUserId = requestingUser.id;
  const requestingUserRole = requestingUser.role;
  const { ticketId } = req.params;

  // Check requesting user role
  if (
    !requestingUserId ||
    !requestingUserRole ||
    !userAccess.includes(requestingUserRole)
  ) {
    return res.status(403).json({ msg: "User doesn't have enough rights" });
  }

  try {
    const ticket = await Tickets.findOne({
      _id: ticketId,
      active: true,
    });

    if (!ticket) {
      return res.status(400).json({ msg: "Invalid Ticket" });
    }

    if (requestingUserRole === ADMIN) {
      const building = await Buildings.findOne({
        userId: requestingUserId,
        active: true,
      });

      if (!building) {
        return res.status(400).json({ msg: "Invalid Building" });
      }

      const apartment = await Apartments.findOne({
        _id: ticket.apartmentId,
        buildingId: building._id,
        active: true,
      });

      if (!apartment) {
        return res.status(400).json({ msg: "Invalid Apartment" });
      }
    }

    const newTicket = await Tickets.findOneAndUpdate(
      {
        _id: ticketId,
        active: true,
      },
      { status: "resolved" },
      { new: true }
    );

    res.status(200).json(newTicket);
  } catch (e) {
    console.log("[/tickets/resolve/:ticketId] ERROR:", e);
    res.status(500).json(e);
  }
});

// @route PATCH /tickets/resolve/:ticketId
// @desc
// @access Private [SUPERADMIN, ADMIN, NORMAL]
router.patch("/remove/:ticketId", checkToken, async (req, res) => {
  const userAccess = [SUPERADMIN, ADMIN, NORMAL];
  const requestingUser = req.user || {};
  const requestingUserId = requestingUser.id;
  const requestingUserRole = requestingUser.role;
  const { ticketId } = req.params;

  // Check requesting user role
  if (
    !requestingUserId ||
    !requestingUserRole ||
    !userAccess.includes(requestingUserRole)
  ) {
    return res.status(403).json({ msg: "User doesn't have enough rights" });
  }

  try {
    const ticket = await Tickets.findOne({
      _id: ticketId,
      active: true,
    });

    if (!ticket) {
      return res.status(400).json({ msg: "Invalid Ticket" });
    }

    if (requestingUserRole === NORMAL) {
      const apartment = await Apartments.findOne({
        _id: ticket.apartmentId,
        userId: requestingUserId,
        active: true,
      });

      if (!apartment) {
        return res.status(400).json({ msg: "Invalid Apartment" });
      }
    } else if (requestingUserRole === ADMIN) {
      const apartment = await Apartments.findOne({
        _id: ticket.apartmentId,
        active: true,
      });

      if (!apartment) {
        return res.status(400).json({ msg: "Invalid Apartment" });
      }

      const building = await Buildings.findOne({
        _id: apartment.buildingId,
        userId: requestingUserId,
        active: true,
      });

      if (!building) {
        return res.status(400).json({ msg: "Invalid Building" });
      }
    }

    const newTicket = await Tickets.findOneAndUpdate(
      {
        _id: ticketId,
        active: true,
      },
      { active: false },
      { new: true }
    );

    res.status(200).json(newTicket);
  } catch (e) {
    console.log("[/tickets/resolve/:ticketId] ERROR:", e);
    res.status(500).json(e);
  }
});

module.exports = router;
