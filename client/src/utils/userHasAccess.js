import isAuthenticated from "./isAuthenticated";
import { getValueWithoutExpiry } from "./expiryHelpers";

export default function userHasAccess(accessRoles) {
  const isAuth = isAuthenticated();

  if (!isAuth) return false;
  if (!accessRoles || accessRoles.length <= 0) return true;

  const userRole = getValueWithoutExpiry(localStorage.getItem("role"));

  return accessRoles.includes(userRole);
}
