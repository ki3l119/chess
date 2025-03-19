import axios, { AxiosError } from "axios";

import { config } from "@/config";
import { ServiceException } from "./service.exception";
import { UserService } from "./user.service";
import { GameService } from "./game.service";

const axiosInstance = axios.create({
  baseURL: config.serverBaseUrl,
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
export const gameService = new GameService(axiosInstance);
export { ServiceException };
