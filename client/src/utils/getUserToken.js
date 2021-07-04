import { getValueWithoutExpiry, isExpired } from "./expiryHelpers";
import logout from "./logout";

export default function getUserToken() {
  const userToken = localStorage.getItem("userToken");

  if (!userToken) {
    return null;
  }

  const token = getValueWithoutExpiry(userToken);

  if (!token) {
    return null;
  }

  if (isExpired(userToken)) {
    logout();
    return null;
  }

  return token;
}
