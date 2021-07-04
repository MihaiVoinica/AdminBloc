// WARNING: keep this value in sync with the server value
const TOKEN_EXPIRY_TIME = 3600; // seconds

export const setValueWithExpiry = (currentDatetime, value) =>
  JSON.stringify({
    value,
    expiry: currentDatetime.getTime() + TOKEN_EXPIRY_TIME * 1000, // from seconds to ms
  });

export const getValueWithoutExpiry = (value) => JSON.parse(value).value;

export const isExpired = (value) => {
  const currentDatetime = new Date();
  const currentTime = currentDatetime.getTime();
  const { expiry } = JSON.parse(value);

  return currentTime > expiry;
};
