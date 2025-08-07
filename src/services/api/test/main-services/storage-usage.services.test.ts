/**
 *  Run it solely :
 *  jest src/services/api/test/main-services/storage-usage.services.test.ts
 */

import { expect } from "@jest/globals";

import  {services} from '../../..'
import { createTestPet_1, createTestPet_2, createTestPet_3, createTestPet_4, deleteUser, enrollFreeSubscription, errorChecker, userLogin } from './helper';

import * as path from "path";
import * as fs from "fs";
import axios from "axios";

describe("documents", () => {
  let accessToken: string = "";
  // let refreshToken: string = "";
  let csrfToken: string = "";

  let subscriptionId: string;

  
  let pet1_id: string;
  let pet2_id: string;
  let pet3_id: string;
  let pet4_id: string;


  let report_to_delete_id: string;

  async function uploadDocument(pet_id,documentType){

    const fileName = "pdf-report-2.pdf";
    const blood_report_folder_path = "../testing_data/blood-report";
    const pathToDocument = path.join(
      __dirname,
      blood_report_folder_path,
      fileName
    );

    const fileStream = fs.createReadStream(pathToDocument);
    const fileStats = fs.statSync(pathToDocument);
   
  
    const { data } = await services.api.main.document.getUploadPresignedUrl({
      petId: pet_id,
      documentType: documentType,
      fileName,
      accessToken,
      csrfToken,
      fileSize: fileStats.size
    });
    
    const uploadReportPreSignedUrl = data.url;
    
   
    const response = await axios.put(uploadReportPreSignedUrl, fileStream, {
      headers: {
        ...(process.env.REACT_APP_STORAGE_RPOVIDER === "azure"
          ? { "x-ms-blob-type": "BlockBlob" }
          : {}),
        "Content-Type": "application/pdf",
        "Content-Length": fileStats.size,
      },
    });
  
   
    return { response, fileSize: fileStats.size };
  }

  async function uploadBloodBloodReport(pet_id){
    return await uploadDocument(pet_id,'BLOOD_REPORT')
  }
 

  async function uploadAppointmentRecord(pet_id){
    return await uploadDocument(pet_id, "APPOINTMENT_RECORD");
  }

  async function uploadVaccineRecord(pet_id){
    return await uploadDocument(pet_id, "VACCINE_RECORD");
  }

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
      seatNo: 10,
      accessToken,
      csrfToken,
    });

    // add 3 Pets
    await createTestPet_1({
      csrfToken,
      accessToken,
    });
    await createTestPet_2({
      csrfToken,
      accessToken,
    });
    await createTestPet_3({
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
    it("task 1 - should user in a subscription and has 3 pets.", async () => {
    
      const { data: result } = await services.api.main.user.viewProfile({
        accessToken,
        csrfToken,
      });
    
      expect(result.pets.length).toBe(3);

      pet1_id = result.pets[0].id;
      pet2_id = result.pets[1].id;
      pet3_id = result.pets[2].id;
    });
  });

  describe("Upload Report and Confirm Upload", () => {
    it("task 2 - should storage usage increase after confirm upload.", async () => {

      // update file to different bucket. (all are same file with size "12904")
     
        const { fileSize: size1 } = await uploadBloodBloodReport(pet1_id);
        const { fileSize: size2 } = await uploadAppointmentRecord(pet2_id);
        const { fileSize: size3 } = await uploadVaccineRecord(pet3_id);

        expect(size1).toBe(12904);
        expect(size2).toBe(12904);
        expect(size3).toBe(12904);
    

      // view usage , should be empty as not confirm from client
      // Update 7 July 2025. We no longer using "Confirm" mechanism
      // Client need not to update the storage infor. backend will handle it
      // const { data } = await services.api.main.document.viewStorageUsage({
      //   accessToken,
      //   csrfToken,
      // });

      // expect(data).toEqual([]);

      // confirm

    //   await services.api.main.document.updateStorageUsage({
    //     accessToken,
    //     csrfToken,
    //     petId: pet1_id,
    //     fileCount: 1,
    //     usage: size1,
    //     documentType: "BLOOD_REPORT",
    //   });
   
    //   await services.api.main.document.updateStorageUsage({
    //     accessToken,
    //     csrfToken,
    //     petId: pet2_id,
    //     fileCount: 1,
    //     usage: size2,
    //     documentType: "APPOINTMENT_RECORD",
    //   });

    //   await services.api.main.document.updateStorageUsage({
    //     accessToken,
    //     csrfToken,
    //     petId: pet3_id,
    //     fileCount: 1,
    //     usage: size3,
    //     documentType: "VACCINE_RECORD",
    //   });

    //   // view usage , should be empty as not confirm from client
    //   const { data: data2 } = await services.api.main.document.viewStorageUsage(
    //     {
    //       accessToken,
    //       csrfToken,
    //     }
    //   );

    //   expect(data2.length).toBe(3);

    //   const pet1_usage = data2.find((usage) => usage.petId === pet1_id);
    //   const pet2_usage = data2.find((usage) => usage.petId === pet2_id);
    //   const pet3_usage = data2.find((usage) => usage.petId === pet3_id);

    

    //   expect(pet1_usage!.BLOOD_REPORT.usage).toBe(size1);
    //   expect(pet1_usage!.BLOOD_REPORT.fileCount).toBe(1);
    //   expect(pet1_usage!.APPOINTMENT_RECORD.usage).toBe(0);
    //   expect(pet1_usage!.VACCINE_RECORD.usage).toBe(0);

    //   expect(pet2_usage!.BLOOD_REPORT.usage).toBe(0);
    //   expect(pet2_usage!.APPOINTMENT_RECORD.usage).toBe(size2);
    //   expect(pet2_usage!.APPOINTMENT_RECORD.fileCount).toBe(1);
    //   expect(pet2_usage!.VACCINE_RECORD.usage).toBe(0);

    //   expect(pet3_usage!.BLOOD_REPORT.usage).toBe(0);
    //   expect(pet3_usage!.APPOINTMENT_RECORD.usage).toBe(0);
    //   expect(pet3_usage!.VACCINE_RECORD.usage).toBe(size3);
    //   expect(pet3_usage!.VACCINE_RECORD.fileCount).toBe(1);
    })
  });

  describe("Sync with storage", () => {
 
    it("task 3 - should correct the incorrect  data after sync with storage actual use", async () => {
      // mess with wrong data
      await services.api.main.document.updateStorageUsage({
        accessToken,
        csrfToken,
        petId: pet1_id,
        fileCount: 100,
        usage: 1000,
        documentType: "BLOOD_REPORT",
      });

      await services.api.main.document.updateStorageUsage({
        accessToken,
        csrfToken,
        petId: pet2_id,
        fileCount: 200,
        usage: 2000,
        documentType: "APPOINTMENT_RECORD",
      });

      await services.api.main.document.updateStorageUsage({
        accessToken,
        csrfToken,
        petId: pet3_id,
        fileCount: 300,
        usage: 3000,
        documentType: "VACCINE_RECORD",
      });

      // view usage , should be empty as not confirm from client
      const { data } = await services.api.main.document.viewStorageUsage(
        {
          accessToken,
          csrfToken,
        }
      );

      expect(data.length).toBe(3);

      let pet1_usage = data.find((usage) => usage.petId === pet1_id);
      let pet2_usage = data.find((usage) => usage.petId === pet2_id);
      let pet3_usage = data.find((usage) => usage.petId === pet3_id);

      expect(pet1_usage!.BLOOD_REPORT.fileCount).toBe(100);
      expect(pet1_usage!.BLOOD_REPORT.usage).toBe(1000);
      expect(pet1_usage!.APPOINTMENT_RECORD.usage).toBe(0);
      expect(pet1_usage!.VACCINE_RECORD.usage).toBe(0);

      expect(pet2_usage!.BLOOD_REPORT.usage).toBe(0);
      expect(pet2_usage!.APPOINTMENT_RECORD.fileCount).toBe(200);
      expect(pet2_usage!.APPOINTMENT_RECORD.usage).toBe(2000);
      expect(pet2_usage!.VACCINE_RECORD.usage).toBe(0);

      expect(pet3_usage!.BLOOD_REPORT.usage).toBe(0);
      expect(pet3_usage!.APPOINTMENT_RECORD.usage).toBe(0);
      expect(pet3_usage!.VACCINE_RECORD.fileCount).toBe(300);
      expect(pet3_usage!.VACCINE_RECORD.usage).toBe(3000);


     
      // sync with database
      await services.api.main.document.syncStorageUsage({
        petIds:[pet1_id,pet2_id,pet3_id],
        accessToken,
        csrfToken,
      });
   





      // view usage again, should be same as previous test
      const { data: data2 } = await services.api.main.document.viewStorageUsage(
        {
          accessToken,
          csrfToken,
        }
      );

      expect(data2.length).toBe(3);

      pet1_usage = data2.find((usage) => usage.petId === pet1_id);
      pet2_usage = data2.find((usage) => usage.petId === pet2_id);
      pet3_usage = data2.find((usage) => usage.petId === pet3_id);

      expect(pet1_usage!.BLOOD_REPORT.usage).toBe(12904);
      expect(pet1_usage!.BLOOD_REPORT.fileCount).toBe(1);
      expect(pet1_usage!.APPOINTMENT_RECORD.usage).toBe(0);
      expect(pet1_usage!.VACCINE_RECORD.usage).toBe(0);

      expect(pet2_usage!.BLOOD_REPORT.usage).toBe(0);
      expect(pet2_usage!.APPOINTMENT_RECORD.usage).toBe(12904);
      expect(pet2_usage!.APPOINTMENT_RECORD.fileCount).toBe(1);
      expect(pet2_usage!.VACCINE_RECORD.usage).toBe(0);

      expect(pet3_usage!.BLOOD_REPORT.usage).toBe(0);
      expect(pet3_usage!.APPOINTMENT_RECORD.usage).toBe(0);
      expect(pet3_usage!.VACCINE_RECORD.usage).toBe(12904);
      expect(pet3_usage!.VACCINE_RECORD.fileCount).toBe(1);
    });
  });
});


