import axios, { AxiosError } from "axios";
import { ProblemDetails } from "chess-shared-types";

import { UserService } from "./user.service";

export class ServiceException extends Error {
  constructor(readonly details: ProblemDetails) {
    super(details.title);
  }
}

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_SERVER_BASE_URL,
});

axiosInstance.interceptors.response.use(null, (error) => {
  if (error instanceof AxiosError) {
    const problemDetails = error.response?.data;
    if (problemDetails != undefined) {
      return Promise.reject(
        new ServiceException({
          title: problemDetails.title,
          details: problemDetails.details,
          validationErrors: problemDetails.validationErrors,
        }),
      );
    }
  }
  return Promise.reject(error);
});

export const userService = new UserService(axiosInstance);
