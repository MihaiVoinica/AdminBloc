const ROLES = {
  SUPERADMIN: "superadmin",
  ADMIN: "admin",
  NORMAL: "normal",
};

const CAN_CREATE_ROLES = {
  [ROLES.SUPERADMIN]: [ROLES.ADMIN, ROLES.ADMIN.SUPERADMIN],
  [ROLES.ADMIN]: [ROLES.NORMAL],
};

module.exports = {
  ROLES,
  CAN_CREATE_ROLES,
};
