/******************
 *  MAIN SERVICES   *
 ******************/

// Auth module
export { useCheckSession } from "./main-services/auth/useCheckSession";

// User modules
export { useViewProfile } from "./main-services/user/useViewProfile";

// Subscription modules
export { useViewAllProducts } from "./main-services/subscription/useViewAllProducts";
export { useViewUserAllSubscriptions } from "./main-services/subscription/useViewUserAllSubscriptions";
export { useViewUserRecentSubscription } from "./main-services/subscription/useViewUserRecentSubscription";
export { usePreviewProrationAmount } from "./main-services/subscription/usePreviewProrationAmount";

// Pet modules
export { useViewOne } from "./main-services/pet/useViewOne";
export { useViewProfilePicture } from "./main-services/pet/useViewProfilePicture";

// Document modules
export { useDocumentBlob } from "./main-services/document/useDocumentBlob";
export { useViewByUserIdAll } from "./main-services/document/useViewByUserIdAll";
export { useViewByUserIdOne } from "./main-services/document/useViewByUserIdOne";
export { useViewAllRecentRecordsOfPet } from "./main-services/document/useViewAllRecentRecordsOfPet";

// Blood Report
export { useViewAllBloodReports } from "./main-services/document/useViewAllBloodReports";
export { useViewOneBloodReport } from "./main-services/document/useViewOneBloodReport";

// Daily Record
export { useViewAllDailyRecords } from "./main-services/document/useViewAllDailyRecords";
export { useViewOneDailyRecord } from "./main-services/document/useViewOneDailyRecord";

// AI Diagnosis Record
export { useViewAllAiDiagnosisRecords } from "./main-services/document/useViewAllAiDiagnosisRecords";
export { useViewOneAiDiagnosisRecord } from "./main-services/document/useViewOneAiDiagnosisRecord";
export { useViewPublicAccessAllowedAiDiagnosisRecord } from "./main-services/document/useViewPublicAccessAllowedAiDiagnosisRecord";
// Vaccine Record
export { useViewAllVaccineRecords } from "./main-services/document/useViewAllVaccineRecords";
export { useViewOneVaccineRecord } from "./main-services/document/useViewOneVaccineRecord";

// Appointment Record
export { useViewAllAppointmentRecords } from "./main-services/document/useViewAllAppointmentRecords";
export { useViewOneAppointmentRecord } from "./main-services/document/useViewOneAppointmentRecord";

// Storage usage
export { useViewStorageUsage} from "./main-services/document/useViewStorageUsage";

// Diagnosis Viewer modules
export { useViewAllByDocumentId } from "./main-services/document-viewer/useViewAllByDocumentId";
export { useViewAllDocumentsByUserId } from "./main-services/document-viewer/useViewAllDocumentsByUserId";
export { useViewDoucmentViewerCount } from "./main-services/document-viewer/useViewDoucmentViewerCount";

/******************
 *  AI SERVICES   *
 ******************/

// Breed Prediction modules
export { useServerHealthCheck } from "./ai-services/breed-prediction/useServerHealthCheck";

// Document Scanner modules
export { useServerHealthCheck as useDocumentScannerHealthCheck } from "./ai-services/document-scanner/useServerHealthCheck";
export { useViewAllServiceSubscription as useViewAllDocumentScannerServiceSubscription } from "./ai-services/document-scanner/useViewAllServiceSubscription";

// Diagnosis Scanner modules
export { useServerHealthCheck as useDiagnosisHealthCheck } from "./ai-services/diagnosis/useServerHealthCheck";
export { useViewAllServiceSubscription as useViewAllDiagnosisServiceSubscription } from "./ai-services/diagnosis/useViewAllServiceSubscription";

// Notification
export { useViewOneNotification } from "./main-services/notification/useViewOne";
export { useViewAllNotification } from "./main-services/notification/useViewAll";
