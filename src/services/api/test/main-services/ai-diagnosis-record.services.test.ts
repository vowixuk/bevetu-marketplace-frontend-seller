/**
 *  Run it solely :
 *  jest src/services/api/test/main-services/ai-diagnosis-record.services.test.ts
 */
import { expect } from "@jest/globals";
import  {services} from '../../..'
import { createTestPet_1, createTestPet_2, createTestPet_3, createTestPet_4, deleteUser, enrollFreeSubscription, errorChecker, userLogin } from './helper';
import { Document } from '../../types/main-services.types';
import { mainServices } from "../../modeules/main.services";
import axios from "axios";

describe("documents", () => {
  let accessToken: string = "";

  let csrfToken: string = "";

  let subscriptionId: string;

  let pet1_id: string;

  let aiDiagnosisRecord1_id: string;
  let report_to_delete_id: string;
  let userEmail: string

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

  describe.only("Setting Check", () => {
    it("task 1 - should user in a subscription and has 2 pets.", async () => {
      const { data: result } = await services.api.main.user.viewProfile({
        accessToken,
        csrfToken,
      });
      expect(result.pets.length).toBe(2);
      expect(result.subscription?.seatNo).toBe(2);

      userEmail = result.email;
      pet1_id = result.pets[0].id;
      // pet2_id = result.pets[1].id;
    });
  });
  //POST  https://main.bevetu.com/v1/documents/pets/{petId}/ai-diagnosis-records
  describe("createAiDiagnosisRecord()", () => {
    it("test 2 - should create the ai diagnosis record  with attributes.", async () => {
      const attributes: Document.IAiDiagnosisRecordAttributes =
        dummyAttribute1();

      const response = await services.api.main.document.createAiDiagnosisRecord(
        {
          petId: pet1_id,
          name: "Beyonce ai diagnosis Record 1",
          date: new Date(),
          accessToken,
          csrfToken,
          attributes: attributes,
        }
      );

      const { id: documentId } = response.data;
      aiDiagnosisRecord1_id = documentId;
      expect(aiDiagnosisRecord1_id).toBeDefined();
    });
  });

  //GET  https://main.bevetu.com/v1/documents/pets/{petId}/ai-diagnosis-records/{reportId}
  describe("viewOneAiDiagnosisRecord()", () => {
    it("test 3 - should view the ai diagnosis Record just created.", async () => {
      // same as the test 2 above
      const attributes: Document.IAiDiagnosisRecordAttributes =
        dummyAttribute1();

      const { data } =
        await services.api.main.document.viewOneAiDiagnosisRecord({
          petId: pet1_id,
          reportId: aiDiagnosisRecord1_id,
          accessToken,
          csrfToken,
        });
      expect(data.id).toBe(aiDiagnosisRecord1_id);
      expect(data.type).toBe("AI_DIAGNOSIS_RECORD");
      expect(data.attributes).toEqual(attributes);
    });
  });

  //PATCH  https://main.bevetu.com/v1/documents/pets/{petId}/ai-diagnosis-records/{reportId}
  describe("updateAiDiagnosisRecord()", () => {
    it("test 4 - should be able to update the fields to other value.", async () => {
      const attributes2: Document.IAiDiagnosisRecordAttributes =
        dummyAttribute2();

      await services.api.main.document.updateAiDiagnosisRecord({
        petId: pet1_id,
        reportId: aiDiagnosisRecord1_id,
        accessToken,
        csrfToken,
        name: "updated report name",
        attributes: {
          test_analysis: [],
          medical_issues: [],
          physical_examinations: [],
          next_steps: [],
        },
        date: new Date(),
      });

      const { data } =
        await services.api.main.document.viewOneAiDiagnosisRecord({
          petId: pet1_id,
          reportId: aiDiagnosisRecord1_id,
          accessToken,
          csrfToken,
        });

      expect(data.name).toBe("updated report name");
      // expect(data.attributes).toEqual(attributes2);
    });

    it("test 6 - should be able to update without attribute fields.", async () => {
      await services.api.main.document.updateAiDiagnosisRecord({
        petId: pet1_id,
        reportId: aiDiagnosisRecord1_id,
        accessToken,
        csrfToken,
        name: "updated report name test 6",
      });

      const { data } =
        await services.api.main.document.viewOneAiDiagnosisRecord({
          petId: pet1_id,
          reportId: aiDiagnosisRecord1_id,
          accessToken,
          csrfToken,
        });

      expect(data.name).toBe("updated report name test 6");
    });

    it("test 7 - should return 400 if attributes not correct.", async () => {
      try {
        // test set attributes but set it as "null"
        const attributes = null;
        await services.api.main.document.updateAiDiagnosisRecord({
          petId: pet1_id,
          reportId: aiDiagnosisRecord1_id,
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
          diagnosis: 123,
        };
        await services.api.main.document.updateAiDiagnosisRecord({
          petId: pet1_id,
          reportId: aiDiagnosisRecord1_id,
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
        const attributes3 = { ...dummyAttribute1(), medical_issues: 123 };
        await services.api.main.document.updateAiDiagnosisRecord({
          petId: pet1_id,
          reportId: aiDiagnosisRecord1_id,
          accessToken,
          csrfToken,
          name: "updated report test 7 attributes3",
          //@ts-ignore
          attributes: attributes3,
        });
      } catch (error: any) {
        const { response } = error;
        // eslint-disable-next-line jest/no-conditional-expect
        expect(response.data.message).toBe(
          "medical_issues must be a 2D array of strings"
        );
        // eslint-disable-next-line jest/no-conditional-expect
        expect(response.status).toBe(400);
      }

      // did not set attributes. Test if undefined is allowed. It should be fine
      const response = await services.api.main.document.updateAiDiagnosisRecord(
        {
          petId: pet1_id,
          reportId: aiDiagnosisRecord1_id,
          accessToken,
          csrfToken,
        }
      );
      expect(response.status).toBe(200);
    });
  });

  //GET  https://main.bevetu.com/v1/documents/pets/{petId}/ai-diagnosis-records
  describe("viewAllAiDiagnosisRecords()", () => {
    it("test 8 - should be able to view all ai diagnosis Record.", async () => {
      const attributes: Document.IAiDiagnosisRecordAttributes =
        dummyAttribute1();
      // create 19 reports, total 20 (include the one created in above test)
      for (let i = 0; i < 19; i++) {
        await services.api.main.document.createAiDiagnosisRecord({
          petId: pet1_id,
          name: `Report ${i}`,
          date: new Date(),
          accessToken,
          csrfToken,
          attributes,
        });
      }

      const { data: result_1 } =
        await services.api.main.document.viewAllAiDiagnosisRecords({
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
        await services.api.main.document.viewAllAiDiagnosisRecords({
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

  // POST https://main.bevetu.com/v1/documents/pets/{petId}/ai-diagnosis-records/{recordId}/public-access
  describe.only("viewPublicAccessAllowedAiDiagnosisRecord()", () => {
    it("test 9 - should not be able to view record if public accessible not set", async () => {
      // create a new record without setting public accesible
      const {data:newRecord} = await mainServices.document.createAiDiagnosisRecord({
           
            petId: pet1_id,
            name: "Beyonce ai diagnosis Record 1",
            date: new Date(),
            accessToken,
            csrfToken,
            attributes: dummyAttribute1() ,
      })

      // Try to access that record
      try {
        const { data: publicAccessRecord } =
          await mainServices.document.viewPublicAccessAllowedAiDiagnosisRecord({
            recordId: newRecord.id,
            petId: pet1_id,
            type: "AI_DIAGNOSIS_RECORD",
            viewerName: "hello world",
            isAuth: false,
            password: "123",
            email: "",
          });
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          const messages = error.response?.data?.message;
          // eslint-disable-next-line jest/no-conditional-expect
          expect(messages).toBe("Access denied");
        }
      }
    });

    it("test 10 - should not be able to view record if password not incorrect.", async () => {
      // create a new record without setting public accesible
      const { data: newRecord } =
        await mainServices.document.createAiDiagnosisRecord({
          petId: pet1_id,
          name: "Beyonce ai diagnosis Record 1",
          date: new Date(),
          accessToken,
          csrfToken,
          attributes: {...dummyAttribute1(),accessPassword:"123456",publicAccessible:true}
        });

      // Try to access that record
      try {
        const { data: publicAccessRecord } =
          await mainServices.document.viewPublicAccessAllowedAiDiagnosisRecord({
            recordId: newRecord.id,
            petId: pet1_id,
            type: "AI_DIAGNOSIS_RECORD",
            viewerName: "hello world",
            isAuth: false,
            password: "123",
            email: "",
          });
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          const messages = error.response?.data?.message;
          // console.log(messages,"<< message")
          // eslint-disable-next-line jest/no-conditional-expect
          expect(messages).toBe("Access denied");
        }
      }
    });


    it("test 11 - should be able to view record if password correct.", async () => {
      // create a new record without setting public accesible
      const { data: newRecord } =
        await mainServices.document.createAiDiagnosisRecord({
          petId: pet1_id,
          name: "Beyonce ai diagnosis Record 1",
          date: new Date(),
          accessToken,
          csrfToken,
          attributes: {
            ...dummyAttribute1(),
            accessPassword: "123456",
            publicAccessible: true,
          },
        });

      // Try to access that record
      try {
        const { data: publicAccessRecord } =
          await mainServices.document.viewPublicAccessAllowedAiDiagnosisRecord({
            recordId: newRecord.id,
            petId: pet1_id,
            type: "AI_DIAGNOSIS_RECORD",
            viewerName: "hello world",
            isAuth: false,
            password: "123456",
            email: "",
          });
          expect(publicAccessRecord).toBeDefined();
      } catch (error: unknown) {
        if (axios.isAxiosError(error)) {
          const messages = error.response?.data?.message;
          // console.log(messages,"<< message")
          // eslint-disable-next-line jest/no-conditional-expect
          expect(messages).toBe("Access denied");
        }
      }
    });

    it("test 12 - should document viewer updated after the report is viewed ", async () => {
      // 1 - create a new record with public access
      const { data: newRecord } =
        await mainServices.document.createAiDiagnosisRecord({
          petId: pet1_id,
          name: "Beyonce ai diagnosis Record 1",
          date: new Date(),
          accessToken,
          csrfToken,
          attributes: {
            ...dummyAttribute1(),
            accessPassword: "123456",
            publicAccessible: true,
          },
        });
      // 2 - View it
      const { data: publicAccessRecord } =
        await mainServices.document.viewPublicAccessAllowedAiDiagnosisRecord({
          recordId: newRecord.id,
          petId: pet1_id,
          type: "AI_DIAGNOSIS_RECORD",
          viewerName: "hello world",
          isAuth: false,
          password: "123456",
          email: "",
        });
  
      // 3 - Check if view record formed
      const { data: viewersOfTheDoc } =
        await mainServices.documentViewer.viewAllByDocumentId({
          documentId: newRecord.id,
          accessToken,
          csrfToken,
        });
         expect(viewersOfTheDoc.length).toBe(1)
      
    });


    it("test 13 - should document viewer updated after the report is viewed with userId ", async () => {
      // 1 - create a new record with public access
      const { data: newRecord } =
        await mainServices.document.createAiDiagnosisRecord({
          petId: pet1_id,
          name: "Beyonce ai diagnosis Record 1",
          date: new Date(),
          accessToken,
          csrfToken,
          attributes: {
            ...dummyAttribute1(),
            accessPassword: "123456",
            publicAccessible: true,
          },
        });
      // 2 - View it
      const { data: publicAccessRecord } =
        await mainServices.document.viewPublicAccessAllowedAiDiagnosisRecord(
          {
            recordId: newRecord.id,
            petId: pet1_id,
            type: "AI_DIAGNOSIS_RECORD",
            viewerName: "hello world",
            isAuth: false,
            password: "123456",
            email: userEmail,
          }
        );

      // 3 - Check if view record formed
      const { data: viewersOfTheDoc } =
        await mainServices.documentViewer.viewAllByDocumentId({
          documentId: newRecord.id,
          accessToken,
          csrfToken,
        });
      expect(viewersOfTheDoc[0].viewerName).toBe("Herman Lam"); // a testing account's username
    });
  })


 

  //DELETE  https://main.bevetu.com/v1/documents/pets/{petId}/ai-diagnosis-records/{reportId}
  describe("deleteAiDiagnosisRecord()", () => {
    it("test 9 - should be able to delete a ai diagnosis record.", async () => {
      await services.api.main.document.deleteAiDiagnosisRecord({
        petId: pet1_id,
        accessToken,
        csrfToken,
        reportId: report_to_delete_id,
      });

      const { data: result_1 } =
        await services.api.main.document.viewAllAiDiagnosisRecords({
          petId: pet1_id,
          accessToken,
          csrfToken,
          page: 1,
          limit: 20,
        });

      expect(result_1.documents.length).toBe(19);
    });
  });
});


function dummyAttribute1(): Document.IAiDiagnosisRecordAttributes {
  return {
  referenceDocumentIds: ["docId1,docId2"],
  medical_issues: [["Anemia", "HCT", "0.425  L"]],
  next_steps: [
    {
      medical_issue_name: "Anemia",
      suggested_next_steps: [
        ["Increase iron-rich foods", "To improve hemoglobin levels"],
        ["Monitor hemoglobin levels", "To assess improvement over time"],
        ["Consult a hematologist", "For further evaluation and treatment"],
      ],
      prescriptions: [
        ["Ferrous Sulfate", "325 mg once daily with food"],
        [
          "Vitamin C Supplement",
          "500 mg once daily to enhance iron absorption",
        ],
        ["Folic Acid", "5 mg daily to support red blood cell production"],
      ],
    },
    {
      medical_issue_name: "Iron Deficiency",
      suggested_next_steps: [
        ["Increase dietary iron intake", "To replenish iron stores"],
        ["Take iron supplements", "To correct iron deficiency anemia"],
        [
          "Follow up with ferritin test",
          "To monitor iron levels in 3 months",
        ],
      ],
      prescriptions: [
        ["Iron Polysaccharide", "150 mg daily with vitamin C"],
        ["B12 Supplement", "1000 mcg daily if deficiency is suspected"],
      ],
    },
  ],
  physical_examinations: [
    {
      medical_issue_name: "Anemia",
      suggested_examinations: [
        [
          "Inspection of skin and mucous membranes",
          "To check for pallor, jaundice, or cyanosis",
        ],
        [
          "Palpation of spleen and liver",
          "To detect organ enlargement (splenomegaly or hepatomegaly)",
        ],
        [
          "Capillary refill time assessment",
          "To evaluate circulation and perfusion",
        ],
        [
          "Nail bed examination",
          "To look for spoon-shaped nails (koilonychia) indicating iron deficiency",
        ],
        [
          "Conjunctival pallor check",
          "To assess anemia by inspecting the inner eyelid for pale coloration",
        ],
      ],
      abnormal_findings: [],
    },
    {
      medical_issue_name: "Iron Deficiency",
      suggested_examinations: [
        [
          "Tongue examination",
          "To identify glossitis (swollen, inflamed tongue) seen in iron deficiency",
        ],
        [
          "Palpation of lymph nodes",
          "To check for enlargement, which could indicate infection or malignancy",
        ],
        [
          "Postural blood pressure measurement",
          "To detect orthostatic hypotension linked to anemia",
        ],
        [
          "Heart auscultation",
          "To listen for tachycardia or murmurs caused by anemia-related increased cardiac output",
        ],
        [
          "Respiratory assessment",
          "To check for shortness of breath or increased respiratory rate due to low oxygen levels",
        ],
      ],
      abnormal_findings: []
    },
  ],
  test_analysis: [
    {
      name: "HbA1c",
      value: "8.2",
      unit: "%",
      reference_range: { min: "4.0", max: "5.6" },
      interpretation: "Elevated",
      potential_issue: "Poor glycemic control",
    },
  ],

  publicAccessible: false,
  referenceDocumentTypes: []
};}


function dummyAttribute2(): Document.IAiDiagnosisRecordAttributes {
  return {
  referenceDocumentIds: ["docABC123", "docXYZ789"],
  medical_issues: [
    ["Diabetes Mellitus", "HbA1c", "8.2%"],
    ["Hypertension", "BP", "150/95 mmHg"],
  ],
  test_analysis: [
    {
      name: "HbA1c",
      value: "8.2",
      unit: "%",
      reference_range: { min: "4.0", max: "5.6" },
      interpretation: "Elevated",
      potential_issue: "Poor glycemic control",
    },
    {
      name: "Blood Pressure",
      value: "150/95",
      unit: "mmHg",
      reference_range: { min: "90/60", max: "120/80" },
      interpretation: "High",
      potential_issue: "Hypertension",
    },
  ],
  physical_examinations: [
    {
      medical_issue_name: "Diabetes Mellitus",
      suggested_examinations: [
        ["Foot inspection", "Check for ulcers or neuropathy"],
        ["Retinal examination", "Screen for diabetic retinopathy"],
      ],
      abnormal_findings: []
    },
    {
      medical_issue_name: "Hypertension",
      suggested_examinations: [
        ["Cardiovascular examination", "Assess heart sounds and rhythm"],
        ["Kidney function tests", "Check for hypertensive nephropathy"],
      ],
      abnormal_findings: [],
    },
  ],
  next_steps: [
    {
      medical_issue_name: "Diabetes Mellitus",
      suggested_next_steps: [
        ["Start insulin therapy", "If oral medication fails"],
        ["Lifestyle changes", "Diet, exercise, weight loss"],
      ],
      prescriptions: [
        ["Metformin", "500 mg twice daily"],
        ["Insulin Glargine", "10 units at bedtime"],
      ],
    },
    {
      medical_issue_name: "Hypertension",
      suggested_next_steps: [
        ["Reduce salt intake", "Help lower blood pressure"],
        ["Regular exercise", "Improve cardiovascular health"],
      ],
      prescriptions: [
        ["Lisinopril", "10 mg daily"],
        ["Amlodipine", "5 mg daily"],
      ],
    },
  ],
  publicAccessible: false,
  referenceDocumentTypes: []
};
}