import { AxiosHeaders, AxiosResponse } from "axios";

function constructAxiosResponse(data: any, status: number) {
  return {
    data,
    status,
    statusText: "OK",
    headers: {
      "content-type": "application/json",
      "x-api-key": "mocked-api-key",
    },
    config: {
      url: "https://main.bevetu.com",
      method: "post",
      headers: new AxiosHeaders({
        Authorization: "Bearer mock-token",
        "Content-Type": "application/json",
      }),
      data: {
        token: "mock-google-token",
      },
      timeout: 5000,
    },
    request: {
      responseURL: "https://main.bevetu.com",
    },
  };
}


export const todoReturn: Promise<AxiosResponse<any>> =
  Promise.resolve(
    constructAxiosResponse(
      {
        message: "Mock Data still under construction",
      },
      200
    )
  );
