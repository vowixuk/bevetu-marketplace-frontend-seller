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
import { v4 as uuidv4 } from 'uuid';

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
      | (DocumentType.ICreateAppointmentRecordPayload & { blobUrl?: string })
      | (DocumentType.IUpdateAppointmentRecordPayload & { blobUrl?: string })
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
  existingRecordData?: DocumentType.IViewOneAppointmentRecordReturn;
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

  const [dateOfVisit, setDateOfVisit] = useState<string>(
    defaultValue.dateOfVisit
  );
  const [clinicName, setClinicName] = useState<string>(defaultValue.clinicName);
  const [clinicLocation, setClinicLocation] = useState<string>(
    defaultValue.clinicLocation
  );
  const [vetName, setVetName] = useState<string>(defaultValue.vetName);
  const [reasonOfVisit, setReasonOfVisit] = useState<string>(
    defaultValue.reasonOfVisit
  );
  const [diagnosis, setDiagnosis] = useState<string>(defaultValue.diagnosis);

  const [treatmentDone, setTreatmentDone] = useState<string>(
    defaultValue.treatmentDone!
  );
  const [followUpInstructions, setFollowUpInstructions] = useState<string>(
    defaultValue.followUpInstructions!
  );
  const [others, setOthers] = useState<string>(defaultValue.others!);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);

  // DIF
  const [prescriptions, setPrescriptions] = useState<
    typeof defaultValue.prescriptions
  >(defaultValue.prescriptions);

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
      !!existingRecordData &&
      !!existingRecordData.attributes
    ) {
      let existingPrescriptionRecords: React.SetStateAction<
        (DocumentType.IPrescriptionsAttributes & { id: string })[]
      > = [];
      if (
        existingRecordData.attributes.prescriptions &&
        existingRecordData.attributes.prescriptions.length > 0
      ) {
        existingPrescriptionRecords =
          existingRecordData.attributes.prescriptions.map((record) => ({
            ...record,
            id: uuidv4(),
          }));
      }

      setRecordName(existingRecordData.name || defaultValue.recordName);
      setRecordDate(
        new Date(existingRecordData.date) || defaultValue.recordDate
      );
      setPrescriptions(existingPrescriptionRecords);
      setDateOfVisit(
        existingRecordData.attributes.dateOfVisit || defaultValue.dateOfVisit
      );
      setClinicName(
        existingRecordData.attributes.clinicName || defaultValue.clinicName
      );
      setClinicLocation(
        existingRecordData.attributes.clinicLocation ||
          defaultValue.clinicLocation
      );
      setVetName(existingRecordData.attributes.vetName || defaultValue.vetName);
      setReasonOfVisit(
        existingRecordData.attributes.reasonOfVisit ||
          defaultValue.reasonOfVisit
      );
      setDiagnosis(
        existingRecordData.attributes.diagnosis || defaultValue.diagnosis
      );
      setTreatmentDone(
        existingRecordData.attributes.treatmentDone ||
          defaultValue.treatmentDone!
      );
      setFollowUpInstructions(
        existingRecordData.attributes.followUpInstructions ||
          defaultValue.followUpInstructions!
      );
      setOthers(existingRecordData.attributes.others || defaultValue.others!);

      // This is to get the address of the document in S3 Storage
      // After getting the address, fetch the file and put it into blob for preview

      if (existingRecordData.url && typeof existingRecordData.url == "string") {
        setUploadedFileName(existingRecordData.url || null);

        const payload: DocumentType.IGetDownloadPresignedUrlPayload = {
          petId: petGeneralInfo.id,
          documentType: existingRecordData.type,
          fileName: existingRecordData.url,
        };

        getDocumentUrl(payload, {
          onSuccess: (data) => {
            documentUrlToBlobUrl(data.data.url).then(({ blobUrl, type }) => {
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
    /**
     * to remove record that is same as default value
     */
    function filterUnusedInput<T extends { id?: string }>(
      recordGroup: "prescriptions",
      records: T[]
    ): T[] {
      const comparable = (defaultValue[recordGroup] as unknown as T[])[0];
      delete comparable.id;

      return records.filter((r) => {
        const recordCopy = { ...r };
        delete recordCopy.id;
        return JSON.stringify(recordCopy) !== JSON.stringify(comparable);
      });
    }

    const update = {
      petId: petGeneralInfo.id,
      name: recordName,
      date: recordDate,
      url: uploadedFileName!,
      attributes: {
        dateOfVisit,
        clinicName,
        clinicLocation,
        vetName,
        reasonOfVisit,
        diagnosis,
        prescriptions: filterUnusedInput("prescriptions", prescriptions),
        treatmentDone,
        followUpInstructions,
        others,
      },
      ...(uploadedFileName ? { url: uploadedFileName! } : {}),
      ...(!!reportId && mode === "EDIT" ? { reportId } : {}),
      ...(!!blobUrl ? { blobUrl } : {}),
    };

    setPayload(update);
  }, [
    clinicLocation,
    clinicName,
    dateOfVisit,
    defaultValue,
    diagnosis,
    followUpInstructions,
    mode,
    others,
    petGeneralInfo.id,
    prescriptions,
    reasonOfVisit,
    recordDate,
    recordName,
    reportId,
    treatmentDone,
    vetName,
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
  const handlePrescriptionChange = (
    index: string,
    field: keyof DocumentType.IPrescriptionsAttributes,
    value: DocumentType.IPrescriptionsAttributes[keyof DocumentType.IPrescriptionsAttributes]
  ) => {
    const updated = prescriptions.map((record) => {
      if (record.id === index) {
        return { ...record, [field]: value };
      }
      return record;
    });
    setPrescriptions(updated);
  };

  const removePrescription = (id: string) => {
    const update = prescriptions.filter((r) => r.id !== id);
    setPrescriptions(update);
  };

  const addPrescription = () => {
    const update = {
      ...defaultValue.prescriptions[0],
      id: uuidv4(),
    };
    setPrescriptions([...prescriptions, ...[update]]);
  };

  return {
    // Form state values
    recordName,
    recordDate,
    dateOfVisit,
    clinicName,
    clinicLocation,
    vetName,
    reasonOfVisit,
    diagnosis,
    treatmentDone,
    followUpInstructions,
    others,
    prescriptions,
    uploadedFileName,
    blobUrl,
    fileType,
    defaultValue,

    // Setters for form inputs
    setRecordName,
    setRecordDate,
    setDateOfVisit,
    setClinicName,
    setClinicLocation,
    setVetName,
    setReasonOfVisit,
    setDiagnosis,
    setTreatmentDone,
    setFollowUpInstructions,
    setOthers,
    setUploadedFileName,
    setPrescriptions,
    getDocumentUrl,
    setBlobUrl,
    setFileType,

    // Dynamic input handlers
    handlePrescriptionChange,
    addPrescription,
    removePrescription,
  };
};


