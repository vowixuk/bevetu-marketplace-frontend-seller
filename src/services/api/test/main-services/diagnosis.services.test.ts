/**
 *  Run it solely :
 *  jest src/services/api/test/main-services/diagnosis.services.test.ts
 */

import {services} from '../../..'
import { deleteUser, userLogin } from './helper';

import { v4 as uuidv4 } from "uuid";

describe("diagnosis", () => {
  let accessToken: string = "";
  let csrfToken: string = "";

  beforeAll(async () => {
    // Sign up
    const tokens = await userLogin();
    accessToken = tokens.accessToken as string;
    csrfToken = tokens.csrfToken as string;
  });

  afterAll(async () => {
    await deleteUser({
      accessToken,
      csrfToken,
    });
  });

  describe("Setting Check", () => {
    it("task 1 - should user created and authenticated", async () => {
      const { data: result } = await services.api.main.user.viewProfile({
        accessToken,
        csrfToken,
      });

      expect(result.email).toBeDefined();
    });
  });

  // GET  https://main.bevetu.com/v1/diagnosis
  describe("serverHealthCheck()", () => {
    it("test 2 - should BVA-02 is running", async () => {
      const response = await services.api.main.diagnosis.serverHealthCheck({
        accessToken,
        csrfToken,
        key:'testing'
      });
      expect(response.data).toBe("OK");
    });
  });

  // POST  https://main.bevetu.com/v1/diagnosis/blood-reports/test-analysis
  describe.only("analyseTestResult()", () => {
    it("Task 3 - should analyse test result.", async () => {
      const data = {
        animal: {
          type: "dog",
          age: 14,
          gender: "female",
          breed: "Schnauzer",
          neutered: true,
        },
        testResults: [
          ["Red Blood Cell (RBC) Count", "5.83 x10^12"],
          ["Total T4 (Thyroid Hormone)", "11 nmol/L"],
          // ["Haemoglobin (Hb)", "78 g/L"],
        ],
      };

      const response = await services.api.main.diagnosis.analyseTestResult({
        accessToken,
        csrfToken,
        animal: data.animal,
        testResults: data.testResults,
        clientId:uuidv4()
      });


      console.log(JSON.stringify(response.data, null, 2));
      const { test_analysis, medical_issues } = response.data;

      test_analysis.forEach((result) => {
        expect(result).toEqual(
          expect.objectContaining({
            name: expect.any(String),
            value: expect.any(String),
            unit: expect.any(String),
            reference_range: expect.objectContaining({
              min: expect.any(String),
              max: expect.any(String),
            }),
            interpretation: expect.any(String),
            potential_issue: expect.any(String),
          })
        );
      });

      medical_issues.forEach((issue) => {
        expect(issue).toHaveLength(3);
        expect(typeof issue[0]).toBe("string");
        expect(typeof issue[1]).toBe("string");
        expect(typeof issue[2]).toBe("string");
      });
    }, 900000);
  });

  // POST  https://main.bevetu.com/v1/diagnosis/blood-reports/physical-examiniation-suggestion
  describe("getPhysicalExaminationSuggestion()", () => {
    it("Task 4 - should provide physical examiniation suggestion.", async () => {
      const data = {
        animal: {
          type: "dog",
          age: 14,
          gender: "female",
          breed: "Schnauzer",
          neutered: true,
        },
        medicalIssues: [
          ["Potential hyperlipidemia", "Cholesterol", "9.14 mmol/L"],
          [
            "Possible pancreatic disease or inflammatory bowel disease",
            "Lipase",
            "1083 U/L",
          ],
          ["Dehydration, Hypernatremia", "Osmolality", "310 mOsm/kg"],
          ["Hypothyroidism", "Total T4 (Thyroid Hormone)", "11 nmol/L"],
        ],
      };

      const response =
        await services.api.main.diagnosis.getPhysicalExaminationSuggestion({
          accessToken,
          csrfToken,
          animal: data.animal,
          medicalIssues: data.medicalIssues,
          clientId: uuidv4(),
        });

      const { physical_examinations } = response.data;
      console.log(JSON.stringify(response.data, null, 2));

      physical_examinations.forEach((item) => {
        expect(typeof item).toBe("object");
        expect(item).toHaveProperty("issue");
        // expect(typeof item.issue).toBe("string");
        expect(Array.isArray(item.suggested_examinations)).toBe(true);
        item.suggested_examinations.forEach((examination) => {
          expect(Array.isArray(examination)).toBe(true);
          expect(examination).toHaveLength(2);
          expect(typeof examination[0]).toBe("string");
          expect(typeof examination[1]).toBe("string");
        });
      });

      // group_of_issues.forEach((issue) => {
      //   expect(typeof issue).toBe("string");
      // });
    }, 90000);
  });

  // POST  https://main.bevetu.com/v1/diagnosis/blood-reports/next-step-suggestion
  // describe("getNextStepSuggestion()", () => {
  //   it("Task 5 - should provide next step suggestion.", async () => {
  //     const data = {
  //       animal: {
  //         type: "dog",
  //         age: 14,
  //         gender: "female",
  //         breed: "Schnauzer",
  //         neutered: true,
  //       },
  //       medicalIssues: [
  //         ["Potential hyperlipidemia", "Cholesterol", "9.14 mmol/L"],
  //         [
  //           "Possible pancreatic disease or inflammatory bowel disease",
  //           "Lipase",
  //           "1083 U/L",
  //         ],
  //         ["Dehydration, Hypernatremia", "Osmolality", "310 mOsm/kg"],
  //         ["Hypothyroidism", "Total T4 (Thyroid Hormone)", "11 nmol/L"],
  //       ],
  //       groupOfIssues: [
  //         "Possible Electrolyte Imbalances",
  //         "Possible Protein Loss or Liver Disease",
  //         "Possible Pancreatic Disease",
  //         "Possible Thyroid Dysfunction",
  //       ],
  //     };

  //     const response = await services.api.main.diagnosis.getNextStepSuggestion({
  //       accessToken,
  //       csrfToken,
  //       animal: data.animal,
  //       medicalIssues: data.medicalIssues,
  //       abnormalFindings: data.groupOfIssues,
  //       clientId: uuidv4(),
  //     });

  //     const nextStepSuggestion = response.data;
  //     console.log(JSON.stringify(nextStepSuggestion, null, 2));

  //     // console.log(JSON.stringify(response, null, 2));

  //     nextStepSuggestion.forEach((item) => {
  //       // 1 - Property `issue`
  //       expect(typeof item).toBe("object");
  //       expect(item).toHaveProperty("issue");
  //       // expect(typeof item.issue).toBe("string");

  //       // 2 - Property `suggested_examinations`
  //       expect(Array.isArray(item.suggested_next_steps)).toBe(true);
  //       item.suggested_next_steps.forEach((nextStep) => {
  //         expect(Array.isArray(nextStep)).toBe(true);
  //         expect(nextStep).toHaveLength(2);
  //         expect(typeof nextStep[0]).toBe("string");
  //         expect(typeof nextStep[1]).toBe("string");
  //       });

  //       // 3 - Property `suggested_examinations`
  //       expect(Array.isArray(item.prescriptions)).toBe(true);
  //       item.prescriptions.forEach((prescription) => {
  //         expect(Array.isArray(prescription)).toBe(true);
  //         expect(prescription).toHaveLength(2);
  //         expect(typeof prescription[0]).toBe("string");
  //         expect(typeof prescription[1]).toBe("string");
  //       });
  //     });
  //   }, 90000);
  // });

  // POST  https://main.bevetu.com/v1/diagnosis/blood-reports
  describe("processDiagnosis()", () => {
    it("Task 6 - should process the whole analysis with suggestions of `next steps` and `physical treatment`.", async () => {
      // Client side POST request body
      const data = {
        animal: {
          type: "dog",
          age: 14,
          gender: "female",
          breed: "Schnauzer",
          neutered: true,
        },
        testResults: [
          // ["Red Blood Cell (RBC) Count", "5.83 x10^12"],
          ["Haemoglobin (Hb)", "78 g/L"],
          ["Total T4 (Thyroid Hormone)", "11 nmol/L"],
        ],
      };

      const response = await services.api.main.diagnosis.processDiagnosis({
        accessToken,
        csrfToken,
        animal: data.animal,
        testResults: data.testResults,
        clientId: uuidv4(),
      });

      console.log(JSON.stringify(response.data, null, 2));
      const { test_analysis,  physical_examinations, next_steps} = response.data;

      test_analysis.forEach((result) => {
        expect(result).toEqual(
          expect.objectContaining({
            name: expect.any(String),
            value: expect.any(String),
            unit: expect.any(String),
            reference_range: expect.objectContaining({
              min: expect.any(String),
              max: expect.any(String),
            }),
            interpretation: expect.any(String),
            potential_issue: expect.any(String),
          })
        );
      });

      next_steps.forEach((item) => {
        // 1 - Property `issue`
        expect(typeof item).toBe("object");
        expect(item).toHaveProperty("issue");
        // expect(typeof item.issue).toBe("string");

        // 2 - Property `suggested_examinations`
        expect(Array.isArray(item.suggested_next_steps)).toBe(true);
        item.suggested_next_steps.forEach((nextStep) => {
          expect(Array.isArray(nextStep)).toBe(true);
          expect(nextStep).toHaveLength(2);
          expect(typeof nextStep[0]).toBe("string");
          expect(typeof nextStep[1]).toBe("string");
        });

        // 3 - Property `suggested_examinations`
        expect(Array.isArray(item.prescriptions)).toBe(true);
        item.prescriptions.forEach((prescription) => {
          expect(Array.isArray(prescription)).toBe(true);
          expect(prescription).toHaveLength(2);
          expect(typeof prescription[0]).toBe("string");
          expect(typeof prescription[1]).toBe("string");
        });
      });

      physical_examinations.forEach((item) => {
        // 1 - Property `issue`
        expect(typeof item).toBe("object");
        expect(item).toHaveProperty("issue");
        // expect(typeof item.issue).toBe("string");

        // 2 - Property `suggested_examinations`
        expect(Array.isArray(item.suggested_examinations)).toBe(true);
        item.suggested_examinations.forEach((examination) => {
          expect(Array.isArray(examination)).toBe(true);
          expect(examination).toHaveLength(2);
          expect(typeof examination[0]).toBe("string");
          expect(typeof examination[1]).toBe("string");
        });
      });
    },900000);
  });
});


