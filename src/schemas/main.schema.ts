import { z } from "zod";



/* ************************************
 * ------- Base Payload Schema --------
 * ************************************/ 
/* Handled in hook  */
export const BasePayloadSchema = z.object({
  accessToken: z.string().optional(),
  refreshToken: z.string().optional(),
  csrfToken: z.string().optional(),
});

/* ************************************
 * -- Authentication Payload Schemas --
 * ************************************/ 
// export const AuthenticationSchemas = {
//   loginWithGoogle: z.object({
//     idToken: z.string(),
//   }),
//   checkSession: BasePayloadSchema, 
//   logout: BasePayloadSchema, 
// };



/* ************************************
 * ------- User Payload Schemas -------
 * ************************************/ 

const validNameRegex = /^[a-zA-Z\s]+$/;
export const UserSchemas = {
  /* - Handled in hook - */
  // viewMyProfile: BasePayloadSchema,

  update: BasePayloadSchema.extend({
    givenName: z
      .string()
      .min(1, { message: "Given name is required" })
      .regex(validNameRegex, {
        message: "Given name can only contain letters and spaces",
      })
      .optional(),
    familyName: z
      .string()
      .min(1, { message: "Family name is required" })
      .regex(validNameRegex, {
        message: "Family name can only contain letters and spaces",
      })
      .optional(),
    picture: z.string().nullable().optional(),
  }),

  /* - No handling at this moment - */
  // getUploadProfilePicturePresignedUrl: BasePayloadSchema.extend({
  //   fileName: z.string(),
  // }),

  /* - Testing use only - */
  // delete: BasePayloadSchema,
};


/* ************************************
 * --------- Pet Payload Schemas ------
 * ************************************/ 
const PetCategoryEnumSchema = z.enum([
  "CANINE",
  "FELINE",
]);
export const PetSchemas = {

  create: BasePayloadSchema.extend({
    category: PetCategoryEnumSchema,
    name: z.string(),
    dob: z.date(),
    gender: z.enum(["M", "F"]),
    neuter: z.boolean(),
    breed: z.string(),
    color: z.string(),
    customBreed: z.string().optional(),
    microchipFormat: z.enum(["ISO", "AVID"]).optional(),
    microchipNumber: z.string().optional(),
    picture: z.string().nullable().optional(),
  }),

  update: BasePayloadSchema.extend({
    petId: z.string(),
    category: PetCategoryEnumSchema.optional(),
    name: z.string().optional(),
    dob: z.date().optional(),
    gender: z.enum(["M", "F"]).optional(),
    neuter: z.boolean().optional(),
    breed: z.string().optional(),
    color: z.string().optional(),
    customBreed: z.string().nullable().optional(),
    microchipFormat: z.enum(["ISO", "AVID"]).nullable().optional(),
    microchipNumber: z.string().nullable().optional(),
    picture: z.string().nullable().optional(),
  }),

  viewOne: BasePayloadSchema.extend({
    petId: z.string(),
  }),

  delete: BasePayloadSchema.extend({
    petId: z.string(),
  }),

  getUploadPicturePresignUrl: BasePayloadSchema.extend({
    fileName: z.string(),
  }),

  softDelete: BasePayloadSchema.extend({
    petId: z.string(),
  }),

  reactivate: BasePayloadSchema.extend({
    petId: z.string(),
  }),
};



/* ************************************
 * ----- Document Payload Schemas -----
 * ************************************/ 
const DocumentTypeSchema = z.enum([
  "BLOOD_REPORT",
  "VACCINE_RECORD",
  "APPOINTMENT_RECORD",
  "DAILY_RECORD",
  "AI_DIAGNOSIS_RECORD",
  "DISEASE_REPORT",
  "OTHER",
]);

const createDocument = BasePayloadSchema.extend({
  petId: z.string(),
  name: z.string(),
  date: z.date(),
  url: z.string().nullable().optional(),
  // attributes: z.record(z.any()).optional(),
});

const viewOneDocument = BasePayloadSchema.extend({
  petId: z.string(),
  reportId: z.string(),
});

const viewAllDocuments = BasePayloadSchema.extend({
  petId: z.string(),
  page: z.number(),
  limit: z.number(),
});

const updateDocument = BasePayloadSchema.extend({
  petId: z.string(),
  name: z.string().optional(),
  date: z.date().optional(),
  url: z.string().nullable().optional(),
  // attributes: z.record(z.any()).optional(),
  reportId: z.string(),
});

const deleteDocument = BasePayloadSchema.extend({
  petId: z.string(),
  reportId: z.string(),
});


export const DocumentSchemas = {
  getUploadPresignedUrl: BasePayloadSchema.extend({
    petId: z.string(),
    documentType: DocumentTypeSchema,
    fileName: z.string(),
  }),

  getDownloadPresignedUrl: BasePayloadSchema.extend({
    petId: z.string(),
    documentType: DocumentTypeSchema,
    fileName: z.string(),
  }),

  // --- Blood Report ----
  createBloodReport: createDocument.extend({
    attributes: z.record(z.any()).optional(),
  }),
  updateBloodReport: updateDocument.extend({
    attributes: z.record(z.any()).optional(),
  }),
  viewOneBloodReport: viewOneDocument,
  viewAllBloodReports: viewAllDocuments,
  deleteBloodReport: deleteDocument,

  // --- Vaccine Report ---
  createVaccineRecord: createDocument.extend({
    attributes: z.object({
      vaccineName: z
        .string()
        .nonempty("Vaccine name is required.")
        .describe("The name of the vaccine being administered."),

      brandName: z
        .string()
        .nonempty("Brand name is required.")
        .describe("The brand name of the vaccine, if applicable."),

      dosage: z
        .union([z.string(), z.number()])
        .refine((value) => {
          if (typeof value === "number") {
            return value > 0;
          }
          return true;
        }, "Dosage must be greater than 0.")
        .describe(
          "The dosage of the vaccine, which can be a string or a number. It must be greater than 0 if it's a number."
        ),

      dosageUnit: z
        .union([
          z
            .literal("ml")
            .describe("Milliliters, the standard liquid measurement."),
          z.literal("g").describe("Grams, a measurement for solid substances."),
          z
            .literal("mg")
            .describe("Milligrams, a smaller unit of weight measurement."),
          z.literal("mcg").describe("Micrograms, a very small unit of weight."),
          // z.null().describe("No unit specified."),
        ])
        .describe("The unit of measurement for the vaccine dosage."),

      location: z
        .string()
        .nonempty("Location is required.")
        .describe(
          "The location where the vaccine was administered, e.g., clinic or vet office."
        ),
    }),
  }),
  updateVaccineRecord: updateDocument.extend({
    attributes: z
      .object({
        vaccineName: z
          .string()
          .nonempty("Vaccine name is required.")
          .describe("The name of the vaccine being administered."),

        brandName: z
          .string()
          .nonempty("Brand name is required.")
          .describe("The brand name of the vaccine, if applicable."),

        dosage: z
          .union([z.string(), z.number()])
          .refine((value) => {
            if (typeof value === "number") {
              return value > 0;
            }
            return true;
          }, "Dosage must be greater than 0.")
          .describe(
            "The dosage of the vaccine, which can be a string or a number. It must be greater than 0 if it's a number."
          ),

        dosageUnit: z
          .union([
            z
              .literal("ml")
              .describe("Milliliters, the standard liquid measurement."),
            z
              .literal("g")
              .describe("Grams, a measurement for solid substances."),
            z
              .literal("mg")
              .describe("Milligrams, a smaller unit of weight measurement."),
            z
              .literal("mcg")
              .describe("Micrograms, a very small unit of weight."),
            // z.null().describe("No unit specified."),
          ])
          .describe("The unit of measurement for the vaccine dosage."),

        location: z
          .string()
          .nonempty("Location is required.")
          .describe(
            "The location where the vaccine was administered, e.g., clinic or vet office."
          ),
      })
      .optional(),
  }),
  viewOneVaccineRecord: viewOneDocument,
  viewAllVaccineRecord: viewAllDocuments,
  deleteVaccineRecord: deleteDocument,

  // --- Appointment Record ---
  createAppointmentRecord: createDocument.extend({
    attributes: z.object({
      dateOfVisit: z.string().nonempty("Date of visit is required"),
      clinicName: z.string().nonempty("Clinic name is required"),
      clinicLocation: z.string().nonempty("Clinic location is required"),
      vetName: z.string().nonempty("Veterinarian name is required"),
      reasonOfVisit: z.string().nonempty("Reason of visit is required"),
      diagnosis: z.string().nonempty("Diagnosis is required"),
      prescriptions: z
        .array(
          z.object({
            medication: z.string().nonempty("Medication is required"),
            dosage: z.string().nonempty("Dosage is required"),
            duration: z.string().nonempty("Duration is required"),
          })
        )
        .optional(),
      treatmentDone: z.string().optional(),
      followUpInstructions: z.string().optional(),
      others: z.string().optional(),
    }),
  }),

  updateAppointmentRecord: updateDocument.extend({
    attributes: z
      .object({
        dateOfVisit: z.string().nonempty("Date of visit is required"),
        clinicName: z.string().nonempty("Clinic name is required"),
        clinicLocation: z.string().nonempty("Clinic location is required"),
        vetName: z.string().nonempty("Veterinarian name is required"),
        reasonOfVisit: z.string().nonempty("Reason of visit is required"),
        diagnosis: z.string().nonempty("Diagnosis is required"),
        prescriptions: z
          .array(
            z.object({
              medication: z.string().nonempty("Medication is required"),
              dosage: z.string().nonempty("Dosage is required"),
              duration: z.string().nonempty("Duration is required"),
            })
          )
          .optional(),
        treatmentDone: z.string().optional(),
        followUpInstructions: z.string().optional(),
        others: z.string().optional(),
      })
      .optional(),
  }),
  viewOneAppointmentRecord: viewOneDocument,
  viewAllAppointmentRecords: viewAllDocuments,
  deleteAppointmentRecord: deleteDocument,

  // --- Daily Record ---
  createDailyRecord: createDocument.extend({
    attributes: z.object({
      food: z.array(
        z.object({
          name: z.string().nonempty("Food name is required"),
          volume: z.string().nonempty("Food volume is required"),
          intakeTime: z.string().nonempty("Intake time is required"), // Format: "14:45"
          isRefuse: z.boolean(),
          ingridents: z
            .array(
              z.tuple([
                z.string().nonempty("Ingredient name is required"),
                z.string().nonempty("Ingredient amount is required"),
              ])
            )
            .optional(),
          brand: z.string().optional(),
          selfCook: z.boolean().optional(),
          notes: z.string().optional(),
        })
      ),

      drink: z.array(
        z.object({
          volume: z.string().nonempty("Drink volume is required"),
          intakeTime: z.string().nonempty("Intake time is required"),
          isRefuse: z.boolean(),
          notes: z.string().optional(),
        })
      ),

      toilet: z.array(
        z.object({
          type: z.enum(["pee", "poo"], {
            errorMap: () => ({ message: "Type must be 'pee' or 'poo'" }),
          }),
          time: z.string().nonempty("Toilet time is required"),
          notes: z.string().optional(),
          url: z.string().url("URL must be valid").optional(),
        })
      ),

      walking: z.array(
        z.object({
          location: z.string().nonempty("Location is required"),
          geoLocation: z.object({
            latitude: z.string().nonempty("Latitude is required"),
            longitude: z.string().nonempty("Longitude is required"),
          }),
          startTime: z.string().nonempty("Start time is required"),
          endTime: z.string().nonempty("End time is required"),
          isRefuse: z.boolean(),
          notes: z.string().optional(),
        })
      ),

      weight: z
        .object({
          weight: z.union([
            z.number(),
            z.string().nonempty("Weight cannot be empty"),
          ]),
          unit: z.enum(["g", "kg"]),
        })
        .optional(),

      notes: z.string().optional(),
    }),
  }),

  updateDailyRecord: updateDocument.extend({
    attributes: z
      .object({
        food: z.array(
          z.object({
            name: z.string().nonempty("Food name is required"),
            volume: z.string().nonempty("Food volume is required"),
            intakeTime: z.string().nonempty("Intake time is required"),
            isRefuse: z.boolean(),
            ingridents: z
              .array(
                z.tuple([
                  z.string().nonempty("Ingredient name is required"),
                  z.string().nonempty("Ingredient amount is required"),
                ])
              )
              .optional(),
            brand: z.string().optional(),
            selfCook: z.boolean().optional(),
            notes: z.string().optional(),
          })
        ),
        drink: z.array(
          z.object({
            volume: z.string().nonempty("Drink volume is required"),
            intakeTime: z.string().nonempty("Intake time is required"),
            isRefuse: z.boolean(),
            notes: z.string().optional(),
          })
        ),

        toilet: z.array(
          z.object({
            type: z.enum(["pee", "poo"], {
              errorMap: () => ({ message: "Type must be 'pee' or 'poo'" }),
            }),
            time: z.string().nonempty("Toilet time is required"),
            notes: z.string().optional(),
            url: z.string().url("URL must be valid").optional(),
          })
        ),
        walking: z.array(
          z.object({
            location: z.string().nonempty("Location is required"),
            geoLocation: z.object({
              latitude: z.string().nonempty("Latitude is required"),
              longitude: z.string().nonempty("Longitude is required"),
            }),
            startTime: z.string().nonempty("Start time is required"),
            endTime: z.string().nonempty("End time is required"),
            isRefuse: z.boolean(),
            notes: z.string().optional(),
          })
        ),
        weight: z
          .object({
            weight: z.union([
              z.number(),
              z.string().nonempty("Weight cannot be empty"),
            ]),
            unit: z.enum(["g", "kg"]),
          })
          .optional(),
        notes: z.string().optional(),
      })
      .optional(),
  }),

  viewOneDailyRecord: viewOneDocument,
  viewAllDailyRecords: viewAllDocuments,
  deleteDailyRecord: deleteDocument,

  // --- AI Diagnosis Record ---
  createAiDiagnosisRecord: createDocument.extend({
    attributes: z.object({
      test_analysis: z.array(
        z.object({
          name: z.string(),
          value: z.union([z.string(), z.number()]).nullable(),
          unit: z.union([z.string(), z.number()]).nullable(),
          reference_range: z.object({
            min: z.union([z.string(), z.number()]).nullable(),
            max: z.union([z.string(), z.number()]).nullable(),
          }),
          interpretation: z.string().nullable(),
          potential_issue: z.string().nullable(),
        })
      ),

      physical_examinations: z.array(
        z.object({
          medical_issue_name: z.string(),
          abnormal_findings: z.array(z.string()),
          suggested_examinations: z.array(z.array(z.string())).nullable(), // string[][]
        })
      ),

      next_steps: z.array(
        z.object({
          medical_issue_name: z.string(),
          suggested_next_steps: z.array(z.array(z.string())).nullable(), // string[][]
          prescriptions: z.array(z.array(z.string())).nullable(), // string[][]
        })
      ),

      medical_issues: z.array(z.array(z.string())), // string[][]

      referenceDocumentIds: z.array(z.string()),

      publicAccessible: z.boolean(),

      accessPassword: z.string().optional(),
    }),
  }),
  updateAiDiagnosisRecord: updateDocument.extend({
    attributes: z
      .object({
        test_analysis: z
          .array(
            z.object({
              name: z.string(),
              value: z.union([z.string(), z.number()]).nullable(),
              unit: z.string().nullable(),
              reference_range: z.object({
                min: z.union([z.string(), z.number()]).nullable(),
                max: z.union([z.string(), z.number()]).nullable(),
              }),
              interpretation: z.string().nullable(),
              potential_issue: z.string().nullable(),
            })
          )
          .optional(),
        physical_examinations: z
          .array(
            z.object({
              medical_issue_name: z.string(),
              abnormal_findings: z.array(z.string()),
              suggested_examinations: z.array(z.array(z.string())).nullable(), // string[][]
            })
          )
          .optional(),

        next_steps: z
          .array(
            z.object({
              medical_issue_name: z.string(),
              suggested_next_steps: z.array(z.array(z.string())).nullable(), // string[][]
              prescriptions: z.array(z.array(z.string())).nullable(), // string[][]
            })
          )
          .optional(),
        medical_issues: z
          .array(z.tuple([z.string(), z.string(), z.string()]))
          .optional(),
        referenceDocumentIds: z.array(z.string()).optional(),
        publicAccessible: z.boolean().optional(),

        accessPassword: z.string().optional().optional(),
      })
      .optional(),
  }),
  viewOneAiDiagnosisRecord: viewOneDocument,
  viewAllAiDiagnosisRecords: viewAllDocuments,
  deleteAiDiagnosisRecord: deleteDocument,

  /* Storage usage */
  updateStorageUsage: z.object({
    petId: z.string(),
    usageChange: z.number().optional(),
    usage: z.number().optional(),
    fileCountChange: z.number().optional(),
    fileCount: z.number().optional(),
    documentType: DocumentTypeSchema,
  }),
  syncStorageUsag: z.object({ petIds: z.array(z.string()) }),
};


/* ************************************
 * --- Subscription Group Schemas ---
 * ************************************/ 

const ProductCodeEnum = [
  "BVT_ANNUAL_USD",
  "BVT_MONTHLY_USD",
  "BVT_ANNUAL_GBP",
  "BVT_MONTHLY_GBP",
  "BVT_ANNUAL_HKD",
  "BVT_MONTHLY_HKD",
  "BVT_MONTHLY_TESTING",
  "BVT_ANNUAL_TESTING",
] as const;

const ProductCodeSchema = z.enum(ProductCodeEnum)

// const SubscriptionStatusTypeSchema = z.enum([
//   "ACTIVE",
//   "CANCELED",
//   "EXPIRED",
//   "PAUSED",
//   "TRIAL",
//   "INACTIVE",
// ]);
export const SubscriptionSchemas = {
  /* - Handled in hook - */
  enrollFreeTrial: BasePayloadSchema,

  createPaymentLink: BasePayloadSchema.extend({
    productCode: ProductCodeSchema,
    seatNo: z.number().min(1),
  }),

  changeSeatNo: BasePayloadSchema.extend({
    bevetuSubscriptionId: z.string(),
    newSeatNo: z.number(),
  }),

  cancelSubscription: BasePayloadSchema.extend({
    bevetuSubscriptionId: z.string(),
    cancelReason: z.string()
      .min(1, "Cancellation reason cannot be empty.")
      .max(255, "Cancellation reason cannot exceed 255 characters."),
  }),

  restoreSubscription: BasePayloadSchema.extend({
    bevetuSubscriptionId: z.string(),
  }),

  /* - Handled in hook - */
  // viewAllProducts: BasePayloadSchema,

  /* - Handled in hook - */
  // viewUserAllSubscriptions: BasePayloadSchema,

  /* - Handled in hook - */
  // viewUserRecentSubscription: BasePayloadSchema,

  /* - Testing use only - */
  // update: BasePayloadSchema.extend({
  //   subscriptionId: z.string(),
  //   seatNo: z.number().optional(),
  //   nextPaymentDate: z.date().optional(),
  //   status: SubscriptionStatusTypeSchema.optional(),
  //   cancelAt: z.date().nullable().optional(),
  // }),

  /* - Testing use only - */
  // deleteSubscriptionInStripe: BasePayloadSchema.extend({
  //   bevetuSubscriptionId: z.string(),
  // }),

  /* - Testing use only - */
  // viewStripeSubscription: BasePayloadSchema.extend({
  //   bevetuSubscriptionId: z.string(),
  // }),

  /* - Testing use only - */
  // deleteStripeCustomer: BasePayloadSchema.extend({
  //   bevetuSubscriptionId: z.string(),
  // }),

  /* - Testing use only - */
  // advanceTestClock: BasePayloadSchema.extend({
  //   bevetuSubscriptionId: z.string(),
  //   advanceDay: z.number(),
  //   testClockId: z.string(),
  // }),
};


// /* ************************************
//  * --- DocumentScanner Group Schemas ---
//  * ************************************/ 
// export const DocumentScannerSchemas = {
//     serverHealthCheck : z.object({
//       key: z
//         .string({
//           required_error: "Key is required",
//           invalid_type_error: "Key must be a string",
//         })
//         .min(1, "Key cannot be empty"), // Example: ensuring the key is not an empty string
//     }),

//     scanBloodReport: z.object({
//       formData: z.instanceof(FormData, {
//         message: "formData must be an instance of FormData",
//       }),
//   })
// }



// /* ************************************
//  * --- Diagnosis Group Schemas ---
//  * ************************************/ 
// export const AnimalSchema = z.object({
//   type: z.string(),
//   age: z.number(),
//   gender: z.string(),
//   breed: z.string(),
//   neutered: z.boolean(),
// });

// export const TestResultsSchema = z.array(z.array(z.string())); 
// export const MedicalIssuesSchema = z.array(z.array(z.string())); 
// export const GroupOfIssuesSchema = z.array(z.string()); 

// export const GroupedMedicalIssuesSchema = z.array(
//   z.object({
//     medicalIssueName: z.string(),
//     abnormalFindings: z.array(z.string()),
//   })
// );

// export const DiagnosisSchemas = {
//   processDiagnosis: BasePayloadSchema.extend({
//     animal: AnimalSchema,
//     testResults: TestResultsSchema,
//     // taskId: z.string(),
//     clientId: z.string(),
//   }),

//   getPhysicalExaminationSuggestion: BasePayloadSchema.extend({
//     animal: AnimalSchema,
//     medicalIssues: MedicalIssuesSchema,
//     // taskId: z.string(),
//     clientId: z.string(),
//   }),

//   getNextStepSuggestion: BasePayloadSchema.extend({
//     animal: AnimalSchema,
//     // medicalIssues: MedicalIssuesSchema,
//     // groupOfIssues: GroupOfIssuesSchema,
//     // taskId: z.string(),
//     groupedMedicalIssues: GroupedMedicalIssuesSchema,  
//     clientId: z.string(),
//   }),

//   analyseTestResult: BasePayloadSchema.extend({
//     animal: AnimalSchema,
//     testResults: TestResultsSchema,
//     // taskId: z.string(),
//     clientId: z.string(),
//   }),
// };