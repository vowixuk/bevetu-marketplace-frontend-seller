import { useEffect, useState } from "react";
import { useViewAllDiagnosisServiceSubscription, useViewAllDocumentScannerServiceSubscription, useViewOneBloodReport } from "hooks/api/queries";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useDeleteBloodReport,
  useGetDownloadPresignUrl,
  useUpdateBloodReport,
} from "hooks/api/mutations";
import {
  Document as DocumentType,
  User,
} from "@services/api/types/main-services.types";
import { DocumentSchemas } from "schemas/main.schema";
import { schemaValidation } from "schemas/schemaValidator";

import {
  documentUrlToBlobUrl,
} from "../../../components/DocumentUploader";

export interface IUseViewRecordProps {
  /**
   * Pet's genernal information
   */
  petGeneralInfo: User.IPetGeneralInfo;


  /**
   * Record Id
   */
  recordId: string;

  /**
   * Control the open/close of this component
   */
  // setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;

  /**
   * Control the open/close of the 'CreateEditFormSlider'
   * When "edit" button is cliked:
   *  1 - This component will close
   *  2 - 'CreateEditForm' will open
   */
  // setIsCreateEditFormOpen: React.Dispatch<React.SetStateAction<boolean>>;

  /**
   *  To tell the 'CreateEditFormSlider' to use the "EDIT"
   *  when open the createEditForm
   */
  // setMode: React.Dispatch<React.SetStateAction<"CREATE" | "EDIT">>;

}

export const useViewRecord = ({
  petGeneralInfo,
  recordId,
}: IUseViewRecordProps) => {
  const navigate = useNavigate();

  // Import Delete API
  const { mutate: deleteRecord }   = useDeleteBloodReport();
  const { mutate: updateRecord }   = useUpdateBloodReport();
  const { mutate: getDocumentUrl } = useGetDownloadPresignUrl();

  const { data: diagnosisServiceSubscriptions } =
    useViewAllDiagnosisServiceSubscription({});
  const { data: documentScannerServiceSubscriptions } =
    useViewAllDocumentScannerServiceSubscription({});

  // set document's blob  and  file
  const [blob, setBlob]         = useState<Blob | null>(null);
  const [blobUrl, setBlobUrl]   = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"pdf" | "image" | null>(null);
  const [file, setFile]         = useState<File | null>(null);

  // set Record data
  const { data: record } = useViewOneBloodReport({
    petId: petGeneralInfo.id,
    reportId: recordId,
  });

  // set is edit mode
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [recordName, setRecordName] = useState<string | null>(record?.name || null);
  const [recordDate, setRecordDate] = useState<Date| null>(record?.date || null);


  useEffect(()=>{
    if (record && record.name && record.date) {
      setRecordName(record.name);
      setRecordDate(new Date(record.date));
    }
  },[record])

  /**
   *  Clean up the blob when this component is dismounted
   */
  useEffect(() => {
    return () => {
      removeBlobFromBrowser();
    };
  }, []);

  /**
   * This useEffect checks whether the record has an attached document or file.
   * If so, it downloads the file and converts it to a blob URL.
   */
  useEffect(() => {
    if (record && record.url !== null && typeof record.url == "string") {
      const payload: DocumentType.IGetDownloadPresignedUrlPayload = {
        petId: petGeneralInfo.id,
        documentType: record.type,
        fileName: record.url,
      };

      const validation = schemaValidation(
        DocumentSchemas.getDownloadPresignedUrl,
        payload
      );

      if (!validation.valid) return;

      getDocumentUrl(payload, {
        onSuccess: (data) => {
          documentUrlToBlobUrl(data.data.url).then(
            ({ blobUrl, type, blob, filename, file }) => {
              setBlobUrl(blobUrl);
              setFileType(type);
              setBlob(blob);
              setFilename(filename);
              setFile(file);
            }
          );
        },
        onError: (err) => {},
      });
    }
  }, [getDocumentUrl, petGeneralInfo.id, record]);

  const editRecordHandler = () => {

    if (!recordId) return;

    const payload: DocumentType.IUpdateBloodReportPayload = {
      petId: petGeneralInfo.id,
      reportId: recordId,
      name: recordName!,
      date: recordDate!
    };

     const validation = schemaValidation(
       DocumentSchemas.updateBloodReport,
       payload
     );

    if (!validation.valid){
      toast.error('Validation failed',{
        theme: "colored",
        autoClose: 10000,
      })

      return
    }

    updateRecord(payload,{
      onSuccess: () =>{
        toast.success("Update successful.", {
          theme: "colored",
          autoClose: 10000,
        });
      },
      onError: () => {
        toast.error("Updated record failed.", {
          theme: "colored",
          autoClose: 10000,
        });
      },
      onSettled:()=>{
       setIsEditMode(false)

      }
    });
  };

  const deleteRecordHandler = () => {
    if (!recordId) return;

    const payload: DocumentType.IDeleteBloodReportPayload = {
      petId: petGeneralInfo.id,
      reportId: recordId,
    };

    const validation = schemaValidation(
      DocumentSchemas.deleteDailyRecord,
      payload
    );

    if (!validation.valid) return;

    deleteRecord(payload, {
      onSuccess: (data) => {     
        navigate(
          `/records/${petGeneralInfo.name}/${petGeneralInfo.id}`,
          {
            replace: true,
          }
        );
      },
      onError: (err) => {
        toast.error("Delete record failed.", {
          theme: "colored",
          autoClose: 10000,
        });
      },
    });
  };

  // const onClose = () => {
  //   if (blobUrl) URL.revokeObjectURL(blobUrl);
  //   setIsOpen(false);
  // };

  function removeBlobFromBrowser() {
    if (blobUrl) URL.revokeObjectURL(blobUrl);
  }


  function resetNameAndDate(){
    setRecordName(record!.name)
    setRecordDate(new Date(record!.date))
  }

  return {
    // The data of this reocrd
    record,

    // Preview document use
    blob,
    blobUrl,
    fileType,
    filename,
    file,
    setBlobUrl,
    removeBlobFromBrowser,

    // Function

    deleteRecordHandler,
    editRecordHandler,

    isEditMode,
    setIsEditMode,
    recordName,
    setRecordName,
    recordDate,
    setRecordDate,

    resetNameAndDate,

    diagnosisServiceSubscriptions,
    documentScannerServiceSubscriptions,
  };
};
