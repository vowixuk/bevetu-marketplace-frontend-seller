import { AxiosResponse } from "axios";
import {
  Authentication,
  User,
} from "../types/main-services.types";
import { IBaseService } from "./base-service.interface";

export interface IMainServices extends IBaseService {
  auth: {
    /**
     * POST  https://main.bevetu.com/v1/auth/google-mock
     */
    loginWithGoogleMock(
      payload: Authentication.ILoginWithGooglePayload
    ): Promise<AxiosResponse<Authentication.ILoginWithGoogleReturn>>;

    /**
     * GET  https://main.bevetu.com/v1/auth/check-session
     */
    checkSession(
      payload: Authentication.ICheckSessionPayload
    ): Promise<AxiosResponse<Authentication.ICheckSessionReturn>>;

    /**
     * POST  https://main.bevetu.com/v1/auth/logout
     */
    logout(
      payload: Authentication.ILogoutPayload
    ): Promise<AxiosResponse<Authentication.ILogoutReturn>>;
  };

  user: {
    /**
     * GET  https://main.bevetu.com/v1/users/me
     */
    viewProfile(
      payload: User.IViewMyProfilePayload
    ): Promise<AxiosResponse<User.IViewProfileReturn>>;

  };
}


