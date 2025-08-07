/**
 *  Run it solely :
 *  jest src/services/api/test/main-services/daily-record.services.test.ts
 */

import  {services} from '../../..'
import { createTestPet_1, createTestPet_2, createTestPet_3, createTestPet_4, deleteUser, enrollFreeSubscription, errorChecker, userLogin } from './helper';
import { Document } from '@services/api/types/main-services.types';
import * as path from "path";
import * as fs from "fs";
import axios from "axios";

describe("documents", () => {
  let accessToken: string = "";
  // let refreshToken: string = "";
  let csrfToken: string = "";

  let subscriptionId: string;
  // let dailyRecord_1: any;

  // let uploadReportPreSignedUrl: string;
  // let downLoaReportPresignUrl: string;
  // let reportNameInStorage_1: string;
  // const blood_report_folder_path = "../testing_data/daily-record";
  let pet1_id: string;
  // let pet2_id: string;

  // // use in test 13
  // let pet3_id: string;
  // let pet4_id: string;

  let dailyRecord1_id: string;
  let report_to_delete_id: string;

  beforeAll(async () => {
    // Sign up
    const tokens = await userLogin();
    accessToken = tokens.accessToken as string;
    // refreshToken = tokens.refreshToken as string;
    csrfToken = tokens.csrfToken as string;

    // Enroll free subscription
    const { id } = await enrollFreeSubscription({
      csrfToken,
      accessToken,
    });
    subscriptionId = id;

    // Update the seat no for this test use
    await services.api.main.subscription.update({
      subscriptionId,
      seatNo: 2,
      accessToken,
      csrfToken,
    });

    // add 2 Pets
    await createTestPet_1({
      csrfToken,
      accessToken,
    });
    await createTestPet_2({
      csrfToken,
      accessToken,
    });
  });

  afterAll(async () => {
    await deleteUser({
      accessToken,
      csrfToken,
    });
  });

  describe("Setting Check", () => {
    it("task 1 - should user in a subscription and has 2 pets.", async () => {
      const { data: result } = await services.api.main.user.viewProfile({
        accessToken,
        csrfToken,
      });
      expect(result.pets.length).toBe(2);
      expect(result.subscription?.seatNo).toBe(2);

      pet1_id = result.pets[0].id;
      // pet2_id = result.pets[1].id;
    });
  });
  //POST  https://main.bevetu.com/v1/documents/pets/{petId}/daily-records
  describe("createDailyRecord()", () => {
    it("test 2 - should create the daily record  with attributes.", async () => {
       const attributes: Document.IDailyRecordAttributes = {
         toilet: [],
         food: [
           {
             name: "Grilled Salmon",
             volume: "150g",
             intakeTime: "12:30",
             isRefuse: false,
             ingridents: [
               ["salmon", "140g"],
               ["lemon", "10g"],
             ],
             brand: "FreshCatch",
             selfCook: true,
             notes: "Well cooked and eaten completely",
           },
           {
             name: "Fruit Salad",
             volume: "100g",
             intakeTime: "08:00",
             isRefuse: false,
             ingridents: [
               ["apple", "30g"],
               ["banana", "40g"],
               ["grapes", "30g"],
             ],
             notes: "Half portion eaten",
           },
         ],
         drink: [
           {
             volume: "200ml",
             intakeTime: "08:15",
             isRefuse: false,
             notes: "Finished all",
           },
           {
             volume: "300ml",
             intakeTime: "13:00",
             isRefuse: false,
           },
         ],
         walking: [
           {
             location: "Neighborhood Park",
             geoLocation: {
               latitude: "37.7749",
               longitude: "-122.4194",
             },
             startTime: "07:00",
             endTime: "07:30",
             isRefuse: false,
             notes: "Brisk walk, good weather",
           },
         ],
         weight: {
           weight: 12.7,
           unit: "kg",
         },
         notes: "Dog was active and ate well today.",
       };;


      const response = await services.api.main.document.createDailyRecord({
        petId: pet1_id,
        name: "Beyonce daily Record 1",
        date: new Date(),
        accessToken,
        csrfToken,
        attributes: attributes,
      });

      const { id: documentId } = response.data;
      dailyRecord1_id = documentId;
      expect(dailyRecord1_id).toBeDefined();

    });
  });

  //GET  https://main.bevetu.com/v1/documents/pets/{petId}/daily-records/{reportId}
  describe("viewOneDailyRecord()", () => {
    it("test 3 - should view the daily Record just created.", async () => {
      // same as the test 2 above
      const attributes: Document.IDailyRecordAttributes = {
        toilet: [],
        food: [
          {
            name: "Grilled Salmon",
            volume: "150g",
            intakeTime: "12:30",
            isRefuse: false,
            ingridents: [
              ["salmon", "140g"],
              ["lemon", "10g"],
            ],
            brand: "FreshCatch",
            selfCook: true,
            notes: "Well cooked and eaten completely",
          },
          {
            name: "Fruit Salad",
            volume: "100g",
            intakeTime: "08:00",
            isRefuse: false,
            ingridents: [
              ["apple", "30g"],
              ["banana", "40g"],
              ["grapes", "30g"],
            ],
            notes: "Half portion eaten",
          },
        ],
        drink: [
          {
            volume: "200ml",
            intakeTime: "08:15",
            isRefuse: false,
            notes: "Finished all",
          },
          {
            volume: "300ml",
            intakeTime: "13:00",
            isRefuse: false,
          },
        ],
        walking: [
          {
            location: "Neighborhood Park",
            geoLocation: {
              latitude: "37.7749",
              longitude: "-122.4194",
            },
            startTime: "07:00",
            endTime: "07:30",
            isRefuse: false,
            notes: "Brisk walk, good weather",
          },
        ],
        weight: {
          weight: 12.7,
          unit: "kg",
        },
        notes: "Dog was active and ate well today.",
      };;
     
      const { data } = await services.api.main.document.viewOneDailyRecord({
        petId: pet1_id,
        reportId: dailyRecord1_id,
        accessToken,
        csrfToken,
      });
      expect(data.id).toBe(dailyRecord1_id);
      expect(data.type).toBe("DAILY_RECORD");
      expect(data.attributes).toEqual(attributes);
    });
  });

  //PATCH  https://main.bevetu.com/v1/documents/pets/{petId}/daily-records/{reportId}
  describe("updateDailyRecord()", () => {
    it("test 4 - should be able to update the fields to other value.", async () => {
      const attributes2: Document.IDailyRecordAttributes = {
        toilet: [],
        food: [
          {
            name: "Boiled Chicken",
            volume: "120g",
            intakeTime: "18:00",
            isRefuse: false,
            ingridents: [
              ["chicken breast", "100g"],
              ["carrots", "20g"],
            ],
            brand: "PetCare Meals",
            selfCook: false,
            notes: "Left a few pieces",
          },
          {
            name: "Dry Kibble",
            volume: "80g",
            intakeTime: "07:00",
            isRefuse: true,
            notes: "Refused to eat in the morning",
          },
        ],
        drink: [
          {
            volume: "250ml",
            intakeTime: "08:00",
            isRefuse: false,
            notes: "Drank slowly",
          },
          {
            volume: "200ml",
            intakeTime: "20:00",
            isRefuse: false,
          },
        ],
        walking: [
          {
            location: "City Dog Trail",
            geoLocation: {
              latitude: "34.0522",
              longitude: "-118.2437",
            },
            startTime: "06:30",
            endTime: "07:00",
            isRefuse: false,
            notes: "Walked with leash, encountered other dogs",
          },
          {
            location: "Backyard",
            geoLocation: {
              latitude: "34.0522",
              longitude: "-118.2437",
            },
            startTime: "17:00",
            endTime: "17:15",
            isRefuse: true,
            notes: "Refused to walk in the evening",
          },
        ],
        weight: {
          weight: "13.2",
          unit: "kg",
        },
        notes: "Slightly less active than usual, but appetite was fair.",
      };

      await services.api.main.document.updateDailyRecord({
        petId: pet1_id,
        reportId: dailyRecord1_id,
        accessToken,
        csrfToken,
        name: "updated report name",
        attributes: attributes2,
        date: new Date(),
      });

      const { data } = await services.api.main.document.viewOneDailyRecord({
        petId: pet1_id,
        reportId: dailyRecord1_id,
        accessToken,
        csrfToken,
      });

      expect(data.name).toBe("updated report name");
      expect(data.attributes).toEqual(attributes2);
    });

    /**
     *  MUST BE UPDATE THE ENTIRE ATTRIBUTE !!
     */
    // it("test 5 - should be able to partially update the arrtibutes fields.", async () => {
    //   // same as the test 4
    //   const attributes2: Document.IDailyRecordAttributes = {
    //     food: [
    //       {
    //         name: "Boiled Chicken",
    //         volume: "120g",
    //         intakeTime: "18:00",
    //         isRefuse: false,
    //         ingridents: [
    //           ["chicken breast", "100g"],
    //           ["carrots", "20g"],
    //         ],
    //         brand: "PetCare Meals",
    //         selfCook: false,
    //         notes: "Left a few pieces",
    //       },
    //       {
    //         name: "Dry Kibble",
    //         volume: "80g",
    //         intakeTime: "07:00",
    //         isRefuse: true,
    //         notes: "Refused to eat in the morning",
    //       },
    //     ],
    //     drink: [
    //       {
    //         volume: "250ml",
    //         intakeTime: "08:00",
    //         isRefuse: false,
    //         notes: "Drank slowly",
    //       },
    //       {
    //         volume: "200ml",
    //         intakeTime: "20:00",
    //         isRefuse: false,
    //       },
    //     ],
    //     walking: [
    //       {
    //         location: "City Dog Trail",
    //         geoLocation: {
    //           latitude: "34.0522",
    //           longitude: "-118.2437",
    //         },
    //         startTime: "06:30",
    //         endTime: "07:00",
    //         isRefuse: false,
    //         notes: "Walked with leash, encountered other dogs",
    //       },
    //       {
    //         location: "Backyard",
    //         geoLocation: {
    //           latitude: "34.0522",
    //           longitude: "-118.2437",
    //         },
    //         startTime: "17:00",
    //         endTime: "17:15",
    //         isRefuse: true,
    //         notes: "Refused to walk in the evening",
    //       },
    //     ],
    //     weight: {
    //       weight: "13.2",
    //       unit: "kg",
    //     },
    //     notes: "Slightly less active than usual, but appetite was fair.",
    //   };

    //   const attributes3: Partial<Document.IDailyRecordAttributes> = {
    //     weight: {
    //       weight: "1323.2",
    //       unit: "g",
    //     },
    //   };

    //   await services.api.main.document.updateDailyRecord({
    //     petId: pet1_id,
    //     reportId: dailyRecord1_id,
    //     accessToken,
    //     csrfToken,
    //     name: "updated report test 5",
    //     attributes: attributes3,
    //   });

    //   const { data } = await services.api.main.document.viewOneDailyRecord({
    //     petId: pet1_id,
    //     reportId: dailyRecord1_id,
    //     accessToken,
    //     csrfToken,
    //   });
    //   expect(data.name).toBe("updated report test 5");
    //   expect(data.attributes).toEqual({ ...attributes2, ...attributes3 });
    // });

    it("test 6 - should be able to update without attribute fields.", async () => {
      await services.api.main.document.updateDailyRecord({
        petId: pet1_id,
        reportId: dailyRecord1_id,
        accessToken,
        csrfToken,
        name: "updated report name test 6",
      });

      const { data } = await services.api.main.document.viewOneDailyRecord({
        petId: pet1_id,
        reportId: dailyRecord1_id,
        accessToken,
        csrfToken,
      });

      expect(data.name).toBe("updated report name test 6");
    });

    it("test 7 - should return 400 if attributes not correct.", async () => {
      try {
        // test set attributes but set it as "null"
        const attributes = null;
        await services.api.main.document.updateDailyRecord({
          petId: pet1_id,
          reportId: dailyRecord1_id,
          accessToken,
          csrfToken,
          attributes,
        });
      } catch (error: any) {
        const { response } = error;
        // eslint-disable-next-line jest/no-conditional-expect
        expect(response.data.message).toBe(
          "Invalid attributes: must be a non-null object"
        );
        // eslint-disable-next-line jest/no-conditional-expect
        expect(response.status).toBe(400);
      }

      try {
        // test set attributes with wrong type
        const attributes2 = {
          // dailyNsfgsafsdfsafdgame: '',
          // // dosageUnit: "",
          diagnosis: 123,
        };
        await services.api.main.document.updateDailyRecord({
          petId: pet1_id,
          reportId: dailyRecord1_id,
          accessToken,
          csrfToken,
          name: "updated report test 7 attributes2",
          //@ts-ignore
          attributes: attributes2,
        });
      } catch (error: any) {
        const { response } = error;
        // eslint-disable-next-line jest/no-conditional-expect
        expect(response.data.message).toBe(
          "No valid fields provided in attributes"
        );
        // eslint-disable-next-line jest/no-conditional-expect
        expect(response.status).toBe(400);
      }

      try {
        // test set attributes with wrong type
        const attributes3 = {
          food: 123,
        };
        await services.api.main.document.updateDailyRecord({
          petId: pet1_id,
          reportId: dailyRecord1_id,
          accessToken,
          csrfToken,
          name: "updated report test 7 attributes3",
          //@ts-ignore
          attributes: attributes3,
        });
      } catch (error: any) {
        const { response } = error;
        // eslint-disable-next-line jest/no-conditional-expect
        expect(response.data.message).toBe("food must be an array");
        // eslint-disable-next-line jest/no-conditional-expect
        expect(response.status).toBe(400);
      }

      // did not set attributes. Test if undefined is allowed. It should be fine
      const response = await services.api.main.document.updateDailyRecord({
        petId: pet1_id,
        reportId: dailyRecord1_id,
        accessToken,
        csrfToken,
      });
      expect(response.status).toBe(200);
    });
  });

  //GET  https://main.bevetu.com/v1/documents/pets/{petId}/daily-records
  describe("viewAllDailyRecords()", () => {
    it("test 8 - should be able to view all daily Record.", async () => {
      const attributes: Document.IDailyRecordAttributes = {
        food: [
          {
            name: "Boiled Chicken",
            volume: "120g",
            intakeTime: "18:00",
            isRefuse: false,
            ingridents: [
              ["chicken breast", "100g"],
              ["carrots", "20g"],
            ],
            brand: "PetCare Meals",
            selfCook: false,
            notes: "Left a few pieces",
          },
          {
            name: "Dry Kibble",
            volume: "80g",
            intakeTime: "07:00",
            isRefuse: true,
            notes: "Refused to eat in the morning",
          },
        ],
        drink: [
          {
            volume: "250ml",
            intakeTime: "08:00",
            isRefuse: false,
            notes: "Drank slowly",
          },
          {
            volume: "200ml",
            intakeTime: "20:00",
            isRefuse: false,
          },
        ],
        toilet:[],
        walking: [
          {
            location: "City Dog Trail",
            geoLocation: {
              latitude: "34.0522",
              longitude: "-118.2437",
            },
            startTime: "06:30",
            endTime: "07:00",
            isRefuse: false,
            notes: "Walked with leash, encountered other dogs",
          },
          {
            location: "Backyard",
            geoLocation: {
              latitude: "34.0522",
              longitude: "-118.2437",
            },
            startTime: "17:00",
            endTime: "17:15",
            isRefuse: true,
            notes: "Refused to walk in the evening",
          },
        ],
        weight: {
          weight: "13.2",
          unit: "kg",
        },
        notes: "Slightly less active than usual, but appetite was fair.",
      };
      // create 19 reports, total 20 (include the one created in above test)
      for (let i = 0; i < 19; i++) {
        await services.api.main.document.createDailyRecord({
          petId: pet1_id,
          name: `Report ${i}`,
          date: new Date(),
          accessToken,
          csrfToken,
          attributes
        });
      }

      const { data: result_1 } =
        await services.api.main.document.viewAllDailyRecords({
          petId: pet1_id,
          accessToken,
          csrfToken,
          page: 1,
          limit: 20,
        });

      expect(result_1.documents.length).toBe(20);
      expect(result_1.currentPage).toBe(1);
      expect(result_1.limit).toBe(20);
      expect(result_1.totalRecords).toBe(20);
      expect(result_1.start).toBe(1);
      expect(result_1.end).toBe(20);
      expect(result_1.next).toBeNull();
      expect(result_1.prev).toBeDefined();

      const { data: result_2 } =
        await services.api.main.document.viewAllDailyRecords({
          petId: pet1_id,
          accessToken,
          csrfToken,
          page: 2,
          limit: 10,
        });

      report_to_delete_id = result_2.documents[6].id;

      expect(result_2.documents.length).toBe(10);
      expect(result_2.currentPage).toBe(2);
      expect(result_2.limit).toBe(10);
      expect(result_2.totalRecords).toBe(20);
      expect(result_2.start).toBe(11);
      expect(result_2.end).toBe(20);
      expect(result_2.next).toBeNull();
      expect(result_2.prev).toBeDefined();
    });
  });

  //DELETE  https://main.bevetu.com/v1/documents/pets/{petId}/daily-records/{reportId}
  describe("deleteDailyRecord()", () => {
    it("test 9 - should be able to delete a daily record.", async () => {
      await services.api.main.document.deleteDailyRecord({
        petId: pet1_id,
        accessToken,
        csrfToken,
        reportId: report_to_delete_id,
      });

      const { data: result_1 } =
        await services.api.main.document.viewAllDailyRecords({
          petId: pet1_id,
          accessToken,
          csrfToken,
          page: 1,
          limit: 20,
        });

      expect(result_1.documents.length).toBe(19);
    });
  });

  // // POST  https://main.bevetu.com/v1/documents/pets/{petId}/upload-url
  // describe("getUploadPresignedUrl()", () => {
  //   it.skip("test 10 - should be able to get the upload daily record presigned url", async () => {
  //     const fileName = "daily-record-1.png";

  //     const { data } = await services.api.main.document.getUploadPresignedUrl({
  //       petId: pet1_id,
  //       documentType: "daily_RECORD",
  //       fileName,
  //       accessToken,
  //       csrfToken,
  //     });

  //     uploadReportPreSignedUrl = data.url;
  //     const startsWithBaseUrl = uploadReportPreSignedUrl.startsWith(
  //       process.env.REACT_APP_STORAGE_ENDPOINT as string
  //     );
  //     expect(uploadReportPreSignedUrl).toBeDefined();
  //     expect(startsWithBaseUrl).toBe(true);
  //   });

  //   it.skip("test 11 - should be able to upload the daily Record to Storage after fetching the presigned url", async () => {
  //     const pathToDocument = path.join(
  //       __dirname,
  //       blood_report_folder_path,
  //      "daily-record-1.png"
  //     );
  //     const fileStream = fs.createReadStream(pathToDocument);
  //     const fileStats = fs.statSync(pathToDocument);
  //     const response = await axios.put(uploadReportPreSignedUrl, fileStream, {
  //       headers: {
  //         "Content-Type": "application/png",
  //         "Content-Length": fileStats.size,
  //       },
  //     });

  //     const parsedUrl = new URL(response.config.url as string);
  //     const pathname = parsedUrl.pathname;
  //     reportNameInStorage_1 = pathname.split.skip("/")!.pop()!.split.skip("?")[0];
  //     expect(response.status).toBe(200);
  //   });

  //   it.skip("test 12 - should be able to update the url field of the daily Record.", async () => {
  //     await services.api.main.document.updateDailyRecord({
  //       petId: pet1_id,
  //       reportId: dailyRecord1_id,
  //       accessToken,
  //       csrfToken,
  //       url: reportNameInStorage_1,
  //     });

  //     const { data } = await services.api.main.document.viewOneDailyRecord({
  //       petId: pet1_id,
  //       reportId: dailyRecord1_id,
  //       accessToken,
  //       csrfToken,
  //     });

  //     expect(data.name).toBe("updated report name test 6");
  //     expect(data.url).toEqual(reportNameInStorage_1);
  //   });
  // });
  // //POST  https://main.bevetu.com/v1/documents/pets/{petId}/download-url
  // describe("getDownloadPresignedUrl()", () => {
  //   it.skip("test 13 - should be able to get a donwload presign url by report owner", async () => {
  //     const { data } = await services.api.main.document.getDownloadPresignedUrl(
  //       {
  //         petId: pet1_id,
  //         documentType: "daily_RECORD",
  //         fileName: reportNameInStorage_1,
  //         accessToken,
  //         csrfToken,
  //       }
  //     );

  //     downLoaReportPresignUrl = data.url;
  //     const startsWithBaseUrl = uploadReportPreSignedUrl.startsWith(
  //       process.env.REACT_APP_STORAGE_ENDPOINT as string
  //     );

  //     expect(downLoaReportPresignUrl).toBeDefined();
  //     expect(startsWithBaseUrl).toBe(true);
  //   });
  //   it.skip("test 14 - should be able to  set url field as null", async () => {
  //     await services.api.main.document.updateDailyRecord({
  //       petId: pet1_id,
  //       reportId: dailyRecord1_id,
  //       accessToken,
  //       csrfToken,
  //       url: null,
  //     });

  //     const { data } = await services.api.main.document.viewOneDailyRecord({
  //       petId: pet1_id,
  //       reportId: dailyRecord1_id,
  //       accessToken,
  //       csrfToken,
  //     });
  //     expect(data.url).toBeNull();
  //   });
  // });

});


