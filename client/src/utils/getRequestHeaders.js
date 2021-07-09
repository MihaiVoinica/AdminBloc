import getUserToken from "./getUserToken";

export default function getRequestHeaders(params) {
  return Object.assign(
    {
      headers: {
        "X-Auth-Token": getUserToken(),
        "Content-Type": "application/json",
      },
    },
    params && { params }
  );
}
