/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Create/Edit Form
 *
 * This component manages input state and constructs the payload.
 * The parent component, “CreateEditFormView,” is responsible for submitting the form.
 */

import {
  Document as DocumentType,
  User,
} from "@services/api/types/main-services.types";
import { DEFAULT_RECORD_VALUE } from "./constants";
import { useGetDownloadPresignUrl } from "hooks/api/mutations";
import React, { useState, useEffect } from "react";

import {
  documentUrlToBlobUrl,
} from "components/DocumentUploader";

export interface IUseCreateEditFormProp {
  /**
   * General information about the pet
   */
  petGeneralInfo: User.IPetGeneralInfo;

  /**
   * Setter to update the payload as the form changes
   */
  setPayload: React.Dispatch<
    React.SetStateAction<
      | (DocumentType.ICreateBloodReportPayload & { blobUrl?: string })
      | (DocumentType.IUpdateBloodReportPayload & { blobUrl?: string })
      | null
    >
  >;

  /**
   * Form mode: CREATE or EDIT
   */
  mode: "CREATE" | "EDIT";

  /**
   * Id of the record being edited;
   * only relevant when mode is "EDIT"
   */
  reportId: string | undefined | null;

  /**
   * Only relevant when mode is "EDIT"
   * When user want to edit the record
   * this 'existingRecordData' store the current record data
   */
  existingRecordData?: DocumentType.IViewOneBloodReportReturn;
}

export const useCreateEditForm = ({
  petGeneralInfo,
  setPayload,
  reportId,
  mode,
  existingRecordData,
}: IUseCreateEditFormProp) => {
  /**
   * ******************************
   *   Form Input Field Section   *
   * ******************************
   * Following are the inputs of the form
   */
  const defaultValue = DEFAULT_RECORD_VALUE;
  const [recordName, setRecordName] = useState<string>(defaultValue.recordName);
  const [recordDate, setRecordDate] = useState<Date>(defaultValue.recordDate);

   const [uploadedFileName, setUploadedFileName] = useState<string | null>(
     null
   );
  /**
   * ***************************************
   *        Preview Handling Section       *
   * ***************************************
   * These are used in displaying the preview of the document
   */
  const { mutate: getDocumentUrl } = useGetDownloadPresignUrl();
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [fileType, setFileType] = useState<"pdf" | "image" | null>(null);

  /**
   * ***************************************
   *    Edit Mode Data Initiation Section  *
   * ***************************************
   * On EDIT mode,
   * this useEffect populates the form fields with the existing record’s values.
   */
  useEffect(() => {
    if (
      mode === "EDIT" &&
      !!existingRecordData 
      // !!existingRecordData.attributes
    ) {
      setRecordName(existingRecordData.name || defaultValue.recordName);
      setRecordDate(
        new Date(existingRecordData.date) || defaultValue.recordDate
      );

     
      // This is to get the address of the document in S3 Storage
      // After getting the address, fetch the file and put it into blob for preview

      if (
        existingRecordData.url && 
        typeof existingRecordData.url == "string"
      ) {
        setUploadedFileName(existingRecordData.url || null);

        const payload: DocumentType.IGetDownloadPresignedUrlPayload = {
          petId       : petGeneralInfo.id,
          documentType: existingRecordData.type,
          fileName    : existingRecordData.url,
        };

        getDocumentUrl(payload, {
          onSuccess: (data) => {
            documentUrlToBlobUrl(data.data.url)
              .then(({ blobUrl, type }) => {
                setBlobUrl(blobUrl);
                setFileType(type);
              });
          },
          onError: (err) => {},
        });
      } else {
        // console.log('here')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingRecordData]);

  /**
   * ***************************************
   *       Payload Preparation Section     *
   * ***************************************
   * This useEffect set the payload which will be used for 'create' / 'edit' function in parent component
   */
  useEffect(() => {
    const update = {
      petId: petGeneralInfo.id,
      name : recordName,
      date : recordDate,
      url  : uploadedFileName!,

      ...(uploadedFileName ? { url: uploadedFileName! } : {}),
      ...(!!reportId && mode === "EDIT" ? { reportId } : {}),
      ...(!!blobUrl ? { blobUrl } : {}),
    };

    setPayload(update);
  }, [
    defaultValue,
    mode,
    petGeneralInfo.id,
    recordDate,
    recordName,
    reportId,
    uploadedFileName,
    blobUrl,
  ]);

  /**
   * ***************************************
   *  Dynamic Input Field Hanlders Section *
   * ***************************************
   * The following handlers manage dynamic input fields (DIF) for adding,
   * updating, and removing records.
   */

  /**
   *  NO DIF in this form
   *  Please refer to "./AppointmentRecord/useCreatedEditForm.tsx"
   */
  
  return {
    // Form state values
    recordName,
    recordDate,
    uploadedFileName,
    blobUrl,
    fileType,
    defaultValue,   

    // Setters for form inputs
    setRecordName,
    setRecordDate,
    setUploadedFileName,
    getDocumentUrl,
    setBlobUrl,
    setFileType,
   
  };
};
