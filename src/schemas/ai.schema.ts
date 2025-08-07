import { BasePayloadSchema } from "./main.schema";
import { z } from "zod";



/* ************************************
 * --- DocumentScanner Group Schemas ---
 * ************************************/
export const DocumentScannerSchemas = {
  serverHealthCheck: z.object({
    key: z
      .string({
        required_error: "Key is required",
        invalid_type_error: "Key must be a string",
      })
      .min(1, "Key cannot be empty"), // Example: ensuring the key is not an empty string
  }),

  scanBloodReport: z.object({
    formData: z.instanceof(FormData, {
      message: "formData must be an instance of FormData",
    }),
    // petId: z.string(),
    // serviceSubscriptionId: z.string(),
  }),
};

/* ************************************
 * --- Diagnosis Group Schemas ---
 * ************************************/
export const AnimalSchema = z.object({
  type: z.string(),
  age: z.number(),
  gender: z.string(),
  breed: z.string(),
  neutered: z.boolean(),
});

export const TestResultsSchema = z.array(z.array(z.string()));
export const MedicalIssuesSchema = z.array(z.array(z.string()));
export const GroupOfIssuesSchema = z.array(z.string());

export const GroupedMedicalIssuesSchema = z.array(
  z.object({
    medicalIssueName: z.string(),
    abnormalFindings: z.array(z.string()),
  })
);

export const DiagnosisSchemas = {
  processDiagnosis: BasePayloadSchema.extend({
    animal: AnimalSchema,
    testResults: TestResultsSchema,
    // taskId: z.string(),
    clientId: z.string(),
    petId: z.string(),
    serviceSubscriptionId: z.string(),
  }),

  getPhysicalExaminationSuggestion: BasePayloadSchema.extend({
    animal: AnimalSchema,
    medicalIssues: MedicalIssuesSchema,
    // taskId: z.string(),
    clientId: z.string(),
  }),

  getNextStepSuggestion: BasePayloadSchema.extend({
    animal: AnimalSchema,
    // medicalIssues: MedicalIssuesSchema,
    // groupOfIssues: GroupOfIssuesSchema,
    // taskId: z.string(),
    groupedMedicalIssues: GroupedMedicalIssuesSchema,
    clientId: z.string(),
  }),

  analyseTestResult: BasePayloadSchema.extend({
    animal: AnimalSchema,
    testResults: TestResultsSchema,
    // taskId: z.string(),
    clientId: z.string(),
  }),
};
