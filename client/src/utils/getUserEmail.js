import { getValueWithoutExpiry, isExpired } from "./expiryHelpers";
import logout from "./logout";

export default function getUserEmail() {
  const email = localStorage.getItem("email");

  if (!email) {
    return null;
  }

  const token = getValueWithoutExpiry(email);

  if (!token) {
    return null;
  }

  if (isExpired(email)) {
    logout();
    return null;
  }

  return token;
}
