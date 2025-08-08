export {};

// /**
//  *  Run it solely :
//  *  jest src/services/api/test/main-services/auth.services.test.ts
//  */

// import  {services} from '../../..'
// import { Authentication} from '../../types/main-services.types';
// import { deleteUser } from './helper';

//   describe('auth', () => {

//     let accessToken: string = "";
//     let refreshToken: string = "";
//     let csrfToken: string = "";

//     beforeEach(async () => {});

//     afterAll(async () => {

//       try {
//          const payload: Authentication.ILogoutPayload = {
//            refreshToken,
//          };
//         await services.api.main.auth.logout(payload);
//         console.log("Logout successful ");
//       } catch (error) {
//         console.log("Error in logout ");
//       }

//         await deleteUser({
//           accessToken,
//           csrfToken,
//         });
//     });

//     // POST  https://main.bevetu.com/v1/auth/google
//     describe.skip("loginWithGoogle()", () => {
//       it("test 1 - Should return 401 if tokeid not match", async () => {
//         await expect(
//           services.api.main.auth.loginWithGoogle({
//             idToken: "wrong-token-id",
//           })
//         ).rejects.toMatchObject({
//           response: {
//             status: 401,
//             data: {
//               message:
//                 "Error: Wrong number of segments in token: wrong-token-id",
//             },
//           },
//         });
//       });
//     });

//     // POST  https://main.bevetu.com/v1/auth/google-mock
//     describe("loginWithGoogleMock()", () => {
//       it("test 2 - Should return 401 if tokeid not match", async () => {
//         await expect(
//           services.api.main.auth.loginWithGoogleMock({
//             idToken: "wrong-token-id",
//           })
//         ).rejects.toMatchObject({
//           response: {
//             status: 401,
//             data: {
//               message:
//                 "Error: Wrong number of segments in token: wrong-token-id",
//             },
//           },
//         });
//       });

//       it("test 3 - Should access token, refresh token and csrf token set after authentication", async () => {
//         const response = await services.api.main.auth.loginWithGoogleMock({
//           idToken: "4242-4242-4242-4242",
//         });
//         expect(response.status).toBe(200);
//         const cookies = response.headers["set-cookie"] as string[];
//         const _accessToken = cookies.find((cookie) =>
//           cookie.startsWith("BVT_SID")
//         ) as string;
//         const _refreshToken = cookies.find((cookie) =>
//           cookie.startsWith("BVT_REFRESH")
//         ) as string;

//         accessToken = _accessToken.match(/BVT_SID=([^;]+)/)?.[1] as string;
//         refreshToken = _refreshToken.match(
//           /BVT_REFRESH=([^;]+)/
//         )?.[1] as string;
//         csrfToken = response.headers["x-csrf-token"] as string;

//         expect(csrfToken).toBeTruthy();
//         expect(_accessToken).toContain("HttpOnly");
//         expect(_accessToken).toContain("SameSite=Strict");
//         expect(accessToken).toBeTruthy();

//         expect(refreshToken).toBeTruthy();
//         expect(_refreshToken).toContain("HttpOnly");
//         expect(_refreshToken).toContain("SameSite=Strict");
//       });
//     });

//     // GET  https://main.bevetu.com/v1/auth/check-session
//     describe("checkSession()", () => {

//       it("test 4 - Should return `No access token found` if access token not sent", async () => {
//         const payload: Authentication.ICheckSessionPayload = {
//           csrfToken,
//           //   accessToken: "adfasdfadf",
//         };

//         await expect(
//           services.api.main.auth.checkSession(payload)
//         ).rejects.toMatchObject({
//           response: {
//             status: 401,
//             data: {
//               message: "No access token found",
//             },
//           },
//         });
//       });

//       it("test 5 - Should return `Attemp to refresh the expired access token but no refresh token found` if access token not valid and refresh token not sent", async () => {
//         const payload: Authentication.ICheckSessionPayload = {
//           csrfToken,
//           accessToken: "adfasdfadf",
//         };

//         await expect(
//           services.api.main.auth.checkSession(payload)
//         ).rejects.toMatchObject({
//           response: {
//             status: 401,
//             data: {
//               message:
//                 "Attemp to refresh the expired access token but no refresh token found.",
//             },
//           },
//         });
//       });

//       it.skip("test 6 - Should return `Invalid CSRF token` if csrf token not valid", async () => {
//         /**
//          * updated on 4 Feb 2025
//          *  - v1/auth/check-session is excluded in CSRF checking
//          */

//         const payload: Authentication.ICheckSessionPayload = {
//           csrfToken: "adfasdfadf",
//           accessToken,
//         };

//         await expect(
//           services.api.main.auth.checkSession(payload)
//         ).rejects.toMatchObject({
//           response: {
//             status: 403,
//             data: {
//               message: "Invalid CSRF token",
//             },
//           },
//         });
//       });

//       it("test 7 - Should return user basic information", async () => {
//         const payload: Authentication.ICheckSessionPayload = {
//           csrfToken,
//           accessToken,
//         };

//         const response = await services.api.main.auth.checkSession(payload);
//         csrfToken = response.headers["x-csrf-token"] as string;
//         const result = response.data;
//         expect(result.familyName).toBe("Lam");
//         expect(result.givenName).toBe("Herman");
//         expect(result.email).toBe("testingUser@bevetu.com");
//       });
//     });

//     // POST  https://main.bevetu.com/v1/auth/logout
//     describe("logout()", () => {

//       it("test 8 - Should logout (Process in AfterAll())", async () => {
//         const payload: Authentication.ILogoutPayload = {
//           refreshToken,
//         };
//         const response = await services.api.main.auth.logout(payload);

//         const result = response.data;
//         expect(result).toEqual({ message: "Logout successful" });
//       });
//     });
//   });
