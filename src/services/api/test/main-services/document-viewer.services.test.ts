/**
 *  Run it solely :
 *  jest src/services/api/test/main-services/document-viewer.services.test.ts
 */

import { expect } from "@jest/globals";
import  {services} from '../../..'
import {createDummyAiDiagnosisRecord, createTestPet_1, createTestPet_2, deleteUser, enrollFreeSubscription, userLogin } from './helper';
import { mainServices } from '../../modeules/main.services';



describe("documents", () => {
  let accessToken: string = "";
  let csrfToken: string = "";

  let subscriptionId: string;

  let pet1_id: string;
  let pet2_id: string;

  let aiDiagnosisRecord_id: string;

  // for delete created document viewer record
  const documentViewerIds: string[] = [];

  beforeAll(async () => {
    // Sign up
    const tokens = await userLogin();
    accessToken = tokens.accessToken as string;
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

    await createTestPet_1({ accessToken, csrfToken });

    await createTestPet_2({ accessToken, csrfToken });
  });

  afterAll(async () => {
    documentViewerIds.forEach(async (id: string) => {
      await mainServices.documentViewer.delete({ accessToken, csrfToken, id });
    });

    mainServices.document.deleteAiDiagnosisRecord({
      accessToken,
      csrfToken,
      petId: pet1_id,
      reportId: aiDiagnosisRecord_id,
    });

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
      // create ai diagnosis report
      const { data } = await createDummyAiDiagnosisRecord(
        { accessToken, csrfToken },
        pet1_id
      );

      aiDiagnosisRecord_id = data.id;
    });
  });

  //POST  https://main.bevetu.com/v1/document-viewers/documents/{documentId}/viewers
  describe("viewAllByDocumentId()", () => {
    it("test 2 - should be able to see document viewers from document id .", async () => {
      // 1. User 1 view the record
      const { data: documentViewer } = await mainServices.documentViewer.create(
        {
          accessToken,
          csrfToken,
          documentId: aiDiagnosisRecord_id,
          type: "AI_DIAGNOSIS_RECORD" as unknown as DocumentType,
          viewerName: "Peter",
        }
      );

      // 2. Get the viewers of the record by document Id
      const { data: viewerList } =
        await mainServices.documentViewer.viewAllByDocumentId({
          accessToken,
          csrfToken,
          documentId: aiDiagnosisRecord_id,
        });

      expect(viewerList.length).toBe(1);
      documentViewerIds.push(documentViewer.id);
    });
  });

  //POST  https://main.bevetu.com/v1/document-viewers/users/me
  describe("viewAllDocumentsByUserId()",  () => {
    it("test 3 - should return document that the use has viewed.", async () => {
      

      // 1. Create 2 dummy ai diagnosis records
      const dummyRecord_1 = await createDummyAiDiagnosisRecord(
        { accessToken, csrfToken },
        pet1_id
      );

      const dummyRecord_2 = await createDummyAiDiagnosisRecord(
        { accessToken, csrfToken },
        pet2_id
      );

      // 2. user_1 view both dummy records
       const { data: documentViewer_1 } =
         await services.api.main.documentViewer.create({
           accessToken,
           csrfToken,
           documentId: dummyRecord_1.data.id,
           type: "AI_DIAGNOSIS_RECORD" as unknown as DocumentType,
           viewerName: "Peter",
         });

      const { data: documentViewer_2 } =
        await services.api.main.documentViewer.create({
          accessToken,
          csrfToken,
          documentId: dummyRecord_2.data.id,
          type: "AI_DIAGNOSIS_RECORD" as unknown as DocumentType,
          viewerName: "Peter",
        });


      const { data: userHasViewed } =
        await services.api.main.documentViewer.viewAllDocumentsByUserId({
          accessToken,
          csrfToken,
        });

      const { data: count } =
        await services.api.main.documentViewer.viewDoucmentViewerCount({
          accessToken,
          csrfToken,
          documentId: dummyRecord_2.data.id,
        });
      expect(userHasViewed.length).toBe(3);
      expect(count).toBe(1);

      documentViewerIds.push(documentViewer_1.id);
      documentViewerIds.push(documentViewer_2.id);
    });
  });

});
