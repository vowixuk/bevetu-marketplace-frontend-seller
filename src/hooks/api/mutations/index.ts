/******************
 *  MAIN SERVICES   *
 ******************/

// Auth module
export { useLoginWithGoogle } from "./main-services/auth/useLoginWithGoogle";
export { useLogout } from "./main-services/auth/useLogout";

// User modules
export { useUpdate } from "./main-services/user/useUpdate";
export { useGetUploadProfilePicturePresignedUrl } from "./main-services/user/useGetUploadProfilePicturePresignedUrl";
export { useUploadProfilePicture } from "./main-services/user/useUploadProfilePicture";

// Subscription modules
export { useCancelSubscription } from "./main-services/subscription/useCancelSubscription";
export { useChangeSeatNo } from "./main-services/subscription/useChangeSeatNo";
export { useCreatePaymentLink } from "./main-services/subscription/useCreatePaymentLink";
export { useEnrollFreeTrial } from "./main-services/subscription/useEnrollFreeTrial";
export { useRestoreSubscription } from "./main-services/subscription/useRestoreSubscription";

// Pet modules
export { useCreate as usePetCreate } from "./main-services/pet/useCreate";
export { useDelete as usePetDelete } from "./main-services/pet/useDelete";
export { useGetUploadPicturePresignUrl as usePetGetUploadPicturePresignUrl } from "./main-services/pet/useGetUploadPicturePresignUrl";
export { useReactivate as usePetReactivate } from "./main-services/pet/useReactivate";
export { useSoftDelete as usePetSoftDelete } from "./main-services/pet/useSoftDelete";
export { useUpdate as usePetUpdate } from "./main-services/pet/useUpdate";
export { useUploadProfilePicture as usePetUploadProfilePicture } from "./main-services/pet/useUploadProfilePicture";

// Document modules
export { useGetDownloadPresignUrl } from "./main-services/document/useGetDownloadPresignUrl";
export { useGetUploadPresignUrl } from "./main-services/document/useGetUploadPresignUrl";
export { useUploadReport } from "./main-services/document/useUploadReport";
export { useDeleteDocumentFromStorage } from "./main-services/document/useDeleteDocumentFromStorage";


/* Blood Report */
export { useCreateBloodReport } from "./main-services/document/useCreateBloodReport";
export { useDeleteBloodReport } from "./main-services/document/useDeleteBloodReport";
export { useUpdateBloodReport } from "./main-services/document/useUpdateBloodReport";
/* Daily Record */
export { useCreateDailyRecord } from "./main-services/document/useCreateDailyRecord";
export { useDeleteDailyRecord } from "./main-services/document/useDeleteDailyRecord";
export { useUpdateDailyRecord } from "./main-services/document/useUpdateDailyRecord";

/* AI Diagnosis Record*/
export { useCreateAiDiagnosisRecord } from "./main-services/document/useCreateAiDiagnosisRecord";
export { useDeleteAiDiagnosisRecord } from "./main-services/document/useDeleteAiDiagnosisRecord";
export { useUpdateAiDiagnosisRecord } from "./main-services/document/useUpdateAiDiagnosisRecord";

/* Vaccine Record*/
export { useCreateVaccineRecord } from "./main-services/document/useCreateVaccineRecord";
export { useDeleteVaccineRecord } from "./main-services/document/useDeleteVaccineRecord";
export { useUpdateVaccineRecord } from "./main-services/document/useUpdateVaccineRecord";

/* Appointment Record*/
export { useCreateAppointmentRecord } from "./main-services/document/useCreateAppointmentRecord";
export { useDeleteAppointmentRecord } from "./main-services/document/useDeleteAppointmentRecord";
export { useUpdateAppointmentRecord } from "./main-services/document/useUpdateAppointmentRecord";

/* Storage Usasge */
export { useUpdateStorageUsage } from "./main-services/document/useUpdateStorageUsage";
export { useSyncStorageUsage } from "./main-services/document/useSyncStorageUsage";

// Document Scanner modules
export { useProcessDiagnosis } from "./ai-services/diagnosis/useProcessDiagnosis";
export { useGetNextStepSuggestion } from "./ai-services/diagnosis/useGetNextStepSuggestion";
export { useGetPhysicalExaminationSuggestion } from "./ai-services/diagnosis/useGetPhysicalExaminationSuggestion";
export { useAnalyseTestResult } from "./ai-services/diagnosis/useAnalyseTestResult";

/******************
 *  AI SERVICES   *
 ******************/

/* Breed Prediction modules */
export { usePredictDogBreed } from "./ai-services/breed-prediction/usePredictDogBreed";

/* Document Scanner modules */
export { useScanBloodReport } from "./ai-services/document-scanner/useScanBloodReport";

// Notification
export { useNotificationUpdate } from "./main-services/notification/useUpdate";
export { useNotificationCreate } from "./main-services/notification/useCreate";
export { useNotificationDelete } from "./main-services/notification/useDelete";
export { useNotificationMarkAllRead } from "./main-services/notification/useMarkAllRead";
