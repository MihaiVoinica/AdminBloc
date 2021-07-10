import getUserToken from "./getUserToken";

export default function getRequestHeaders(data) {
  const { requestHasFilesFlag, requestDownloadFilesFlag, ...params } =
    data || {};

  return Object.assign(
    {
      headers: Object.assign(
        {
          "X-Auth-Token": getUserToken(),
        },
        requestHasFilesFlag
          ? {
              "Content-Type": "multipart/form-data",
            }
          : {
              "Content-Type": "application/json",
            }
      ),
    },
    data && { params },
    requestDownloadFilesFlag && { responseType: "arraybuffer" }
  );
}
