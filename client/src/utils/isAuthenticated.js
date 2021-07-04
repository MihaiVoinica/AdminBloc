import { getValueWithoutExpiry, isExpired } from "./expiryHelpers";
import logout from "./logout";

export default function isAuthenticated() {
  const name = localStorage.getItem("name");
  const email = localStorage.getItem("email");
  const role = localStorage.getItem("role");
  const userToken = localStorage.getItem("userToken");

  if (!name || !email || !role || !userToken) {
    return false;
  }

  if (!getValueWithoutExpiry(userToken)) {
    return false;
  }

  if (isExpired(userToken)) {
    logout();
    return false;
  }

  return true;
}
