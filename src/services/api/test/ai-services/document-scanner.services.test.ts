/* eslint-disable jest/no-jasmine-globals */
/* eslint-disable jest/no-conditional-expect */
/**
 *  Run it solely :
 *  jest src/services/api/test/ai-services/document-scanner.services.test.ts
 */
import { expect } from "@jest/globals";
import {services} from '../../..'
import {createTestPet_1, createTestPet_2, createTestPet_3, createTestPet_4, deleteUser, enrollFreeSubscription, errorChecker, userLogin } from '../main-services/helper';
import * as path from "path";
import * as fs from "fs";
import FormData from "form-data";


describe("document-scanner", () => {
  let accessToken: string = "";
  // let refreshToken: string = "";
  let csrfToken: string = "";
  let blood_report_folder_path =
    "../testing_data/blood-report";

  let subscriptionId: string;
  let pet1_id: string;
  let pet2_id: string;
  let pet3_id: string;
  let pet4_id: string;
  let pet5_id: string;

  let pet1_subscriptionId: string;
  let pet2_subscriptionId: string;
  let pet3_subscriptionId: string;
  let pet4_subscriptionId: string;
  let pet5_subscriptionId: string;


  // change the date string to date object
  function toDate(value: Date | string): Date  {
    
    if (value instanceof Date) return value;
    // if string, try to parse it
    return  new Date(value);

  }

  async function bloodReportScann(pet1_id, pet1_subscriptionId) {
    const pathToImage = path.join(
      __dirname,
      blood_report_folder_path,
      "blood-report-6.pdf"
    );
    const fileStream = fs.createReadStream(pathToImage);
    const formData = new FormData();
    formData.append("document", fileStream, "blood-report.jpg");
    formData.append("petId", pet1_id);
    formData.append("serviceSubscriptionId", pet1_subscriptionId);

    const { data } = await services.api.ai.documentScanner.scanBloodReport({
      formData: formData,
      accessToken,
      csrfToken,
    });

    return data
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

    // Create pets
    await createTestPet_1({ accessToken, csrfToken });
    await createTestPet_2({ accessToken, csrfToken });
    await createTestPet_3({ accessToken, csrfToken });
    await createTestPet_4({ accessToken, csrfToken });
    await createTestPet_1({ accessToken, csrfToken });

    // Set Pet Id
    const { data } = await services.api.main.user.viewProfile({
      accessToken,
      csrfToken,
    });

    expect(data.pets.length).toBe(5);

    pet1_id = data.pets[0].id;
    pet2_id = data.pets[1].id;
    pet3_id = data.pets[2].id;
    pet4_id = data.pets[3].id;
    pet5_id = data.pets[4].id;

  });

  afterAll(async () => {
    await deleteUser({
      accessToken,
      csrfToken,
    });
  });

  describe("Check if Service Subscription Created", () => {
    it("task 1 -  should service subscription created when pet accounts are created", async () => {
     
      const { data: servicesSubscriptions } =
        await services.api.ai.documentScanner.viewAllServiceSubscriptionByUserId(
        {  accessToken,
          csrfToken,}
        );

      expect(servicesSubscriptions.length).toBe(5);
      servicesSubscriptions.forEach((sub) =>{
        expect(sub.status).toBe('ACTIVE');
        expect(sub.unlimitedUse).toBe(true);
      })

      pet1_id = servicesSubscriptions[0].petId;
      pet2_id = servicesSubscriptions[1].petId;
      pet3_id = servicesSubscriptions[2].petId;
      pet4_id = servicesSubscriptions[3].petId;
      pet5_id = servicesSubscriptions[4].petId;

      pet1_subscriptionId = servicesSubscriptions[0].id;
      pet2_subscriptionId = servicesSubscriptions[1].id;
      pet3_subscriptionId = servicesSubscriptions[2].id;
      pet4_subscriptionId = servicesSubscriptions[3].id;
      pet5_subscriptionId = servicesSubscriptions[4].id;  
    });
  });

  // GET  https://main.bevetu.com/v1/document-scanner
  describe("serverHealthCheck()", () => {
    it("test 2 - should BVA-01 is running", async () => {
      const response =
        await services.api.ai.documentScanner.serverHealthCheck({
          accessToken,
          csrfToken,
          key: 'testing'
        });
      expect(response.data).toBe("OK");
    });
  });

  describe("updateServiceSubscription()", () => {
    // expired the _sub1 and _sub5 nextResetDate to 1 month abefore
    const expiredDate = new Date();
    expiredDate.setMonth(expiredDate.getMonth() - 1);

    it("test 3 - update all five service subscriptions", async () => {
      // sub 1 - `limited`, `status=active`, `limit=4`, `nextResetDate='one month ago`

      await services.api.ai.documentScanner.updateServiceSubscription({
        petId: pet1_id,
        serviceSubscriptionId: pet1_subscriptionId,
        usageLimit: 4,
        unlimitedUse: false,
        nextResetDate: expiredDate,
        accessToken,
        csrfToken,
      });

      // sub 2 - `limited`,`status=active`, `limit=4`, `usage=4`
      await services.api.ai.documentScanner.updateServiceSubscription({
        petId: pet2_id,
        serviceSubscriptionId: pet2_subscriptionId,
        usageLimit: 4,
        usageCount: 4,
        unlimitedUse: false,
        accessToken,
        csrfToken,
      });

      // sub 3 - `limited`,`status=active`, `limit=4`, `usage=4`,`nextResetDate='one month ago`
      await services.api.ai.documentScanner.updateServiceSubscription({
        petId: pet3_id,
        serviceSubscriptionId: pet3_subscriptionId,
        usageLimit: 4,
        usageCount: 4,
        unlimitedUse: false,
        nextResetDate: expiredDate,
        accessToken,
        csrfToken,
      });

      // sub 4 - `limited`,`status=inactive`, `limit=4`, `nextResetDate='one month ago`
      await services.api.ai.documentScanner.updateServiceSubscription({
        petId: pet4_id,
        serviceSubscriptionId: pet4_subscriptionId,
        usageLimit: 4,
        usageCount: 3,
        unlimitedUse: false,
        status: "INACTIVE",
        nextResetDate: expiredDate,
        accessToken,
        csrfToken,
      });

      // sub 5 -  only `nextResetDate='one month ago`. keep it unlimited
      await services.api.ai.documentScanner.updateServiceSubscription({
        petId: pet5_id,
        serviceSubscriptionId: pet5_subscriptionId,
        nextResetDate: expiredDate,
        accessToken,
        csrfToken,
      });

      // Get all the updated service subscription
      const { data: servicesSubscriptions } =
        await services.api.ai.documentScanner.viewAllServiceSubscriptionByUserId(
          { accessToken, csrfToken }
        );

      // find the target subscripions
      const sub1 = servicesSubscriptions.find(
        (sub) => sub.id === pet1_subscriptionId
      );

      const sub2 = servicesSubscriptions.find(
        (sub) => sub.id === pet2_subscriptionId
      );

      const sub3 = servicesSubscriptions.find(
        (sub) => sub.id === pet3_subscriptionId
      );

      const sub4 = servicesSubscriptions.find(
        (sub) => sub.id === pet4_subscriptionId
      );

      const sub5 = servicesSubscriptions.find(
        (sub) => sub.id === pet5_subscriptionId
      );

      // Checking:
      // sub 1 - `limited`, `status=active`, `limit=4`, `nextResetDate='one month ago`
      expect(sub1?.unlimitedUse).toBe(false);
      expect(sub1?.status).toBe("ACTIVE");
      expect(sub1?.usageLimit).toBe(4);
      expect(sub1?.nextResetDate).toBe(expiredDate.toISOString());

      // sub 2 - `limited`,`status=active`, `limit=4`
      expect(sub2?.unlimitedUse).toBe(false);
      expect(sub2?.status).toBe("ACTIVE");
      expect(sub2?.usageCount).toBe(4);
      expect(sub2?.usageLimit).toBe(4);
      expect(sub2?.nextResetDate).not.toBe(expiredDate.toISOString());

      // sub 3 - `limited`,`status=active`, `limit=4`, `usage=4`,`nextResetDate='one month ago`
      expect(sub3?.unlimitedUse).toBe(false);
      expect(sub3?.status).toBe("ACTIVE");
      expect(sub3?.usageLimit).toBe(4);
      expect(sub3?.usageCount).toBe(4);
      expect(sub3?.nextResetDate).toBe(expiredDate.toISOString());

      // sub 4 - `limited`,`status=inactive`, `limit=4`, `nextResetDate='one month ago`
      expect(sub4?.unlimitedUse).toBe(false);
      expect(sub4?.status).toBe("INACTIVE");
      expect(sub4?.usageCount).toBe(3);
      expect(sub4?.usageLimit).toBe(4);
      expect(sub4?.nextResetDate).toBe(expiredDate.toISOString());

      // sub 5 -  only `nextResetDate='one month ago`. keep it unlimited
      expect(sub5?.unlimitedUse).toBe(true);
      expect(sub5?.status).toBe("ACTIVE");
      expect(sub5?.nextResetDate).toBe(expiredDate.toISOString());
    });
  });

  describe("Status change with pet account status", () => {
    it("test 4 - should service subscription be inactivate if pet account is inactivate", async () => {
      // Get all the updated service subscription
      const { data: servicesSubscriptions } =
        await services.api.ai.documentScanner.viewAllServiceSubscriptionByUserId(
          { accessToken, csrfToken }
        );

      // find the  subscripions 1
      let sub1 = servicesSubscriptions.find(
        (sub) => sub.id === pet1_subscriptionId
      );

      expect(sub1?.status).toBe("ACTIVE");

      // inactivate the pet account
      await services.api.main.pet.softDelete({
        accessToken,
        csrfToken,
        petId: pet1_id,
      });
      // wait a while
      await new Promise((r) => setTimeout(r, 500)); 
      // Get all the updated service subscription again
      const { data: servicesSubscriptions2 } =
        await services.api.ai.documentScanner.viewAllServiceSubscriptionByUserId(
          { accessToken, csrfToken }
        );

      // find the  subscripions 1
      sub1 = servicesSubscriptions2.find(
        (sub) => sub.id === pet1_subscriptionId
      );

      expect(sub1?.status).toBe("INACTIVE");
      expect(sub1?.eventRecords[1].type).toBe("INACTIVATE");
    })
    it("test 5 - should service subscription be activate if pet account is activate", async () => {
      // activate the pet account
      await services.api.main.pet.reactivate({
        accessToken,
        csrfToken,
        petId: pet1_id,
      });

      // wait a while
      await new Promise((r) => setTimeout(r, 500));
      
      // Get all the updated service subscription again
      const { data: servicesSubscriptions2 } =
        await services.api.ai.documentScanner.viewAllServiceSubscriptionByUserId(
          { accessToken, csrfToken }
        );

      // find the  subscripions 1
      const sub1 = servicesSubscriptions2.find(
        (sub) => sub.id === pet1_subscriptionId
      );

      expect(sub1?.status).toBe("ACTIVE");
      expect(sub1?.eventRecords[1].type).toBe("INACTIVATE");
      expect(sub1?.eventRecords[2].type).toBe("REACTIVATE");
    });
  })

  describe("Access control", () => {
    // sub 1 - `limited`, `status=active`, `limit=4`, `nextResetDate='one month ago` , `usage=0`
    // sub 2 - `limited`,`status=active`, `limit=4`, `usage=4`
    // sub 3 - `limited`,`status=active`, `limit=4`, `usage=4`,`nextResetDate='one month ago`
    // sub 4 - `limited`,`status=inactive`, `limit=4`, `nextResetDate='one month ago`, `usage=0`
    // sub 5 -  only `nextResetDate='one month ago`. keep it unlimited, `usage=0`

    // sub 2 and 4 should not be able to access scanBloodReport() function
    it("Task 6 - should accessing to scanBloodReport() be not allowed for ineligible subscriptions", async () => {
      // sub2  - Reach usage limited
      try {
        await bloodReportScann(pet2_id, pet2_subscriptionId);
        fail("Expected UnprocessableEntityException");
      } catch (e) {
        const { data } = e.response;
        expect(data.statusCode).toBe(422);
        expect(data.message).toBe("Usage limit has been reached.");
      }

      // sub 4 - Subscription is inactivate
      try {
        await bloodReportScann(pet4_id, pet4_subscriptionId);
        fail("Expected UnprocessableEntityException");
      } catch (e) {
        const { data } = e.response;
        expect(data.statusCode).toBe(409);
        expect(data.message).toBe("The subscription is inactive.");
      }
    });
  })

  // POST  https://main.bevetu.com/v1/document-scanner/blood-reports
  describe("blood-reports()", () => {
    // sub 1 - `limited`, `status=active`, `limit=4`, `nextResetDate='one month ago` , `usage=0`
    // sub 5 -  only `nextResetDate='one month ago`. keep it unlimited, `usage=0`

    // use sub 1 and sub 5 

    it("Task 3 - should return extracted blood-reports data", async () => {
      // Trigger blood report scan
      let data = await bloodReportScann(pet1_id, pet1_subscriptionId);
      expect(data.images).toBeDefined();
      expect(data.data).toBeDefined();

      data = await bloodReportScann(pet5_id, pet5_subscriptionId);
      expect(data.images).toBeDefined();
      expect(data.data).toBeDefined();

      // Re-fetch the service subscriptions
      const { data: servicesSubscriptions2 } =
        await services.api.ai.documentScanner.viewAllServiceSubscriptionByUserId(
          { accessToken, csrfToken }
        );

      // Checking
      const sub1 = servicesSubscriptions2.find(
        (sub) => sub.id === pet1_subscriptionId
      );

      const sub5 = servicesSubscriptions2.find(
        (sub) => sub.id === pet5_subscriptionId
      );

      const sub1UsageEventRecords = sub1?.eventRecords.find(
        (event) => event.type === "USAGE"
      );
      const sub5UsageEventRecords = sub5?.eventRecords.find(
        (event) => event.type === "USAGE"
      );

      expect(sub1?.usageCount).toBe(1);
      expect(sub1UsageEventRecords?.type).toBe("USAGE");

      expect(sub5?.usageCount).toBe(0);
      expect(sub5UsageEventRecords?.type).toBe("USAGE");
    });

    describe("reset the usage", () => {
      // sub 1 - `limited`, `status=active`, `limit=4`, `usage=1 (updated in previous test)`, `nextResetDate='one month ago` ,  <<< ** reset
      // sub 2 - `limited`,`status=active`, `limit=4`, `usage=4` <<<< ** not reset . not expired
      // sub 3 - `limited`,`status=active`, `limit=4`, `usage=4`,`nextResetDate='one month ago` <<< ** reset
      // sub 4 - `limited`,`status=inactive`, `limit=4`, `nextResetDate='one month ago`, `usage=3`  <<<< ** not reset . inactive
      // sub 5 -  only `nextResetDate='one month ago`. keep it unlimited, `usage=0`  <<<< ** not reset . unlimited

      it("Task 3 - should reset the usage of service subscription that are `active`,`limited` and `nextResetDate` expired", async () => {
      
        await services.api.ai.documentScanner.resetAllServiceSubscriptionUsage({
          accessToken,
          csrfToken,
        });

        // Get all the updated service subscription
        const { data: servicesSubscriptions } =
          await services.api.ai.documentScanner.viewAllServiceSubscriptionByUserId(
            { accessToken, csrfToken }
          );

        // find the target subscripions
        const sub1 = servicesSubscriptions.find(
          (sub) => sub.id === pet1_subscriptionId
        );

        const sub2 = servicesSubscriptions.find(
          (sub) => sub.id === pet2_subscriptionId
        );

        const sub3 = servicesSubscriptions.find(
          (sub) => sub.id === pet3_subscriptionId
        );

        const sub4 = servicesSubscriptions.find(
          (sub) => sub.id === pet4_subscriptionId
        );

        const sub5 = servicesSubscriptions.find(
          (sub) => sub.id === pet5_subscriptionId
        );

        const newExpiredDate = new Date();
        newExpiredDate.setMonth(newExpiredDate.getMonth() + 1);

        // Checking:
        // sub 1 - `limited`, `status=active`, `limit=4`, `usage=1 (updated in previous test)`, `nextResetDate='one month ago` ,  <<< ** reset
       
        const sub1UsageEventRecords = sub1?.eventRecords.find(
          (event) => event.type === "RESET_USAGE"
        );
       
        expect(sub1?.unlimitedUse).toBe(false);
        expect(sub1?.status).toBe("ACTIVE");
        expect(sub1?.usageLimit).toBe(4);
        expect(sub1?.usageCount).toBe(0);
        expect(toDate(sub1!.nextResetDate).toISOString().slice(0, 10)).toBe(
          newExpiredDate.toISOString().slice(0, 10)
        );
        expect(sub1UsageEventRecords!.type).toBe("RESET_USAGE");

        // sub 2 - `limited`,`status=active`, `limit=4`, `usage=4` <<<< ** not reset . not expired
        expect(sub2?.unlimitedUse).toBe(false);
        expect(sub2?.status).toBe("ACTIVE");
        expect(sub2?.usageCount).toBe(4);
        expect(sub2?.usageLimit).toBe(4);
        expect(toDate(sub2!.nextResetDate).toISOString().slice(0, 10)).toBe(
          newExpiredDate.toISOString().slice(0, 10)
        );

        //sub 3 - `limited`,`status=active`, `limit=4`, `usage=4`,`nextResetDate='one month ago` <<< ** reset
        const sub3UsageEventRecords = sub3?.eventRecords.find(
          (event) => event.type === "RESET_USAGE"
        );
       
        expect(sub3?.unlimitedUse).toBe(false);
        expect(sub3?.status).toBe("ACTIVE");
        expect(sub3?.usageLimit).toBe(4);
        expect(sub3?.usageCount).toBe(0);
        expect(toDate(sub3!.nextResetDate).toISOString().slice(0, 10)).toBe(
          newExpiredDate.toISOString().slice(0, 10)
        );
        expect(sub3UsageEventRecords!.type).toBe("RESET_USAGE");

        // sub 4 - `limited`,`status=inactive`, `limit=4`, `nextResetDate='one month ago`, `usage=3`  <<<< **
        expect(sub4?.unlimitedUse).toBe(false);
        expect(sub4?.status).toBe("INACTIVE");
        expect(sub4?.usageCount).toBe(3);
        expect(sub4?.usageLimit).toBe(4);
        expect(toDate(sub4!.nextResetDate).toISOString().slice(0, 10)).not.toBe(
          newExpiredDate.toISOString().slice(0, 10)
        );

        // sub 5 -  only `nextResetDate='one month ago`. keep it unlimited, `usage=0`  <<<< ** not reset . unlimited
        expect(sub5?.unlimitedUse).toBe(true);
        expect(sub5?.status).toBe("ACTIVE");
        expect(toDate(sub5!.nextResetDate).toISOString().slice(0, 10)).not.toBe(
          newExpiredDate.toISOString().slice(0, 10)
        );

        console.log(sub1?.eventRecords, "<< sub1 event record>>");
        console.log(servicesSubscriptions, "<< servicesSubscriptions");
      });
    })
  });
});


