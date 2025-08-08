// import { services } from "../../..";
// import { Pet,Document } from "../../types/main-services.types";

// type Tokens = {
//   accessToken?: string;
//   refreshToken?: string;
//   csrfToken?: string;
// };

// export async function userLogin(): Promise<Tokens> {
//     const response = await services.api.main.auth.loginWithGoogleMock({
//     idToken: "4242-4242-4242-4242",
//     });
//     const cookies = response.headers["set-cookie"] as string[];
//     const _accessToken = cookies.find((cookie) =>
//         cookie.startsWith("BVT_SID")
//     ) as string;
//     const _refreshToken = cookies.find((cookie) =>
//         cookie.startsWith("BVT_REFRESH")
//     ) as string;

//     return {
//         accessToken : _accessToken.match(/BVT_SID=([^;]+)/)?.[1] as string,
//         refreshToken : _refreshToken.match(/BVT_REFRESH=([^;]+)/)?.[1] as string,
//         csrfToken : response.headers["x-csrf-token"] as string
//     }
// }



// export async function userLogin_2(): Promise<Tokens> {
//   const response = await services.api.main.auth.loginWithGoogleMock({
//     idToken: "4242-4242-4242-4242",
//   });
//   const cookies = response.headers["set-cookie"] as string[];
//   const _accessToken = cookies.find((cookie) =>
//     cookie.startsWith("BVT_SID")
//   ) as string;
//   const _refreshToken = cookies.find((cookie) =>
//     cookie.startsWith("BVT_REFRESH")
//   ) as string;

//   return {
//     accessToken: _accessToken.match(/BVT_SID=([^;]+)/)?.[1] as string,
//     refreshToken: _refreshToken.match(/BVT_REFRESH=([^;]+)/)?.[1] as string,
//     csrfToken: response.headers["x-csrf-token"] as string,
//   };
// }


// export async function userLogout(tokens: Tokens) {
//       try {
//         await services.api.main.auth.logout({
//           refreshToken: tokens.refreshToken,
//         });
//       } catch (error) {
//         console.log("Error in logout ", error);
//       }
// }

// export async function deleteUser(tokens: Tokens) {
//    try {
//      const response = await services.api.main.user.delete({
//        accessToken: tokens.accessToken,
//        csrfToken: tokens.csrfToken,
//      });
//     if (response.status !== 204) throw new Error(response.data.message);
//    } catch (error) {
//      console.log("Error in logout ", error);
//    }
// }

// export async function deleteStripeCustomer(tokens: Tokens, bevetuSubscriptionId: string) {
//   try {
//     const response = await services.api.main.subscription.deleteStripeCustomer({
//       bevetuSubscriptionId,
//       accessToken: tokens.accessToken,
//       csrfToken: tokens.csrfToken,
//     });
//     if (response.status !== 204) throw new Error(response.data.message);
//   } catch (error) {
//     console.log("AfterAll: error in deleting subscription in Stripe : ", error);
//   }
// }

// export async function enrollFreeSubscription(tokens: Tokens) {
//   const response = await services.api.main.subscription.enrollFreeTrial({

//     accessToken: tokens.accessToken,
//     csrfToken: tokens.csrfToken,
//   });
//   const { id, freeTrialExpiryDate } = response.data;
//   return {
//     id,
//     freeTrialExpiryDate,
//   };
// }


// export async function fetchDataFromDataBaseAndStripeToVerifyTheSubscriptionChange(
//   tokens: Tokens,
//   bevetuSubscriptionId: string
// ) {

//   const { accessToken, csrfToken } = tokens;

//   try {
//     const databaseResponse =
//       await services.api.main.subscription.viewUserRecentSubscription({
//         accessToken,
//         csrfToken,
//       });

//     const bevetuSubscription = databaseResponse.data;
//     const bevetuPaidSubscription = bevetuSubscription;
//     const eventsRecords = bevetuPaidSubscription.eventRecords.sort(
//       (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
//     );

//     const stripeResponse =
//       await services.api.main.subscription.viewStripeSubscription({
//         bevetuSubscriptionId,
//         accessToken,
//         csrfToken,
//       });

//     const stripeSubscription = stripeResponse.data;

//     return {
//       bevetuSubscription,
//       eventsRecords,
//       stripeSubscription,
//     };

//   } catch(error) {
//     console.log(error)
//   }
// }


// export async function errorChecker(fn:()=>any){
//   try{
//     await fn();
//   } catch(e:any) {
//     console.log("errorChecker: status code:", e.status);
//     console.log("errorChecker: status message:", e.response.data);
//   }
// }

// export async function createTestPet_1(tokens: Tokens) {
//   const { accessToken, csrfToken } = tokens;
//   await services.api.main.pet.create({
//     accessToken,
//     csrfToken,
//     category: "CANINE" as Pet.PetCategoryEnum,
//     name: "test pet 1",
//     dob: new Date("2015-11-05"),
//     gender: "F",
//     neuter: false,
//     customBreed: "haha breed",
//     breed: "Iguanasdfasdfsa",
//     color: "back",
//     picture: null,
//     microchipFormat: "AVID",
//     microchipNumber: "111-122-333-444",
//   });
// }


// export async function createTestPet_2(tokens: Tokens) {
//   const { accessToken, csrfToken } = tokens;
//   await services.api.main.pet.create({
//     accessToken,
//     csrfToken,
//     category: "CANINE" as Pet.PetCategoryEnum,
//     name: "test pet 2",
//     dob: new Date("2015-11-05"),
//     gender: "F",
//     neuter: true,
//     breed: "Iguanasdddddfsa",
//     color: "back",
//     picture: null,
//     customBreed: "pasdfjasdf",
//     microchipFormat: "ISO",
//     microchipNumber: "222-333-444-555",
//   });
// }

// export async function createTestPet_3(tokens: Tokens) {
//   const { accessToken, csrfToken } = tokens;
//   return await services.api.main.pet.create({
//     accessToken,
//     csrfToken,
//     category: "CANINE" as Pet.PetCategoryEnum,
//     name: "test pet 3",
//     dob: new Date("2015-11-05"),
//     gender: "F",
//     neuter: true,
//     breed: "Iguanasdddddfsa",
//     color: "back",
//     picture: null,
//     customBreed: "pasdfjasdf",
//     microchipFormat: "ISO",
//     microchipNumber: "222-333-444-555",
//   });
// }

// export async function createTestPet_4(tokens: Tokens) {
//   const { accessToken, csrfToken } = tokens;
//   return await services.api.main.pet.create({
//     accessToken,
//     csrfToken,
//     category: "CANINE" as Pet.PetCategoryEnum,
//     name: "test pet 4",
//     dob: new Date("2015-11-05"),
//     gender: "F",
//     neuter: true,
//     breed: "Iguanasdddddfsa",
//     color: "back",
//     picture: null,
//     customBreed: "pasdfjasdf",
//     microchipFormat: "ISO",
//     microchipNumber: "222-333-444-555",
//   });
// }



// export async function createDummyAiDiagnosisRecord(
//   tokens: Tokens,
//   petId: string
// ){
//   const { accessToken, csrfToken } = tokens;
//   const attributes = dummyCreateData1();
//   return await services.api.main.document.createAiDiagnosisRecord({
//     accessToken,
//     csrfToken,
//     petId,
//     name: '"testing record',
//     date: new Date(),
//     attributes,
//   });
// }

// function dummyCreateData1():Document.IAiDiagnosisRecordAttributes {
//   return {
//     referenceDocumentIds: ["docId1,docId2"],
//     medical_issues: [["Anemia", "HCT", "0.425  L"]],
//     next_steps: [
//       {
//         medical_issue_name: "Iron Deficiency",
//         suggested_next_steps: [
//           ["Increase dietary iron intake", "To replenish iron stores"],
//           ["Take iron supplements", "To correct iron deficiency anemia"],
//           [
//             "Follow up with ferritin test",
//             "To monitor iron levels in 3 months",
//           ],
//         ],
//         prescriptions: [
//           ["Iron Polysaccharide", "150 mg ai diagnosis with vitamin C"],
//           [
//             "B12 Supplement",
//             "1000 mcg ai diagnosis if deficiency is suspected",
//           ],
//         ],
//       },
//     ],
//     physical_examinations: [
//       {
//         medical_issue_name: "Anemia",
//         suggested_examinations: [
//           [
//             "Inspection of skin and mucous membranes",
//             "To check for pallor, jaundice, or cyanosis",
//           ],
//         ],
//         abnormal_findings: []
//       },
//       {
//         medical_issue_name: "Iron Deficiency",
//         suggested_examinations: [
//           [
//             "Tongue examination",
//             "To identify glossitis (swollen, inflamed tongue) seen in iron deficiency",
//           ],
//         ],
//         abnormal_findings: []
//       },
//     ],
//     test_analysis: [
//       {
//         name: "Red Blood Cell (RBC) Count",
//         value: "5.83 x10^12/L",
//         unit: "x10^12/L",
//         reference_range: { min: "5.5", max: "8.5" },
//         interpretation: "Within normal range",
//         potential_issue: "",
//       },
//     ],

//     publicAccessible: false,
//     referenceDocumentTypes: [],
//   };
// }

export {}
