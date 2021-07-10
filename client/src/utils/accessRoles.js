import userRoles from "./userRoles";

export default {
  "/register": [userRoles.SUPERADMIN, userRoles.ADMIN],
  "/apartments": [userRoles.SUPERADMIN, userRoles.ADMIN],
  "/buildings": [userRoles.SUPERADMIN, userRoles.ADMIN],
  "/bills": [userRoles.SUPERADMIN, userRoles.ADMIN],
  "/documents": [userRoles.SUPERADMIN, userRoles.ADMIN],
  "/contact": [userRoles.NORMAL],
};
