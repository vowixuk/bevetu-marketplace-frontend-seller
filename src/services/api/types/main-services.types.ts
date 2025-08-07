import { IBasePayload } from "../interfaces/base-service.interface";

/* ***********************************
 * ---- Auth module type group ----
 ************************************/
export namespace Authentication {
  /**
   * POST  https://main.bevetu.com/v1/auth/google-mock
   */
  export interface ILoginWithGooglePayload {
    idToken: string;
  }
  export interface ILoginWithGoogleReturn {
    message: string;
    givenName: string;
    familyName: string;
    email: string;
    isNewUser: boolean;
    picture: string | null;
  }

  /**
   * GET  https://main.bevetu.com/v1/auth/check-session
   */
  export interface ICheckSessionPayload extends IBasePayload {}
  export interface ICheckSessionReturn {
    givenName: string;
    familyName: string;
    email: string;
  }

  /**
   * POST  https://main.bevetu.com/v1/auth/logout
   */
  export interface ILogoutPayload extends IBasePayload {}
  export interface ILogoutReturn {
    message: string;
  }
}

/* ***********************************
 * ---- User module type group ----
 * ***********************************/
export namespace User {
  /**
   * GET  https://main.bevetu.com/v1/users/me
   */
  export interface IViewMyProfilePayload extends IBasePayload {}
  export interface IPetGeneralInfo {
    id: string;
    name: string;
    picture: string | null;
    url: string;
    status: "ACTIVE" | "INACTIVE";
  }
  export interface IViewProfileReturn {
    email: string;
    familyName: string;
    givenName: string;
    picture: string | null;
    pets: IPetGeneralInfo[];
  }
}
