// Type
import {
  Document as DocumentType,
} from "@services/api/types/main-services.types";


/**
 * Initial placeholder values displayed when the user first opens the create form.
 */
export const DEFAULT_RECORD_VALUE = {
  recordName: `Vaccine Record`,
  recordDate: new Date(),
  documentUrl: null,
  vaccineName: "",
  brandName: "",
  dosage: "",
  dosageUnit: null as DocumentType.IVaccineRecordAttributes['dosageUnit'],
  location: "",
};