const disableRegistrationEnv = import.meta.env.VITE_DISABLE_REGISTRATION;

let disableRegistration =
  disableRegistrationEnv !== "true" && disableRegistrationEnv !== "false"
    ? false
    : disableRegistrationEnv === "true";

export const config = {
  serverBaseUrl: import.meta.env.VITE_SERVER_BASE_URL,
  disableRegistration,
};
