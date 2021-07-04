export default function logout() {
  localStorage.removeItem("name");
  localStorage.removeItem("email");
  localStorage.removeItem("role");
  localStorage.removeItem("userToken");
}
