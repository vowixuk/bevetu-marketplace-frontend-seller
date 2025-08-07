import axios from "axios";
import { IMainServices } from "../interfaces/main-service.interface";
import { todoReturn } from "../fixtures/modules/main.fixtures";

export const mainServices: IMainServices = {
  baseUrl:
    process.env.REACT_APP_MAIN_SERVICES_ENDPOINT || "http://localhost:3000",
  useFixtues: process.env.REACT_APP_USE_FIXTURES === "true" ? true : false,

  config(option, contentType = "application/json") {
    let headers = {
      "Content-Type": contentType,
    };
    if (option) {
      headers = {
        ...headers,
        ...(option.accessToken
          ? { Authorization: `Bearer ${option.accessToken}` }
          : {}),
        ...(option.csrfToken ? { "x-csrf-token": option.csrfToken } : {}),
        ...(option.refreshToken
          ? { "x-refresh-token": option.refreshToken }
          : {}),
      };
    }

    return {
      headers,
      withCredentials: true,
    };
  },


  body(payload) {
    // Extract accessToken, csrfToken, refreshToken in body.
    // They will be handle in config() above
    const { accessToken, csrfToken, refreshToken, ..._payload } = payload;
    return _payload;
  },

  auth: {


    // POST  https://main.bevetu.com/v1/auth/google-mock
    loginWithGoogleMock: async function (payload) {
      return mainServices.useFixtues
        ? await todoReturn
        : await axios.post(
            `${mainServices.baseUrl}/v1/auth/google-mock`,
            mainServices.body(payload),
            mainServices.config()
          );
    },

    // GET  https://main.bevetu.com/v1/auth/check-session
    checkSession: async function (payload) {
      return mainServices.useFixtues
        ? await todoReturn
        : await axios.get(
            `${mainServices.baseUrl}/v1/auth/check-session`,
            mainServices.config(payload)
          );
    },

    // POST  https://main.bevetu.com/v1/auth/logout
    logout: async function (payload) {
      return mainServices.useFixtues
        ? await todoReturn
        : await axios.post(
            `${mainServices.baseUrl}/v1/auth/logout`,
            {},
            mainServices.config(payload)
          );
    },
  },

  user: {
    // GET  https://main.bevetu.com/v1/users/me
    viewProfile: async function (payload) {
      return mainServices.useFixtues
        ? await todoReturn
        : await axios.get(
          `${mainServices.baseUrl}/v1/users/me`,
          mainServices.config(payload)
        );
    },
  },

};