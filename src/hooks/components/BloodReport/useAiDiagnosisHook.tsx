import { useState, useRef } from "react";
import {
  Pet,
} from "@services/api/types/main-services.types";

import {
  Diagnosis,
  DocumentScanner,
} from "@services/api/types/ai-services.types";

import {
  useCreateAiDiagnosisRecord,
  useNotificationCreate,
  useScanBloodReport,
  useUpdateAiDiagnosisRecord,
} from "hooks/api/mutations";
import FormData from "form-data";
import { Document as IDocument 
} from "@services/api/types/main-services.types";
import {
  DocumentSchemas,
} from "schemas/main.schema";
import {
  DiagnosisSchemas,
  DocumentScannerSchemas,
} from "schemas/ai.schema";
import io, { Socket } from "socket.io-client";
import { useProcessDiagnosis } from "hooks/api/mutations";
import { toast } from "react-toastify";
import { schemaValidation } from "schemas/schemaValidator";
import { useViewAllAiDiagnosisRecords } from "hooks/api/queries";
import { onErrorToast } from "utils/toast";


export interface IUseAiDiagnosisHookProps {
  /**
   * Pet's details information
   */
  petDetailInfo: Pet.IViewOneReturn;

  /**
   * Record Id - The record / document that is used to diagnosis
   */
  recordId: string;

  /**
   *  The file object of the blood report
   */
  file: File | null;

  recordName: string;
}

export const useAIDiagnosisHook = ({
  recordId,
  petDetailInfo,
  file,
  recordName,
}: IUseAiDiagnosisHookProps) => {
  const { mutate: createNotification }      = useNotificationCreate();
  const { mutate: processDiagnosis }        = useProcessDiagnosis();
  const { mutate: createAiDiagnosisRecord } = useCreateAiDiagnosisRecord();
  const { mutate: scanBloodReport }         = useScanBloodReport();
  const { mutate: updateAiDiagnosisRecord } = useUpdateAiDiagnosisRecord();
  const { 
    data: aiDiagnosisRecords, 
    refetch: refetchAiDiagnosisRecords 
  } = useViewAllAiDiagnosisRecords({
      petId: petDetailInfo.id,
      page: 1,
      limit: 100
    },
      { enabled: !!petDetailInfo.id }
    );

  /**
   *  For web socket connection in diagnosis process
   */
  const socketRef = useRef<Socket | null>(null);

  /**
   *  Indicate is the scanning in progress
   */
  const [scaning, setScaning] = useState<boolean>(false);

  /**
   * Set the wordings showing during the AI Analysis
   */
  const [statusMessage, setStatusMessage] = useState<string | undefined>(
    undefined
  );

  /**
   * Orchestrates the essential steps for AI-based blood report diagnosis:
   * 1 - scanBloodReportHandler()
   * 2 - processDiagnosisHandler()
   * 3 - createAiDiagnosisRecordHandler()
   *
   * Workflow:
   * Step 1 - scanBloodReportHandler() extracts data from the uploaded blood report.
   * Step 2 - The extracted data is processed by processDiagnosisHandler(), where the LLM performs analysis.
   * Step 3 - The analyzed result is then passed to createAiDiagnosisRecordHandler() to store the record in the database.
   */
  type AnalysisOptions = {

    /*
     * Processes the diagnosis without extracting data from a document (no computer vision ai involved).
     * Requires the data to be passed directly to the processDiagnosisHandler.
     */
    directRegeneration      ?: boolean;
    bloodReportExtractedData?: DocumentScanner.IScanBloodReportReturn;
      /**
     * true  = create a new record
     * false = update the existing record
     */
    createdNew               ?: boolean;
    existingAiDiagnosisRecord : IDocument.IViewOneAiDiagnosisRecordReturn;
    onSuccessCallback        ?: (arg?: any) => void;
    onErrorCallback          ?: (arg?: any) => void;
    onSettleCallback         ?: (arg?: any) => void;
  };
  async function analysis(
    petId                                : string,
    documentScannerServiceSubscriptionId : string,
    diagnosisServiceSubscriptionId       : string,
    options                             ?: AnalysisOptions
  ) {

    /**
     *  When mode = null means go throught the whole extraction to creation process
     */
    let mode = null;
    let createNew: boolean = true
    let existingAiDiagnosisRecord: IDocument.IViewOneAiDiagnosisRecordReturn | null =
      null;

    /**
     *  Verifies if 'directRegeneration' is enabled.
     *  If true, ensures that the required arguments are also provided.
     */
    if (options && options.directRegeneration === true) {
      if (!options.bloodReportExtractedData) {
        onErrorToast("Blood report data is required");
        createNotification({
            title    : "AI Analysis",
            txt      : 'Blood report data is required',
            isRead   : false,
            createdAt: new Date(),
        })
        return;
      }

      if (!options.existingAiDiagnosisRecord) {
        onErrorToast("Existing attributes is required");
        createNotification({
            title    : "AI Analysis",
            txt      : "Existing attributes is required",
            isRead   : false,
            createdAt: new Date(),
        })
        return;
      }

      createNew = false;
      existingAiDiagnosisRecord = options.existingAiDiagnosisRecord;
      mode = "DIRECT_GENERATION";
    }

    const animal: Diagnosis.Animal | string =
      constructAnimalPayload(petDetailInfo);

    setStatusMessage("Verifying animal information...");

    if (typeof animal == "string") {
      onErrorToast(animal);
      return;
    }

    try {
      /****************************************
       *  Step 1 - Extract Data From Document *
       ****************************************/
      setScaning(true);
      let bloodReportExtractedData: DocumentScanner.ILinesInWholeDocument | null =
        null;


      if (mode !== "DIRECT_GENERATION") {
        // Check if file is availale for extraction
        if (!file) {
          onErrorToast("Failed to load the blood report");
          return;
        }

        // Extract data from the report
        setStatusMessage("Extracting details from the blood report");
        try {

          bloodReportExtractedData =
            (
              await scanBloodReportHandler(
                file,
                petId,
                documentScannerServiceSubscriptionId
              )
            ).data?.data || null;

          console.log('error scan blood report handler.')

        } catch (error: any) {
          throw error;
        }

        // bloodReportExtractedData =
        //   (await scanBloodReportHandler(file, petId, documentScannerServiceSubscriptionId)).data?.data || null;
      } else {
        bloodReportExtractedData =
          options!.bloodReportExtractedData!.data || null;
      }


      if (bloodReportExtractedData == null) {
        throw Error('Unable to collect blood report extraction data')
      }

      /************************************
       *  Step 2 - Websocket Connect.     *
       *  Send extracted data to backend  *
       ************************************/
      // Clear all previous socket connection, if any
      if (socketRef.current) {
        socketRef.current.disconnect();
      }

      // Create a new socket connection
      const socket = io(
        `${process.env.REACT_APP_MAIN_SERVICES_WS_ENDPOINT}/blood-report-analysis-progress`,
        {
          transports: ["websocket"],
          withCredentials: true,
        }
      );

      // set current connect to be this new connect
      socketRef.current = socket;

      // assign actions when socket channedl is established
      socket.on("connect", () => { });

      // assign action when "welcome" event is received
      // Welcome event will return an clientId which identifies this connection
      socket.on("welcome", async (_clientId) => {

        // Send extracted data to LLM for analysis
        setStatusMessage("Analyzing the data");
        try {
          await processDiagnosisHandler(
            petId,
            diagnosisServiceSubscriptionId,
            animal,
            _clientId,
            bloodReportExtractedData as unknown as DocumentScanner.ILinesInWholeDocument
          );
        } catch (error: any) {
          disconnectSocket();
          onErrorToast(error)
          createNotification({
            title   : "AI Analysis",
            txt     : error,
            isRead  : false,
            createdAt: new Date(),
        })
          return
        }
      });


      // assign actions for progress update events
      socket.on("progressUpdate", (data) => { });

      // assign actions for error event
      socket.on("progressError", (data) => {
        onErrorToast(JSON.stringify(data));
        disconnectSocket();
      });

      // assign actions for task completed event
      socket.on("taskCompleted", async (data) => {
        console.log("Task Completed:", data);

        disconnectSocket();

        /**************************************************
         *  Step 3 - Create / Update AI Diagnosis Record  *
         **************************************************/

        try {

          if (createNew === false) {
            setStatusMessage("Generating the AI Diagnostic Report");
            await updateAiDiagnosisRecordHandler(
              petDetailInfo.id,
              existingAiDiagnosisRecord?.id!,
              {
                test_analysis: data.result.test_analysis || [],
                physical_examinations: data.result.physical_examinations || [],
                next_steps: data.result.next_steps || [],
                medical_issues: data.result.medical_issues || [],
                referenceDocumentIds: [recordId],
                publicAccessible: existingAiDiagnosisRecord?.attributes.publicAccessible || false,
                accessPassword:
                  existingAiDiagnosisRecord?.attributes.accessPassword ||
                  ''
              }
            );

            createNotification({
                title   : "AI Analysis",
                txt     : "AI Diagnostic Report Generated Successfully",
                isRead  : false,
                createdAt: new Date(),
                url: `/ai-diagnosis/${petDetailInfo.name}/${petDetailInfo.id}`,
            })

            toast.success("AI Diagnostic Report Generated Successfully", {
              theme: "colored",
              autoClose: 10000,
            });

          } else {
            setStatusMessage("Generating the AI Diagnostic Report");
            await createAiDiagnosisRecordHandler(petDetailInfo.id, {
              test_analysis: data.result.test_analysis || [],
              physical_examinations: data.result.physical_examinations || [],
              next_steps: data.result.next_steps || [],
              medical_issues: data.result.medical_issues || [],
              referenceDocumentIds: [recordId],
              publicAccessible: false,
              referenceDocumentTypes: ["BLOOD_REPORT"],
            });

            createNotification({
                title   : "AI Analysis",
                txt     : "AI Diagnostic Report Generated Successfully",
                isRead  : false,
                createdAt: new Date(),
                url: `/ai-diagnosis/${petDetailInfo.name}/${petDetailInfo.id}`,
            })

            toast.success("AI Diagnostic Report Generated Successfully", {
              theme: "colored",
              autoClose: 10000,
            });
          }
          refetchAiDiagnosisRecords();

          if (options?.onSuccessCallback) {

            options?.onSuccessCallback();
          }

        } catch (e: any) {

          createNotification({
              title   : "AI Analysis",
              txt     : "Sorry, something went wrong creating / updating the AI Diagnostic Report.",
              isRead  : false,
              createdAt: new Date(),
          })

          onErrorToast(
            "Sorry, something went wrong creating / updating the AI Diagnostic Report."
          );

          if (options?.onErrorCallback) {
            options?.onErrorCallback();
          }
        } finally {
          setScaning(false);
          if (options?.onSettleCallback) {
            options?.onSettleCallback();
          }
        }
      });

      // assign actions for disconnect event
      socket.on("disconnect", () => {
        disconnectSocket();
      });

    } catch (e) {
      onErrorToast(JSON.stringify(e))
      setScaning(false);
      if (options?.onErrorCallback) {
        options?.onErrorCallback();
      }
    }

    // Function to disconnect socket when needed
    function disconnectSocket() {
      console.log("socket disconnecting ... ");
      setScaning(false);
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
        console.log("socket disconnected");
      }
    }
  }

  /**
   * ⚠️ Internal Helper Function ⚠️
   * This function is a sub-component of the analysis() process.
   * It is not intended to be called independently.
   * Do NOT invoke this function directly.
   */
  async function scanBloodReportHandler(file: File, petId: string, serviceSubscriptionId: string): Promise<{
    errMsg?: string;
    data?: DocumentScanner.IScanBloodReportReturn;
  }> {

    return new Promise((resolve, reject) => {
      // Setting payload
      const formData = new FormData();
      formData.append("document", file);
      formData.append("petId", petId);
      formData.append("serviceSubscriptionId", serviceSubscriptionId);
      const payload: DocumentScanner.IScanBloodReportPayload = {
        formData,
      };

      // Validate the payload
      const validation = schemaValidation(
        DocumentScannerSchemas.scanBloodReport,
        payload
      );

      // Handle failed validation
      if (!validation.valid) {
        reject({
          errMsg: validation.error?.[0]?.message || "Validation failed",
        });
        return;
      }

      scanBloodReport(payload, {
        onSuccess: (data) => {
          resolve({ data: data.data });
        },
        onError(error: any) {
          const message = serviceSubscriptionReturnErrorHandler(
            error.response.data
          );
          reject(message);
        },
      });
    });
  }

  /**
   * ⚠️ Internal Helper Function ⚠️
   * This function is a sub-component of the analysis() process.
   * It is not intended to be called independently.
   * Do NOT invoke this function directly.
   */
  async function processDiagnosisHandler(
    petId: string,
    serviceSubscriptionId: string,
    animal: Diagnosis.Animal,
    webSocketclientId: string,
    bloodReportExtractedData: DocumentScanner.ILinesInWholeDocument
  ): Promise<{
    data?: Diagnosis.IProcessDiagnosisReturn;
    errMsg?: string;
  }> {
    return new Promise((resolve, reject) => {
      const testResults: Diagnosis.TestResults = [];

      // to flatting the nested array
      // string[][] => string[]
      bloodReportExtractedData.forEach((pageItems) => {
        return pageItems.forEach((item) => {
          testResults.push([
            item.test || "",
            item.value || "",
            item.unit || "",
            item.reference?.high || "",
            item.reference?.low || "",
          ]);
        });
      });

      const payload: Diagnosis.IProcessDiagnosisPayload = {
        animal,
        petId,
        serviceSubscriptionId,
        testResults: testResults,
        clientId: webSocketclientId,
      };

      const validation = schemaValidation(
        DiagnosisSchemas.processDiagnosis,
        payload
      );

      // Handle failed validation
      if (!validation.valid) {
        reject({
          errMsg:
            validation.error?.[0]?.message ||
            "Validation failed",
        });
        return;
      }

      processDiagnosis(payload, {
        onSuccess: (data) => {
          resolve({
            data: data.data,
          });
        },
        onError: (error: any) => {
          const message = serviceSubscriptionReturnErrorHandler(error.response.data);
          reject(message);
        },
      });
    });
  }

  /**
   * ⚠️ Internal Helper Function ⚠️
   * This function is a sub-component of the analysis() process.
   * It is not intended to be called independently.
   * Do NOT invoke this function directly.
   */
  async function createAiDiagnosisRecordHandler(
    petId: string,
    attributes: IDocument.IAiDiagnosisRecordAttributes
  ): Promise<{
    errMsg?: string;
    data?: IDocument.ICreateAiDiagnosisRecordReturn;
  }> {
    return new Promise((resolve, reject) => {
      const payload = {
        petId,
        name: `AI Diagnosis Report - ${recordName} - ${new Date().toISOString().split("T")[0]}`, // better date format
        date: new Date(),
        attributes,
      };

      const validation = schemaValidation(
        DocumentSchemas.createAiDiagnosisRecord,
        payload
      );

      if (!validation.valid) {
        reject({
          errMsg:
            validation.error?.[0]?.message ||
            "Create AI diagnosis report failed.",
        });
        return;
      }

      createAiDiagnosisRecord(payload, {
        onSuccess: (data) => {
          resolve({
            data: data.data,
          });
        },
        onError(error) {
          reject(error)

        },
      });
    });
  }
  /**
   * ⚠️ Internal Helper Function ⚠️
   * This function is a sub-component of the analysis() process.
   * It is not intended to be called independently.
   * Do NOT invoke this function directly.
   */
  function constructAnimalPayload(
    petDetailInfo: Pet.IViewOneReturn
  ): Diagnosis.Animal | string {
    let errorMsg = "";
    if (!petDetailInfo.category) {
      errorMsg = "Pet category is required. Please update the animal details.";
    }

    if (!petDetailInfo.dob) {
      errorMsg =
        "Pet's date of birth is required. Please update the animal details.";
    }

    if (!petDetailInfo.gender) {
      errorMsg = "Pet's gender is required. Please update the animal details.";
    }

    if (!petDetailInfo.breed) {
      errorMsg = "Pet's breed is required. Please update the animal details.";
    }

    if (petDetailInfo.neuter === undefined) {
      errorMsg =
        "Pet's neuter status (yes/no) is required. Please update the animal details.";
    }

    if (errorMsg) {
      return errorMsg;
    }

    // Age calculation remains correct
    const today = new Date();
    const petDob = new Date(petDetailInfo.dob!);

    let age = today.getFullYear() - petDob.getFullYear();
    const monthDifference = today.getMonth() - petDob!.getMonth();

    if (
      monthDifference < 0 ||
      (monthDifference === 0 && today.getDate() < petDob.getDate())
    ) {
      age--;
    }

    return {
      type: petDetailInfo.category!,
      age,
      gender: petDetailInfo.gender!,
      breed: petDetailInfo.breed!,
      neutered: petDetailInfo.neuter!,
    };
  }

  /**
   * ⚠️ Internal Helper Function ⚠️
   * This function is a sub-component of the analysis() process.
   * It is not intended to be called independently.
   * Do NOT invoke this function directly.
   */
  function updateAiDiagnosisRecordHandler(
    petId: string,
    reportId: string,
    attributes: Omit<
      IDocument.IAiDiagnosisRecordAttributes,
      "referenceDocumentTypes"
    >
  ): Promise<{
    errMsg?: string;
    data?: IDocument.IUpdateAiDiagnosisRecordReturn;
  }> {
    return new Promise((resolve, reject) => {
      const payload: IDocument.IUpdateAiDiagnosisRecordPayload = {
        petId,
        reportId,
        attributes,
      };

      const validation = schemaValidation(
        DocumentSchemas.updateAiDiagnosisRecord,
        payload
      );

      if (!validation.valid) {
        reject({
          errMsg:
            validation.error?.[0]?.message ||
            "Update AI diagnosis report failed.",
        });
        return;
      }

      updateAiDiagnosisRecord(payload, {
        onSuccess: (data) => {
          resolve({
            data: data.data,
          });
        },
        onError: (error) => {
          reject(error);
        },
      });
    });
  }

  function serviceSubscriptionReturnErrorHandler(errorData: any): string {
    if (!errorData || !errorData.statusCode) {
      return errorData.message ?? "Internal Error"
    }
    switch (errorData.statusCode) {
      case 422:
        return errorData.message ?? "Unprocessabl Entity Exception";


      case 409:
        return errorData.message ?? "Conflict Exception";


      case 403:
        return errorData.message ?? "Forbidden Exception"


      default:
        return errorData.message ?? "Internal Error"

    }

  }

  return {
    statusMessage,
    aiDiagnosisRecords,
    scaning,
    analysis,
  };
};
