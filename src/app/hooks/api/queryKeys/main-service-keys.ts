 const MAIN_SERVICE_KEYS = {
   AUTH: {
     CHECK_SESSION: "main.auth.checkSession",
   },
   USER: {
     VIEW_PROFILE: "main.user.viewProfile",
   },
   NOTIFICATION: {
    CREATE: (id: String) => `main.notification.create.${id}`,    
    VIEW_ONE: (id: String) => `main.notification.viewOne.${id}`,    
    VIEW_ALL: `main.notification.viewAll`,    
    UPDATE: (id: String) => `main.notification.update.${id}`,    
    DELETE: (id: String) => `main.notification.delete.${id}`,    
    MARKALLREAD: `main.notification.markAllRead`,    
   },
   PET: {
     VIEW_ONE: (petId: String) => `main.pet.viewOne.${petId}`,
     VIEW_PROFILE_PICTURE: (petId: String) =>
       `main.pet.view_profile_picture.${petId}`,
   },
   SUBSCRIPTION: {
     VIEW_USER_RECENT_SUBSCRIPTION:
       "main.subscription.viewUserRecentSubscription",
     VIEW_USER_ALL_SUBSCRIPTIONS: "main.subscription.viewUserAllSubscription",
     VIEW_ALL_PRODUCTS: "main.subscription.viewAlll",
   },
   DOCUMENT: {
     VIEW_ALL_BLOOD_REPORTS: (petId: String) =>
       `main.document.viewAllBloodReports.${petId}`,

     VIEW_ONE_BLOOD_REPORT: (petId: String) =>
       `main.document.viewOneBloodReport.${petId}`,

     VIEW_ALL_VACCINE_RECORDS: (petId: String) =>
       `main.document.viewAllVaccineRecords.${petId}`,

     VIEW_ONE_VACCINE_RECORD: (petId: String) =>
       `main.document.viewOneVaccineRecord.${petId}`,

     VIEW_ALL_APPOINTMENT_RECORDS: (petId: String) =>
       `main.document.viewAllAppointmentRecords.${petId}`,

     VIEW_ONE_APPOINTMENT_RECORD: (petId: String) =>
       `main.document.viewOneAppointmentRecord.${petId}`,

     VIEW_ALL_DAILY_RECORDS: (petId: String) =>
       `main.document.viewAllDailyRecords.${petId}`,

     VIEW_ONE_DAILY_RECORD: (petId: String) =>
       `main.document.viewOneDailyRecord.${petId}`,

     VIEW_ALL_AI_DIAGNOSIS_RECORDS: (petId: String) =>
       `main.document.viewAllAiDiagnosisRecords.${petId}`,

     VIEW_ONE_AI_DIAGNOSIS_RECORD: (petId: String) =>
       `main.document.viewOneAiDiagnosisRecord.${petId}`,

     VIEW_BY_USER_ID_ALL: "main.document.viewByUserId.all",

     VIEW_BY_USER_ID_ONE: (petId: String) =>
       `main.document.viewByUserId.all.${petId}`,

     DOCUMENT_BLOB: (petId: string, documentType: string, reportId: string) =>
       `main.document.documentBlob.${petId}.${documentType}${reportId}`,

     VIEW_PUBLIC_ACCESS_ALLOWED_AI_DIAGNOSIS_RECORD: (recordId: string) =>
       `main.document.viewPublicAccessAllowedAiDiagnosisRecord.${recordId}`,

     VIEW_STORAGE_USAGE: "main.document.viewStorageUsage",
   },

   DOCUMENT_VIEWER: {
     VIEW_ALL_BY_DOCUMENT_ID: (documentId: string) =>
       `main.documentViewer.viewAllByDocumentId.${documentId}`,

     VIEW_ALL_DOCUMENTS_BY_USER_ID: `main.documentViewer.viewAllDocumentsByUserId`,
     VIEW_DOCUMENT_VIEWER_COUNT: (documentId: string) =>
       `main.documentViewer.viewDoucmentViewerCount.${documentId}`,
   },
 };

export default MAIN_SERVICE_KEYS;