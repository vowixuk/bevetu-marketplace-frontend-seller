export {};

// /**
//  *  Run it solely :
//  *  jest src/services/api/test/main-services/user.services.test.ts
//  */

// import { expect } from "@jest/globals";
// import path from 'path';
// import  {services} from '../../..'
// import { Authentication, User } from '../../types/main-services.types';
// import { deleteUser, userLogin } from './helper';
// import * as fs from 'fs';
// import axios from 'axios';

// describe("user", () => {

//   let accessToken: string = "";
//   let refreshToken: string = "";
//   let csrfToken: string = "";

//   let uploadImagePreSignedUrl: string = "";
//   let user_testing_pic_folder_path = '../testing_data/user_profile_pictures';
//   let uploadedFileName = "";

//   beforeAll(async () => {
//     const tokens = await userLogin()
//     accessToken = tokens.accessToken as string;;
//     refreshToken = tokens.refreshToken as string;;
//     csrfToken = tokens.csrfToken as string;;
//   });

//   afterAll(async () => {
//     await deleteUser({
//       accessToken,
//       csrfToken,
//     });
//   });

//   // GET  https://main.bevetu.com/v1/users/me
//   describe("viewProfile()", () => {

//     it("test 1 - should view the user profile", async () => {
//       const payload: Authentication.ILogoutPayload = {
//           accessToken,
//           csrfToken
//       };
//       const response = await services.api.main.user.viewProfile(payload);
//       csrfToken = response.headers["x-csrf-token"] as string;
//       const result = response.data
//       expect(result.email).toBe("testingUser@bevetu.com");
//       expect(result.familyName).toBeDefined()
//       expect(result.givenName).toBeDefined();
//       expect(result.picture).toBeDefined();
//       expect(result.subscription).toBeNull()
//       expect(result.pets).toEqual([]);
//     })

//     it("test 2 - should not be able to view the user profile if csrfToken not valid", async () => {
//       const payload: Authentication.ILogoutPayload = {
//         accessToken,
//         csrfToken:'123123',
//       };

//       await expect(
//         services.api.main.user.viewProfile(payload)
//       ).rejects.toMatchObject({
//         response: {
//           status: 403,
//           data: {
//             message: "Invalid CSRF token"
//           },
//         },
//       });

//     });
//   });

//   // PATCH  https://main.bevetu.com/v1/users/
//   describe("update()", () => {
//     it("test 3 - should update user name", async () => {

//         await services.api.main.user.update({
//           accessToken,
//           csrfToken,
//           familyName: "Wong",
//           givenName: "Wilson",
//           picture: "123.pic",
//         });

//         const response = await services.api.main.user.viewProfile({
//           accessToken,
//           csrfToken,
//         });

//         csrfToken = response.headers["x-csrf-token"] as string;
//         const result = response.data;
//         expect(result.familyName).toBe("Wong");
//         expect(result.givenName).toBe("Wilson");
//         expect(result.picture).toBe("123.pic");
//     });

//     it("test 4 - should picture url remain if update other user data", async () => {
//       await services.api.main.user.update({
//         accessToken,
//         csrfToken,
//         givenName:'Katharine'
//       });

//       const response = await services.api.main.user.viewProfile({
//         accessToken,
//         csrfToken,
//       });

//       csrfToken = response.headers["x-csrf-token"] as string;
//       const result = response.data;
//       expect(result.familyName).toBe("Wong");
//       expect(result.givenName).toBe("Katharine");
//       expect(result.picture).toBe("123.pic");
//     });
//   });

//   // GET  https://main.bevetu.com/v1/users/profile-picture-upload-url
//   describe("getUploadProfilePicturePresignedUrl()", () => {
//     it("test 5 - should return a presigned upload url", async () => {
//       const payload: User.IGetUploadProfilePicturePresignedUrlPayload = {
//         accessToken,
//         csrfToken,
//         fileName: "user01.jpg",
//       };
//       const response =
//         await services.api.main.user.getUploadProfilePicturePresignedUrl(
//           payload
//         );
//       csrfToken = response.headers["x-csrf-token"] as string;

//       const result = response.data;
//       uploadImagePreSignedUrl = result.url;
//       const startsWithBaseUrl = uploadImagePreSignedUrl.startsWith(
//         process.env.REACT_APP_STORAGE_ENDPOINT as string
//       );
//       expect(result.url).toBeDefined();
//       expect(startsWithBaseUrl).toBe(true);
//     });

//     it("test 6 - should upload the picture to storage via presigned url", async () => {
//       const pathToImages = path.join(
//         __dirname,
//         user_testing_pic_folder_path,
//         "user01.jpg"
//       );

//       const fileStream = fs.createReadStream(pathToImages);
//       const fileStats = fs.statSync(pathToImages);

//       const response = await axios.put(uploadImagePreSignedUrl, fileStream, {
//         headers: {
//           ...(process.env.REACT_APP_STORAGE_RPOVIDER === "azure"
//             ? { "x-ms-blob-type": "BlockBlob" }
//             : {}),
//           "Content-Type": "image/jpeg",
//           "Content-Length": fileStats.size,
//         },
//       });
//       const parsedUrl = new URL(response.config.url as string);
//       const pathname = parsedUrl.pathname;
//       uploadedFileName = pathname!.split("/")!.pop()!.split("?")[0];
//       expect(response.status).toBe(200);
//     });

//     it("test 7 - should update the picture value in user", async () => {
//        await services.api.main.user.update({
//          accessToken,
//          csrfToken,
//          picture: uploadedFileName,
//        });

//        const response = await services.api.main.user.viewProfile({
//          accessToken,
//          csrfToken,
//        });

//        csrfToken = response.headers["x-csrf-token"] as string;
//        const result = response.data;
//        expect(result.picture).toBe(uploadedFileName);

//     });

//     it("test 8 - should keep the picture if update other field", async () => {
//       await services.api.main.user.update({
//         accessToken,
//         csrfToken,
//         familyName: 'hahaha'
//       });

//       const response = await services.api.main.user.viewProfile({
//         accessToken,
//         csrfToken,
//       });

//       csrfToken = response.headers["x-csrf-token"] as string;
//       const result = response.data;
//       console.log(result)
//       expect(result.picture).toBe(uploadedFileName);
//     });

//     it("test 9 - should remiove the picture if set it as null", async () => {
//       await services.api.main.user.update({
//         accessToken,
//         csrfToken,
//         picture: null
//       });

//       const response = await services.api.main.user.viewProfile({
//         accessToken,
//         csrfToken,
//       });

//       csrfToken = response.headers["x-csrf-token"] as string;
//       const result = response.data
//       expect(result.picture).toBeNull()
//     });
//   });
// });
