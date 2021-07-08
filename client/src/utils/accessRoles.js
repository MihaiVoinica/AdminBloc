import userRoles from "./userRoles";

export default {
  "/register": [userRoles.SUPERADMIN, userRoles.ADMIN],
};
