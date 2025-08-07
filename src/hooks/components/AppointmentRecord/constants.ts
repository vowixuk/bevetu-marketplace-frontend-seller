// Type
import {
  Document as DocumentType,
} from "@services/api/types/main-services.types";

import { v4 as uuidv4 } from 'uuid';

/**
 * Initial placeholder values displayed when the user first opens the create form.
 */
export const DEFAULT_RECORD_VALUE = {
  recordName: `Appointment record`,
  recordDate: new Date(),
  documentUrl: null,
  dateOfVisit: new Date().toISOString().split("T")[0],
  clinicName: "",
  clinicLocation: "",
  vetName: "",
  reasonOfVisit: "",
  diagnosis: "",
  prescriptions: [
    {
      id: uuidv4(), // `id` supplies a stable React key for each record, preventing rendering issues during edits
      medication: "",
      dosage: "",
      duration: "",
    } as DocumentType.IPrescriptionsAttributes & { id: string },
  ],
  treatmentDone: "",
  followUpInstructions: "",
  others: "",
};