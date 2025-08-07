/**
 *  Run it solely :
 *  jest src/services/api/test/main-services/vaccine-record.services.test.ts
 */

import  {services} from '../../..'
import { createTestPet_1, createTestPet_2, createTestPet_3, createTestPet_4, deleteUser, enrollFreeSubscription, errorChecker, userLogin } from './helper';
import { Document } from '@services/api/types/main-services.types';
import * as path from "path";
import * as fs from "fs";
import axios from "axios";

describe("documents", () => {
  let accessToken: string = "";
  let refreshToken: string = "";
  let csrfToken: string = "";

  let subscriptionId: string;
  let VaccineRecord_1: any;

  let uploadReportPreSignedUrl: string;
  let downLoaReportPresignUrl: string;
  let reportNameInStorage_1: string;
  const blood_report_folder_path = "../testing_data/vaccine-record";
  let pet1_id: string;
  let pet2_id: string;

  // use in test 13
  let pet3_id: string;
  let pet4_id: string;

  let VaccineRecord1_id: string;
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
  //POST  https://main.bevetu.com/v1/documents/pets/{petId}/vaccine-records
  describe("createVaccineRecord()", () => {
    it("test 2 - should create the Vaccine Record record with url fields and attributes.", async () => {
      const attributes: Document.IVaccineRecordAttributes = {
        vaccineName: "Rabies Vaccine",
        brandName: "VaccineCorp",
        dosage: 5,
        dosageUnit: "ml",
        location: "PetMedic Hospital",
      };
      const response = await services.api.main.document.createVaccineRecord({
        petId: pet1_id,
        name: "Beyonce Vaccine Record 1",
        date: new Date(),
        accessToken,
        csrfToken,
        attributes: attributes,
      });

      const { id: documentId } = response.data;
      VaccineRecord1_id = documentId;
      expect(VaccineRecord1_id).toBeDefined();
    });
  });

  //GET  https://main.bevetu.com/v1/documents/pets/{petId}/vaccine-records/{reportId}
  describe("viewOneVaccineRecord()", () => {
    it("test 3 - should view the Vaccine Record just created.", async () => {
      const attributes: Document.IVaccineRecordAttributes = {
        vaccineName: "Rabies Vaccine",
        brandName: "VaccineCorp",
        dosage: 5,
        dosageUnit: "ml",
        location: "PetMedic Hospital",
      };
     
      const { data } = await services.api.main.document.viewOneVaccineRecord({
        petId: pet1_id,
        reportId: VaccineRecord1_id,
        accessToken,
        csrfToken,
      });
      expect(data.id).toBe(VaccineRecord1_id);
      expect(data.type).toBe("VACCINE_RECORD");
      expect(data.attributes).toEqual(attributes);
    });
  });

  //PATCH  https://main.bevetu.com/v1/documents/pets/{petId}/vaccine-records/{reportId}
  describe("updateVaccineRecord()", () => {
    it("test 4 - should be able to update the fields of the Vaccine Record.", async () => {
      const attributes2: Document.IVaccineRecordAttributes = {
        vaccineName: "Rabies Vaccine 2",
        brandName: "VaccineCorp 2",
        dosage: 10,
        dosageUnit: "ml",
        location: "PetMedic Hospital 2",
      };

      await services.api.main.document.updateVaccineRecord({
        petId: pet1_id,
        reportId: VaccineRecord1_id,
        accessToken,
        csrfToken,
        name: "updated report name",
        attributes: attributes2,
        date: new Date(),
      });

      const { data } = await services.api.main.document.viewOneVaccineRecord({
        petId: pet1_id,
        reportId: VaccineRecord1_id,
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
    //   const attributes2: Document.IVaccineRecordAttributes = {
    //     vaccineName: "Rabies Vaccine 2",
    //     brandName: "VaccineCorp 2",
    //     dosage: 10,
    //     dosageUnit: "ml",
    //     location: "PetMedic Hospital 2",
    //   };
    //   const attributes3: Partial<Document.IVaccineRecordAttributes> = {
    //     vaccineName: "Rabies Vaccine 10",
    //     dosage: 101,
    //   };
    //   await services.api.main.document.updateVaccineRecord({
    //     petId: pet1_id,
    //     reportId: VaccineRecord1_id,
    //     accessToken,
    //     csrfToken,
    //     name: "updated report name 3",
    //     attributes: attributes3,
    //   });

    //   const { data } = await services.api.main.document.viewOneVaccineRecord({
    //     petId: pet1_id,
    //     reportId: VaccineRecord1_id,
    //     accessToken,
    //     csrfToken,
    //   });
    //   expect(data.name).toBe("updated report name 3");
    //   expect(data.attributes).toEqual({ ...attributes2, ...attributes3 });
    // });
    it("test 6 - should be able to update the without having attribute fields.", async () => {
      await services.api.main.document.updateVaccineRecord({
        petId: pet1_id,
        reportId: VaccineRecord1_id,
        accessToken,
        csrfToken,
        name: "updated report name test 6",
      });

      const { data } = await services.api.main.document.viewOneVaccineRecord({
        petId: pet1_id,
        reportId: VaccineRecord1_id,
        accessToken,
        csrfToken,
      });
      expect(data.name).toBe("updated report name test 6");
    });
    it("test 7 - should return 400 if attributes not correct.", async () => {
      try {
        // test set attributes but set it as "null"
        const attributes = null;
        await services.api.main.document.updateVaccineRecord({
          petId: pet1_id,
          reportId: VaccineRecord1_id,
          accessToken,
          csrfToken,
          attributes,
        });
      } catch (error: any) {
        const { response } = error;
        // eslint-disable-next-line jest/no-conditional-expect
        console.log(error.message, "<< message");
        // eslint-disable-next-line jest/no-conditional-expect
        expect(response.status).toBe(400);
      }

      try {
        // test set attributes with wrong type
        const attributes2 = {
          // vaccineName: '',
          // dosageUnit: "",
          dosage: "kkkkk",
        };
        await services.api.main.document.updateVaccineRecord({
          petId: pet1_id,
          reportId: VaccineRecord1_id,
          accessToken,
          csrfToken,
          //@ts-ignore
          attributes: attributes2,
        });
      } catch (error: any) {
        const { response } = error;
        // eslint-disable-next-line jest/no-conditional-expect
        console.log(error.message, "<< message");
        // eslint-disable-next-line jest/no-conditional-expect
        expect(response.status).toBe(400);
      }

      // did not set attributes. Test if undefined is allowed. It should be fine

      const response = await services.api.main.document.updateVaccineRecord({
        petId: pet1_id,
        reportId: VaccineRecord1_id,
        accessToken,
        csrfToken,
      });
      expect(response.status).toBe(200);
    });
  });

  //GET  https://main.bevetu.com/v1/documents/pets/{petId}/vaccine-records
  describe("viewAllVaccineRecords()", () => {
    it("test 8 - should be able to view all Vaccine Record.", async () => {
      const attributes: Document.IVaccineRecordAttributes = {
        vaccineName: "Rabies Vaccine 2",
        brandName: "VaccineCorp 2",
        dosage: 10,
        dosageUnit: "ml",
        location: "PetMedic Hospital 2",
      };
      // create 19 reports, total 20 (include the one created in above test)
      for (let i = 0; i < 19; i++) {
        await services.api.main.document.createVaccineRecord({
          petId: pet1_id,
          name: `Report ${i}`,
          date: new Date(),
          accessToken,
          csrfToken,
          attributes
        });
      }

      const { data: result_1 } =
        await services.api.main.document.viewAllVaccineRecords({
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
        await services.api.main.document.viewAllVaccineRecords({
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

  //DELETE  https://main.bevetu.com/v1/documents/pets/{petId}/vaccine-records/{reportId}
  describe("deleteVaccineRecord()", () => {
    it("test 9 - should be able to delete a vaccine record.", async () => {
      await services.api.main.document.deleteVaccineRecord({
        petId: pet1_id,
        accessToken,
        csrfToken,
        reportId: report_to_delete_id,
      });

      const { data: result_1 } =
        await services.api.main.document.viewAllVaccineRecords({
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
    it("test 10 - should be able to get the upload vaccine record presigned url", async () => {
      const fileName = "vaccine-record-1.png";

      const { data } = await services.api.main.document.getUploadPresignedUrl({
        petId: pet1_id,
        documentType: "VACCINE_RECORD",
        fileName,
        accessToken,
        csrfToken,
      });

      uploadReportPreSignedUrl = data.url;
      const startsWithBaseUrl = uploadReportPreSignedUrl.startsWith(
        process.env.REACT_APP_STORAGE_ENDPOINT as string
      );
      expect(uploadReportPreSignedUrl).toBeDefined();
      expect(startsWithBaseUrl).toBe(true);
    });

    it("test 11 - should be able to upload the Vaccine Record to Storage after fetching the presigned url", async () => {
      const pathToDocument = path.join(
        __dirname,
        blood_report_folder_path,
       "vaccine-record-1.png"
      );
      const fileStream = fs.createReadStream(pathToDocument);
      const fileStats = fs.statSync(pathToDocument);
      const response = await axios.put(uploadReportPreSignedUrl, fileStream, {
        headers: {
          ...(process.env.REACT_APP_STORAGE_RPOVIDER === "azure"
            ? { "x-ms-blob-type": "BlockBlob" }
            : {}),
          "Content-Type": "application/png",
          "Content-Length": fileStats.size,
        },
      });

      const parsedUrl = new URL(response.config.url as string);
      const pathname = parsedUrl.pathname;
      reportNameInStorage_1 = pathname.split("/")!.pop()!.split("?")[0];
      expect(response.status).toBe(200);
    });

    it("test 12 - should be able to update the url field of the Vaccine Record.", async () => {
      await services.api.main.document.updateVaccineRecord({
        petId: pet1_id,
        reportId: VaccineRecord1_id,
        accessToken,
        csrfToken,
        url: reportNameInStorage_1,
      });

      const { data } = await services.api.main.document.viewOneVaccineRecord({
        petId: pet1_id,
        reportId: VaccineRecord1_id,
        accessToken,
        csrfToken,
      });

      expect(data.name).toBe("updated report name test 6");
      expect(data.url).toEqual(reportNameInStorage_1);
    });
  });
  //POST  https://main.bevetu.com/v1/documents/pets/{petId}/download-url
  describe("getDownloadPresignedUrl()", () => {
    it("test 13 - should be able to get a donwload presign url by report owner", async () => {
      const { data } = await services.api.main.document.getDownloadPresignedUrl(
        {
          petId: pet1_id,
          documentType: "VACCINE_RECORD",
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
    it("test 14 - should be able to  set url field as null", async () => {
      await services.api.main.document.updateVaccineRecord({
        petId: pet1_id,
        reportId: VaccineRecord1_id,
        accessToken,
        csrfToken,
        url: null,
      });

      const { data } = await services.api.main.document.viewOneVaccineRecord({
        petId: pet1_id,
        reportId: VaccineRecord1_id,
        accessToken,
        csrfToken,
      });
      expect(data.url).toBeNull();
    });
  });

});


