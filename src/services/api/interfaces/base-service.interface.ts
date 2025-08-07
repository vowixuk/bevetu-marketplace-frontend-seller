export interface IBasePayload {
  accessToken?: string;
  refreshToken?: string;
  csrfToken?: string;
}

type ConfigOption = IBasePayload;

/**
 * The base interface that is impletmented by other serivce interfaces
 * @example interface IMainServices extends IBaseService {...}"
 */
export interface IBaseService {
  /**
   * Use dummy data or not
   */
  useFixtues: boolean;

  /**
   * The backend server url
   */
  baseUrl: string;

  /**
   *  To form header configutration when emitting an api
   */
  config(
    option?: ConfigOption | null,
    contentType?: string
  ): {
    headers: {
      "Content-Type": string;
      "x-csrf-token"?: string;
      "x-refresh-token"?: string;
      Authorization?: string;
    };
    withCredentials: boolean;
  };

  /**
   *  To remove access token, refresh token and csrf token from payload.
   *  Enusre the body is free of those token when sending to backend
   */
  body(payload: any): any;
}

