/**
 *  Run it solely :
 *  jest src/services/api/test/main-services/document.services.test.ts
 */
import { expect } from "@jest/globals";
import  {services} from '../../..'
import { createTestPet_1, createTestPet_2, createTestPet_3, createTestPet_4, deleteUser, enrollFreeSubscription, errorChecker, userLogin } from './helper';

import * as path from "path";
import * as fs from "fs";
import axios from "axios";

describe("documents", () => {
  let accessToken: string = "";
  let refreshToken: string = "";
  let csrfToken: string = "";

  let subscriptionId: string;
  let bloodReport_1: any;

  let uploadReportPreSignedUrl: string;
  let downLoaReportPresignUrl: string;
  let reportNameInStorage_1: string;
  const blood_report_folder_path = "../testing_data/blood-report";
  let pet1_id: string;
  let pet2_id: string;

  // use in test 13
  let pet3_id: string;
  let pet4_id: string;

  let bloodReport1_id: string;
  let report_to_delete_id: string;

  beforeAll(async () => {
    // Sign up
    const tokens = await userLogin();
    accessToken = tokens.accessToken as string;
    refreshToken = tokens.refreshToken as string;
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
      pet2_id = result.pets[1].id;
    });
  });
  //POST  https://main.bevetu.com/v1/documents/pets/{petId}/blood-reports
  describe("createBloodReport()", () => {
    it("test 2 - should create the blood report record with url fields and attributes.", async () => {
      const response = await services.api.main.document.createBloodReport({
        petId: pet1_id,
        name: "Beyonce Blood Report 1",
        date: new Date(),
        accessToken,
        csrfToken,
        attributes: {
          sodium: "90",
        },
      });

      const { id: documentId } = response.data;
      bloodReport1_id = documentId;
      expect(bloodReport1_id).toBeDefined();
    });
  });

  //GET  https://main.bevetu.com/v1/documents/pets/{petId}/blood-reports/{reportId}
  describe("viewOneBloodReport()", () => {
    it("test 3 - should view the blood report just created.", async () => {
      const { data } = await services.api.main.document.viewOneBloodReport({
        petId: pet1_id,
        reportId: bloodReport1_id,
        accessToken,
        csrfToken,
      });
      expect(data.id).toBe(bloodReport1_id);
      expect(data.type).toBe("BLOOD_REPORT");
      expect(data.attributes).toEqual({
        sodium: "90",
      });
    });
  });

  //PATCH  https://main.bevetu.com/v1/documents/pets/{petId}/blood-reports/{reportId}
  describe("updateBloodReport()", () => {
    it("test 4 - should be able to update the fields of the blood report.", async () => {
      const attributes = {
        potassium: "90",
        calcium: "250",
      };
      await services.api.main.document.updateBloodReport({
        petId: pet1_id,
        reportId: bloodReport1_id,
        accessToken,
        csrfToken,
        name: "updated report name",
        attributes,
        date: new Date(),
      });

      const { data } = await services.api.main.document.viewOneBloodReport({
        petId: pet1_id,
        reportId: bloodReport1_id,
        accessToken,
        csrfToken,
      });

      expect(data.name).toBe("updated report name");
      expect(data.attributes).toEqual(attributes);
    });

    it("test 5 - should be able to remove the attributes of the blood report.", async () => {
      const attributes = null;
      await services.api.main.document.updateBloodReport({
        petId: pet1_id,
        reportId: bloodReport1_id,
        accessToken,
        csrfToken,
        attributes,
      });

      const { data } = await services.api.main.document.viewOneBloodReport({
        petId: pet1_id,
        reportId: bloodReport1_id,
        accessToken,
        csrfToken,
      });
      expect(data.attributes).toBeNull();
    });
  });

  //GET  https://main.bevetu.com/v1/documents/pets/{petId}/blood-reports
  describe("viewAllBloodReports()", () => {
    it("test 6 - should be able to view all blood report.", async () => {
      // create 19 reports, total 20 (include the one created in above test)
      for (let i = 0; i < 19; i++) {
        await services.api.main.document.createBloodReport({
          petId: pet1_id,
          name: `Report ${i}`,
          date: new Date(),
          accessToken,
          csrfToken,
          attributes: {
            uranium: `200${i}`,
          },
        });
      }

      const { data: result_1 } =
        await services.api.main.document.viewAllBloodReports({
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
        await services.api.main.document.viewAllBloodReports({
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

  //DELETE  https://main.bevetu.com/v1/documents/pets/{petId}/blood-reports/{reportId}
  describe("deleteBloodReport()", () => {
    it("test 7 - should be able to delete all blood report record.", async () => {
      await services.api.main.document.deleteBloodReport({
        petId: pet1_id,
        accessToken,
        csrfToken,
        reportId: report_to_delete_id,
      });

      const { data: result_1 } =
        await services.api.main.document.viewAllBloodReports({
          petId: pet1_id,
          accessToken,
          csrfToken,
          page: 1,
          limit: 20,
        });

      expect(result_1.documents.length).toBe(19);
    });
  });

  // POST  https://main.bevetu.com/v1/documents/pets/{petId}/upload-url
  describe("getUploadPresignedUrl()", () => {
    it("test 8 - should be able to get the upload blood report presigned url", async () => {
      const fileName = "pdf-report-2.pdf";

      const { data } = await services.api.main.document.getUploadPresignedUrl({
        petId: pet1_id,
        documentType: "BLOOD_REPORT",
        fileName,
        accessToken,
        csrfToken,
        fileSize:1000
      });

      uploadReportPreSignedUrl = data.url;
      const startsWithBaseUrl = uploadReportPreSignedUrl.startsWith(
        process.env.REACT_APP_STORAGE_ENDPOINT as string
      );
      expect(uploadReportPreSignedUrl).toBeDefined();
      expect(startsWithBaseUrl).toBe(true);
    });

    it("test 9 - should be able to upload the blood report to Storage after fetching the presigned url", async () => {
      const pathToDocument = path.join(
        __dirname,
        blood_report_folder_path,
        "pdf-report-2.pdf"
      );

  
      const fileStream = fs.createReadStream(pathToDocument);
      const fileStats = fs.statSync(pathToDocument);

      
      const response = await axios.put(uploadReportPreSignedUrl, fileStream, {
        headers: {
          ...(process.env.REACT_APP_STORAGE_RPOVIDER === "azure"
            ? { "x-ms-blob-type": "BlockBlob" }
            : {}),
          "Content-Type": "application/pdf",
          // 'Content-Type': 'image/jpeg',
          "Content-Length": fileStats.size,
        },
      });

      const parsedUrl = new URL(response.config.url as string);
      const pathname = parsedUrl.pathname;
      reportNameInStorage_1 = pathname.split("/")!.pop()!.split("?")[0];
      if (process.env.REACT_APP_STORAGE_RPOVIDER === 'azure'){
        expect(response.status).toBe( 201);
      } else {
        expect(response.status).toBe(200 );
      }
        
    });

    it("test 10 - should be able to update the url field of the blood report.", async () => {
      await services.api.main.document.updateBloodReport({
        petId: pet1_id,
        reportId: bloodReport1_id,
        accessToken,
        csrfToken,
        url: reportNameInStorage_1,
      });

      const { data } = await services.api.main.document.viewOneBloodReport({
        petId: pet1_id,
        reportId: bloodReport1_id,
        accessToken,
        csrfToken,
      });

      expect(data.name).toBe("updated report name");
      expect(data.url).toEqual(reportNameInStorage_1);
    });
  });
  //POST  https://main.bevetu.com/v1/documents/pets/{petId}/download-url
  describe("getDownloadPresignedUrl()", () => {
    it("test 11 - should be able to get a donwload presign url by report owner", async () => {
      const { data } = await services.api.main.document.getDownloadPresignedUrl(
        {
          petId: pet1_id,
          documentType: "BLOOD_REPORT",
          fileName: reportNameInStorage_1,
          accessToken,
          csrfToken,
        }
      );

      downLoaReportPresignUrl = data.url;
      const startsWithBaseUrl = uploadReportPreSignedUrl.startsWith(
        process.env.REACT_APP_STORAGE_ENDPOINT as string
      );

      expect(downLoaReportPresignUrl).toBeDefined();
      expect(startsWithBaseUrl).toBe(true);
    });
    it("test 12 - should be able to  set url field as null", async () => {
      await services.api.main.document.updateBloodReport({
        petId: pet1_id,
        reportId: bloodReport1_id,
        accessToken,
        csrfToken,
        url: null,
      });

      const { data } = await services.api.main.document.viewOneBloodReport({
        petId: pet1_id,
        reportId: bloodReport1_id,
        accessToken,
        csrfToken,
      });
      expect(data.url).toBeNull();
    });
  });

   // This api endpoint is removed
  // // GET  https://main.bevetu.com/v1/documents?limit={noOfDocument}&page={noOfPage}&PetIds={PetIdOne,PetIdTwo}
  // describe.only("viewByUserId()", () => {
  //   it("test 13 - should be able to  set url field as null", async () => {
  //     await services.api.main.subscription.update({
  //       subscriptionId,
  //       seatNo: 10,
  //       accessToken,
  //       csrfToken,
  //     });
  //     const createPet3Response = await createTestPet_3({
  //       csrfToken,
  //       accessToken,
  //     });
  //     const createPet4Response = await createTestPet_4({
  //       csrfToken,
  //       accessToken,
  //     });

  //     pet3_id = createPet3Response.data.id;
  //     pet4_id = createPet4Response.data.id;

  //     // create 5 blood documents for pet_3
  //     for (let i = 0; i < 5; i++) {
  //       await services.api.main.document.createBloodReport({
  //         petId: pet3_id,
  //         name: `Pet 3 Blood Report ${i}`,
  //         date: new Date(),
  //         csrfToken,
  //         accessToken,
  //       });
  //     }

  //     // create 10 blood documents for pet_4
  //     for (let i = 0; i < 10; i++) {
  //       await services.api.main.document.createBloodReport({
  //         petId: pet4_id,
  //         name: `Pet 4 Blood Report ${i}`,
  //         date: new Date(),
  //         csrfToken,
  //         accessToken,
  //       });
  //     }

  //     // create 8 blood documents for pet_3
  //     for (let i = 0; i < 8; i++) {
  //       await services.api.main.document.createBloodReport({
  //         petId: pet3_id,
  //         name: `Pet 3 Blood Report 2-${i}`,
  //         date: new Date(),
  //         csrfToken,
  //         accessToken,
  //       });
  //     }


  //     const response = await services.api.main.document.viewByUserId({
  //       page: 1,
  //       limit: 50,
  //       petIds: `${pet3_id},${pet4_id}`,
  //       csrfToken,
  //       accessToken,
  //     });

  //     expect(response.data.documents.length).toBe(23);


  //     const response2 = await services.api.main.document.viewByUserId({
  //       page: 1,
  //       limit: 10,
  //       petIds: `${pet3_id},${pet4_id}`,
  //       csrfToken,
  //       accessToken,
  //     });

  //     // console.log(response2.data);
  //     expect(response2.data.documents.length).toBe(10);

  //     const response3 = await services.api.main.document.viewByUserId({
  //       page: 2,
  //       limit: 10,
  //       petIds: `${pet3_id},${pet4_id}`,
  //       csrfToken,
  //       accessToken,
  //     });

  //     // console.log(response3.data);
  //     expect(response3.data.documents.length).toBe(10);

  //     const response4 = await services.api.main.document.viewByUserId({
  //       page: 3,
  //       limit: 10,
  //       petIds: `${pet3_id},${pet4_id}`,
  //       csrfToken,
  //       accessToken,
  //     });

  //     // console.log(response4.data);
  //     expect(response4.data.documents.length).toBe(3);
  //   });


    // This api endpoint is removed
    // it("test 14 - should throw error if pets has no documents", async () => {
    //   try {
    //     const response = await services.api.main.document.viewByUserId({
    //       page: 3,
    //       limit: 10,
    //       petIds: `${pet2_id}`,
    //       csrfToken,
    //       accessToken,
    //     });
    //   } catch (error:any) {
    //     // eslint-disable-next-line jest/no-conditional-expect
    //     expect(error.response.status).toBe(404);
    //   }
    // });
  // });
});


