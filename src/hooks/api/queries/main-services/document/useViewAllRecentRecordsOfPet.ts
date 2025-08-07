import { QUERY_KEYS } from "hooks/api/queryKeys";
import { Document } from "@services/api/types/main-services.types";
import { IAuthContext, useAuthContext } from "context";
import { useQueries } from "@tanstack/react-query";
import { services } from "services/index";


export const useViewAllRecentRecordsOfPet = (
  petIds:string[],
  page:number,
  limit: number
) => {
  const { setCsrfToken, csrfToken } = useAuthContext() as IAuthContext;
  if (!csrfToken) {
    throw new Error("CSRF token is not available.");
  }

  // if (petIds.length <= 0) {
    // throw new Error("Pet id not provided");
    // return {recentRecordAll:[],
    // petRecords:null}
  // }

  const reportTypes = [
    {
      key: "BLOOD_REPORT",
      fn: services.api.main.document.viewAllBloodReports,
      queryKeyFn: QUERY_KEYS.MAIN.DOCUMENT.VIEW_ALL_BLOOD_REPORTS,
    },
    {
      key: "APPOINTMENT_RECORD",
      fn: services.api.main.document.viewAllAppointmentRecords,
      queryKeyFn: QUERY_KEYS.MAIN.DOCUMENT.VIEW_ALL_APPOINTMENT_RECORDS,
    },
    // {
    //   key: "DAILY_RECORD",
    //   fn: services.api.main.document.viewAllDailyRecords,
    //   queryKeyFn: QUERY_KEYS.MAIN.DOCUMENT.VIEW_ALL_DAILY_RECORDS,
    // },
    {
      key: "VACCINE_RECORD",
      fn: services.api.main.document.viewAllVaccineRecords,
      queryKeyFn: QUERY_KEYS.MAIN.DOCUMENT.VIEW_ALL_VACCINE_RECORDS,
    },
    {
      key: "AI_DIAGNOSIS_RECORD",
      fn: services.api.main.document.viewAllAiDiagnosisRecords,
      queryKeyFn: QUERY_KEYS.MAIN.DOCUMENT.VIEW_ALL_AI_DIAGNOSIS_RECORDS,
    },
  ];

  const results = useQueries({
    queries: petIds.flatMap((petId) =>
      reportTypes.map((report) => ({
        queryKey: [report.queryKeyFn(petId)],
        queryFn: async () => {
          try{
            
            const data = await report.fn({
              limit,
              page,
              petId,
              csrfToken: csrfToken as string,
            });

            if (data.status === 200) {
              setCsrfToken(data.headers["x-csrf-token"]);

              // console.log(data,"<< data")

              // return data
              return {
                ...data,

                petId,
                type: report.key,
              };
            }
            
            return null;
          } catch (error : any){
            if (error?.response?.status === 404) {
             
              return {
                status: 200, // so your code continues as "success"
                headers: { "x-csrf-token": csrfToken },
                data: { documents: [] },
                petId,
                type: report.key,
              };
            }
            throw error
          }
        },
        enabled: !!petId && petId.length > 0,
        keepPreviousData: true,
      }))
    ),
  });

  const recentRecordAll: Omit<Document.IViewOneBloodReportReturn, "attributes">[] = [];

  results.forEach((res) => {
    const type = (res.data?.type as unknown as Document.DocumentType) ?? "";
    const petId = res.data?.petId ?? "";

    const documents = res.data?.data?.documents ?? [];

    documents.forEach((doc) => (
      recentRecordAll.push(
        {
          ...doc,
          type,
          petId,
        }
      )
    )
  )
  })

  recentRecordAll.sort((a, b) => {
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  });

  const petDoc: Record<string,{
      petId:string;
      bloodReports: Omit<Document.IViewOneBloodReportReturn, "attributes">[];
      appointmentRecords: Omit<
        Document.IViewOneBloodReportReturn,
        "attributes"
      >[];
      dailyRecords: Omit<Document.IViewOneBloodReportReturn, "attributes">[];
      vaccineRecords: Omit<Document.IViewOneBloodReportReturn, "attributes">[];
      aiDiagnosisRecords: Omit<
        Document.IViewOneBloodReportReturn,
        "attributes"
      >[];
    }> = {};

    recentRecordAll.forEach((rec) =>{
      const { petId,type } = rec;
      // initialise
      if (!petDoc[petId]) {
        petDoc[petId] = {
          petId,
          bloodReports: [],
          appointmentRecords: [],
          dailyRecords: [],
          vaccineRecords: [],
          aiDiagnosisRecords: [],
        };
      }

      switch (type) {
        case "BLOOD_REPORT":
          petDoc[petId].bloodReports.push(rec);
          break;
        case "APPOINTMENT_RECORD":
          petDoc[petId].appointmentRecords.push(rec);
          break;
        case "DAILY_RECORD":
          petDoc[petId].dailyRecords.push(rec);
          break;
        case "VACCINE_RECORD":
          petDoc[petId].vaccineRecords.push(rec);
          break;
        case "AI_DIAGNOSIS_RECORD":
          petDoc[petId].aiDiagnosisRecords.push(rec);
          break;
      }
    })




  return {
    recentRecordAll,
    petRecords:Object.values(petDoc)
  };
};


