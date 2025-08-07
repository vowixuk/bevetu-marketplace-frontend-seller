/**
 *  Run it solely :
 *  jest src/services/api/test/main-services/appointment-record.services.test.ts
 */

import  {services} from '../../..'
import { createTestPet_1, createTestPet_2, createTestPet_3, createTestPet_4, deleteUser, enrollFreeSubscription, errorChecker, userLogin } from './helper';
// import { Document } from '.services/api/types/main-services.types';
import * as path from "path";
import * as fs from "fs";
import axios from "axios";

describe("documents", () => {
  let accessToken: string = "";
  let refreshToken: string = "";
  let csrfToken: string = "";

  let subscriptionId: string;
  let appointmentRecord_1: any;

  let uploadReportPreSignedUrl: string;
  let downLoaReportPresignUrl: string;
  let reportNameInStorage_1: string;
  const blood_report_folder_path = "../testing_data/appointment-record";
  let pet1_id: string;
  let pet2_id: string;

  // use in test 13
  let pet3_id: string;
  let pet4_id: string;

  let appointmentRecord1_id: string;
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
  //POST  https://main.bevetu.com/v1/documents/pets/{petId}/appointment-records
  describe("createAppointmentRecord()", () => {
    it("test 2 - should create the appointment record without url fields and with attributes.", async () => {
       const attributes: Document.IAppointmentRecordAttributes = {
         dateOfVisit: "2025-04-28",
         clinicName: "Happy Paws Veterinary Clinic",
         clinicLocation: "123 Pet Street, Petville",
         vetName: "Dr. Sarah Johnson",
         reasonOfVisit: "Annual vaccination and wellness exam",
         diagnosis: "Healthy; no concerns noted",
         prescriptions: [
           {
             medication: "Heartgard Plus",
             dosage: "One chewable tablet monthly",
             duration: "12 months",
           },
         ],
         treatmentDone: "General check-up, deworming",
         followUpInstructions: "Return for booster shot in 3 weeks",
         others: "Pet was calm and cooperative during visit.",
       };


      const response = await services.api.main.document.createAppointmentRecord({
        petId: pet1_id,
        name: "Beyonce appointment Record 1",
        date: new Date(),
        accessToken,
        csrfToken,
        attributes: attributes,
      });

      const { id: documentId } = response.data;
      appointmentRecord1_id = documentId;
      expect(appointmentRecord1_id).toBeDefined();

    });
  });

  //GET  https://main.bevetu.com/v1/documents/pets/{petId}/appointment-records/{reportId}
  describe("viewOneAppointmentRecord()", () => {
    it("test 3 - should view the appointment Record just created.", async () => {
      // same as the test 2 above
      const attributes: Document.IAppointmentRecordAttributes = {
        dateOfVisit: "2025-04-28",
        clinicName: "Happy Paws Veterinary Clinic",
        clinicLocation: "123 Pet Street, Petville",
        vetName: "Dr. Sarah Johnson",
        reasonOfVisit: "Annual vaccination and wellness exam",
        diagnosis: "Healthy; no concerns noted",
        prescriptions: [
          {
            medication: "Heartgard Plus",
            dosage: "One chewable tablet monthly",
            duration: "12 months",
          },
        ],
        treatmentDone: "General check-up, deworming",
        followUpInstructions: "Return for booster shot in 3 weeks",
        others: "Pet was calm and cooperative during visit.",
      };
     
      const { data } = await services.api.main.document.viewOneAppointmentRecord({
        petId: pet1_id,
        reportId: appointmentRecord1_id,
        accessToken,
        csrfToken,
      });
      expect(data.id).toBe(appointmentRecord1_id);
      expect(data.type).toBe("APPOINTMENT_RECORD");
      expect(data.attributes).toEqual(attributes);
    });
  });

  //PATCH  https://main.bevetu.com/v1/documents/pets/{petId}/appointment-records/{reportId}
  describe("updateAppointmentRecord()", () => {
    it("test 4 - should be able to update the fields of the appointment Record.", async () => {
      const attributes2: Document.IAppointmentRecordAttributes = {
        dateOfVisit: "2025-05-10",
        clinicName: "Green Meadow Animal Hospital",
        clinicLocation: "456 Veterinary Lane, Animaltown",
        vetName: "Dr. Michael Lee",
        reasonOfVisit: "Skin irritation and scratching",
        diagnosis: "Mild dermatitis likely due to seasonal allergies",
        prescriptions: [
          {
            medication: "Apoquel",
            dosage: "16 mg tablet once daily",
            duration: "14 days",
          },
          {
            medication: "Medicated Shampoo",
            dosage: "Bath every 3 days",
            duration: "2 weeks",
          },
        ],
        treatmentDone: "Skin examination, allergy test performed",
        followUpInstructions: "Recheck skin condition after 2 weeks",
        others: "Advised owner to monitor diet and environmental triggers.",
      };

     
      await services.api.main.document.updateAppointmentRecord({
        petId: pet1_id,
        reportId: appointmentRecord1_id,
        accessToken,
        csrfToken,
        name: "updated report name",
        attributes: attributes2,
        date: new Date(),
      });

      const { data } = await services.api.main.document.viewOneAppointmentRecord({
        petId: pet1_id,
        reportId: appointmentRecord1_id,
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
    //   const attributes2: Document.IAppointmentRecordAttributes = {
    //     dateOfVisit: "2025-05-10",
    //     clinicName: "Green Meadow Animal Hospital",
    //     clinicLocation: "456 Veterinary Lane, Animaltown",
    //     vetName: "Dr. Michael Lee",
    //     reasonOfVisit: "Skin irritation and scratching",
    //     diagnosis: "Mild dermatitis likely due to seasonal allergies",
    //     prescriptions: [
    //       {
    //         medication: "Apoquel",
    //         dosage: "16 mg tablet once daily",
    //         duration: "14 days",
    //       },
    //       {
    //         medication: "Medicated Shampoo",
    //         dosage: "Bath every 3 days",
    //         duration: "2 weeks",
    //       },
    //     ],
    //     treatmentDone: "Skin examination, allergy test performed",
    //     followUpInstructions: "Recheck skin condition after 2 weeks",
    //     others: "Advised owner to monitor diet and environmental triggers.",
    //   };

    //   const attributes3: Partial<Document.IAppointmentRecordAttributes> = {
    //     treatmentDone: "Skin examination, allergy test performed",
    //     prescriptions: [
    //       {
    //         medication: "Apoquel 2 ",
    //         dosage: "16 mg tablet once daily 2 ",
    //         duration: "19 days" ,
    //       }]
    //   };
    //   await services.api.main.document.updateAppointmentRecord({
    //     petId: pet1_id,
    //     reportId: appointmentRecord1_id,
    //     accessToken,
    //     csrfToken,
    //     name: "updated report name 3",
    //     attributes:attributes3,

    //   });

    //   const { data } = await services.api.main.document.viewOneAppointmentRecord({
    //     petId: pet1_id,
    //     reportId: appointmentRecord1_id,
    //     accessToken,
    //     csrfToken,
    //   });
    //   expect(data.name).toBe("updated report name 3");
    //   expect(data.attributes).toEqual({...attributes2, ...attributes3});

    // });
    it("test 6 - should be able to update without attribute fields.", async () => {
      await services.api.main.document.updateAppointmentRecord({
        petId: pet1_id,
        reportId: appointmentRecord1_id,
        accessToken,
        csrfToken,
        name: "updated report name test 6",
      });

      const { data } = await services.api.main.document.viewOneAppointmentRecord({
        petId: pet1_id,
        reportId: appointmentRecord1_id,
        accessToken,
        csrfToken,
      });
      expect(data.name).toBe("updated report name test 6");
    });
    it("test 7 - should return 400 if attributes not correct.", async () => {
      try {
        // test set attributes but set it as "null"
        const attributes = null;
        await services.api.main.document.updateAppointmentRecord({
          petId: pet1_id,
          reportId: appointmentRecord1_id,
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
          // appointmentNsfgsafsdfsafdgame: '',
          // // dosageUnit: "",
          diagnosis: 123,
        };
        await services.api.main.document.updateAppointmentRecord({
          petId: pet1_id,
          reportId: appointmentRecord1_id,
          accessToken,
          csrfToken,
          name: "updated report test 7",
          //@ts-ignore
          attributes: attributes2,
        });
      } catch (error: any) {

        const { response } = error; 
        // eslint-disable-next-line jest/no-conditional-expect
        console.log(error, "<< error");
        // eslint-disable-next-line jest/no-conditional-expect
        expect(response.status).toBe(400); 
      }

      // did not set attributes. Test if undefined is allowed. It should be fine

      const response = await services.api.main.document.updateAppointmentRecord({
        petId: pet1_id,
        reportId: appointmentRecord1_id,
        accessToken,
        csrfToken,
      });
      expect(response.status).toBe(200);
    });
  });

  //GET  https://main.bevetu.com/v1/documents/pets/{petId}/appointment-records
  describe("viewAllappointmentRecords()", () => {
    it("test 8 - should be able to view all appointment Record.", async () => {
      const attributes: Document.IAppointmentRecordAttributes = {
        dateOfVisit: "2025-05-10",
        clinicName: "Green Meadow Animal Hospital",
        clinicLocation: "456 Veterinary Lane, Animaltown",
        vetName: "Dr. Michael Lee",
        reasonOfVisit: "Skin irritation and scratching",
        diagnosis: "Mild dermatitis likely due to seasonal allergies",
   
      };;
      // create 19 reports, total 20 (include the one created in above test)
      for (let i = 0; i < 19; i++) {
        await services.api.main.document.createAppointmentRecord({
          petId: pet1_id,
          name: `Report ${i}`,
          date: new Date(),
          accessToken,
          csrfToken,
          attributes
        });
      }

      const { data: result_1 } =
        await services.api.main.document.viewAllAppointmentRecords({
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
        await services.api.main.document.viewAllAppointmentRecords({
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

  //DELETE  https://main.bevetu.com/v1/documents/pets/{petId}/appointment-records/{reportId}
  describe("deleteappointmentRecord()", () => {
    it("test 9 - should be able to delete a appointment record.", async () => {
      await services.api.main.document.deleteAppointmentRecord({
        petId: pet1_id,
        accessToken,
        csrfToken,
        reportId: report_to_delete_id,
      });

      const { data: result_1 } =
        await services.api.main.document.viewAllAppointmentRecords({
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
    it("test 10 - should be able to get the upload appointment record presigned url", async () => {
      const fileName = "appointment-record-1.png";

      const { data } = await services.api.main.document.getUploadPresignedUrl({
        petId: pet1_id,
        documentType: "APPOINTMENT_RECORD",
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

    it("test 11 - should be able to upload the appointment Record to Storage after fetching the presigned url", async () => {
      const pathToDocument = path.join(
        __dirname,
        blood_report_folder_path,
       "appointment-record-1.png"
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

    it("test 12 - should be able to update the url field of the appointment Record.", async () => {
      await services.api.main.document.updateAppointmentRecord({
        petId: pet1_id,
        reportId: appointmentRecord1_id,
        accessToken,
        csrfToken,
        url: reportNameInStorage_1,
      });

      const { data } = await services.api.main.document.viewOneAppointmentRecord({
        petId: pet1_id,
        reportId: appointmentRecord1_id,
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
          documentType: "APPOINTMENT_RECORD",
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
      await services.api.main.document.updateAppointmentRecord({
        petId: pet1_id,
        reportId: appointmentRecord1_id,
        accessToken,
        csrfToken,
        url: null,
      });

      const { data } = await services.api.main.document.viewOneAppointmentRecord({
        petId: pet1_id,
        reportId: appointmentRecord1_id,
        accessToken,
        csrfToken,
      });
      expect(data.url).toBeNull();
    });
  });

});


