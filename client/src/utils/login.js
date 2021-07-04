import { setValueWithExpiry } from "./expiryHelpers";

export default function login({ name, email, role, userToken }) {
  const currentDatetime = new Date();
  const processValue = setValueWithExpiry.bind(null, currentDatetime);

  localStorage.setItem("name", processValue(name));
  localStorage.setItem("email", processValue(email));
  localStorage.setItem("role", processValue(role));
  localStorage.setItem("userToken", processValue(userToken));
}
