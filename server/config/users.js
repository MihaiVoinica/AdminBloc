const ROLES = {
  SUPER_ADMIN: "superadmin",
  ADMIN: "admin",
  NORMAL: "normal",
};

const CAN_CREATE_ROLES = {
  [ROLES.SUPER_ADMIN]: ROLES.ADMIN,
  [ROLES.ADMIN]: ROLES.NORMAL,
};

module.exports = {
  ROLES,
  CAN_CREATE_ROLES,
};
