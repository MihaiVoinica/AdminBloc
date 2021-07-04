import userRoles from "./userRoles";

export default {
  "/register": [userRoles.SUPER_ADMIN, userRoles.ADMIN],
};
