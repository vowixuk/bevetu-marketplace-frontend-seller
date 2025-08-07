import React, { useEffect, useState } from "react";
import { useViewOneVaccineRecord } from "hooks/api/queries";
import {
  useDeleteVaccineRecord,
  useGetDownloadPresignUrl,
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
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;

  /**
   * Control the open/close of the 'CreateEditFormSlider'
   * When "edit" button is cliked:
   *  1 - This component will close
   *  2 - 'CreateEditForm' will open
   */
  setIsCreateEditFormOpen: React.Dispatch<React.SetStateAction<boolean>>;

  /**
   *  To tell the 'CreateEditFormSlider' to use the "EDIT"
   *  when open the createEditForm
   */
  setMode: React.Dispatch<React.SetStateAction<"CREATE" | "EDIT">>;

  single?: boolean;
}

export const useViewRecord = ({
  petGeneralInfo,
  recordId,
  setIsOpen,
  setIsCreateEditFormOpen,
  setMode,
}: IUseViewRecordProps) => {
  const { mutate: deleteRecord } = useDeleteVaccineRecord();
  const { mutate: getDocumentUrl } = useGetDownloadPresignUrl();
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"pdf" | "image" | null>(null);
  const { data: record } = useViewOneVaccineRecord({
    petId: petGeneralInfo.id,
    reportId: recordId,
  });

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
          documentUrlToBlobUrl(data.data.url).then(({ blobUrl, type }) => {
            setBlobUrl(blobUrl);
            setFileType(type);
          });
        },
        onError: (err) => {},
      });
    }
  }, [record]);

  const editRecordOnClickHandler = () => {
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setMode("EDIT");
    setIsOpen(false);
    setIsCreateEditFormOpen(true);
  };

  const deleteRecordOnClickHandler = () => {
    if (!recordId) return;

    const payload: DocumentType.IDeleteDailyRecordPayload = {
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
        onClose();
      },
      onError: (err) => {
        onClose();
      },
    });
  };

  const onClose = () => {
    if (blobUrl) URL.revokeObjectURL(blobUrl);
    setIsOpen(false);
  };

  return {
    // The data of this reocrd
    record,

    // Preview document use
    blobUrl,
    fileType,
    setBlobUrl,

    // Function
    onClose,
    deleteRecordOnClickHandler,
    editRecordOnClickHandler,
  };
};
