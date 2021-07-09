// packages
const express = require("express");
const { checkToken } = require("../middlewares");
const { usersConfig } = require("../config");

// express router
const router = express.Router();

// validators
const {} = require("../validators");

// schemas
const { Apartments, Buildings, Tickets } = require("../schemas");

// roles
const { NORMAL, ADMIN, SUPERADMIN } = usersConfig.ROLES;

// @route GET /tickets/get
// @desc
// @access Private [SUPERADMIN, ADMIN]
router.get("/get", checkToken, async (req, res) => {
  const userAccess = [SUPERADMIN, ADMIN];
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
    const building = await Buildings.findOne({
      _id: buildingId,
      userId: requestingUserId,
      active: true,
    });

    if (!building) {
      return res.status(400).json({ msg: "Invalid Building" });
    }

    const tickets = await Tickets.find({
      buildingId,
      active: true,
    });

    res.status(200).json(tickets);
  } catch (e) {
    console.log("[/tickets/get] ERROR:", e);
    res.status(500).json(e);
  }
});

// @route POST /tickets/create
// @desc
// @access Private [SUPERADMIN, ADMIN, NORMAL]
router.post("/create", checkToken, async (req, res) => {
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

  const { apartmentId, name, comment } = data;

  try {
    const createObj = { userId: requestingUserId, apartmentId, name, comment };

    if (requestingUserRole === NORMAL) {
      const apartment = await Apartments.findOne({
        _id: apartmentId,
        userId: requestingUserId,
        active: true,
      });

      if (!apartment || !apartment.buildingId) {
        return res.status(400).json({ msg: "Invalid Apartment" });
      }

      Object.assign(createObj, { buildingId: apartment.buildingId });
    } else if (requestingUserRole === ADMIN) {
      const apartment = await Apartments.findOne({
        _id: apartmentId,
        active: true,
      });

      if (!apartment || !apartment.buildingId) {
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

      Object.assign(createObj, { buildingId: apartment.buildingId });
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

    const building = await Buildings.findOne({
      _id: ticket.buildingId,
      userId: requestingUserId,
      active: true,
    });

    if (!building) {
      return res.status(400).json({ msg: "Invalid Building" });
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

    const building = await Buildings.findOne({
      _id: ticket.buildingId,
      userId: requestingUserId,
      active: true,
    });

    if (!building) {
      return res.status(400).json({ msg: "Invalid Building" });
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
// @access Private [SUPERADMIN, ADMIN]
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

      if (!apartment || !apartment.buildingId) {
        return res.status(400).json({ msg: "Invalid Apartment" });
      }

      const building = await Buildings.findOne({
        _id: ticket.buildingId,
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
