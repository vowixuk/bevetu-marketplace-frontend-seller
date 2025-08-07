/* ******************************************************
 * Create Edit Form  View
 * This component serves following function:
 * 1 - Wrapper the form (`CreateEditForm`)
 * 2 - Pass the empty payload to CreateEditForm.
 *     in where the payload will be constructed
 * 3 - Handle "Create" / "Update" function with the payload
 * 4 - Handle action that need to be done
 *     when this component is unmounted
 ********************************************************/

import React, { useState } from "react";
import {
  useCreateAppointmentRecord,
  useUpdateAppointmentRecord,
  useDeleteDocumentFromStorage,
} from "hooks/api/mutations";
import { useViewOneAppointmentRecord } from "hooks/api/queries";
import {
  Document as DocumentType,
  User,
} from "@services/api/types/main-services.types";
import { DocumentSchemas } from "schemas/main.schema";
import {
  ISchemaValidationError,
  schemaValidation,
} from "schemas/schemaValidator";


export interface IUseCreateEditFormSliderProps {
  /**
   * General information about the pet
   */
  petGeneralInfo: User.IPetGeneralInfo;

  /**
   * Whether the component is open
   */
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;

  /**
   * is user click it as "CREATE" or "EDIT"
   */
  mode?: "CREATE" | "EDIT";

  /**
   * Id of the record being edited;
   * only relevant when mode is "EDIT"
   */
  reportId?: string | undefined | null;
}

export const useCreateEditFormSlider = ({
  petGeneralInfo,
  isOpen,
  setIsOpen,
  mode = "CREATE", // default to be a "Create mode"
  reportId,
}: IUseCreateEditFormSliderProps) => {
  const [validationErrors, setValidationErrors] = useState<
    ISchemaValidationError[] | null
  >(null);

  const { mutate: createRecord } = useCreateAppointmentRecord();
  const { mutate: updateRecord } = useUpdateAppointmentRecord();
  const { mutate: deleteDocument } = useDeleteDocumentFromStorage();

  // Set Daily Record data (Related to Edit mode only)
  const { data: existingRecordData } = useViewOneAppointmentRecord({
    petId: petGeneralInfo.id,
    reportId: reportId!,
  });

  // Pass to "CreateEditForm" for construction
  const [payload, setPayload] = useState<
    | (DocumentType.ICreateAppointmentRecordPayload & { blobUrl?: string })
    | (DocumentType.IUpdateAppointmentRecordPayload & { blobUrl?: string })
    | null
  >(null);

  // Create Record Handler
  const createRecordOnClickHandler = () => {
    setValidationErrors(null);

    if (payload == null) return;

    const validation = schemaValidation(
      DocumentSchemas.createAppointmentRecord,
      payload
    );

    if (!validation.valid) {
      setValidationErrors(validation.error as ISchemaValidationError[]);
      return;
    }

    createRecord(payload as DocumentType.ICreateAppointmentRecordPayload, {
      onSuccess: (data) => {
        onClose();
      },
      onError: (err) => {},
    });
  };

  // Edit (Update) Record Handler
  const updateRecordOnClickHandler = () => {
    setValidationErrors(null);

    if (payload == null) return;

    const validation = schemaValidation(
      DocumentSchemas.updateAppointmentRecord,
      payload
    );

    if (!validation.valid) {
      setValidationErrors(validation.error as ISchemaValidationError[]);
      return;
    }

    updateRecord(payload as DocumentType.IUpdateAppointmentRecordPayload, {
      onSuccess: (data) => {
        onClose();
      },
      onError: (err) => {},
    });
  };

    const onClose = () => {
      if (payload?.blobUrl) URL.revokeObjectURL(payload.blobUrl);
      setIsOpen(false);
    };


  const onCloseWithoutSave = () => {
    if (payload?.blobUrl) URL.revokeObjectURL(payload.blobUrl);
    // The form was closed without creating or editing a record
    // (e.g. the user exited the form without saving).
    //
    // When a file is uploaded via the form, `payload.url` will be set.
    // Here's the issue:
    // - Uploaded files are immediately stored in S3.
    // - If the user closes the form without completing a create or edit action,
    //   no corresponding database record is created.
    // - This results in an orphaned file — a file not linked to any document.
    //
    // To avoid unnecessary storage usage, we need to clean up these orphaned files.

    if (payload && payload.url !== null && typeof payload.url == "string") {
      // Exceptional case during edit:
      // If a file is already linked to the existing record,
      // we compare its filename with the newly uploaded one (`payload.url`).
      // If the filenames match, it means the file hasn't changed.
      // In this case, we should NOT remove the file from storage.
      // This allows the unsaved record to retain the original file.

      if (mode === "EDIT" && existingRecordData?.url === payload.url) {
        setIsOpen(false);
        return;
      }

      deleteDocument(
        {
          petId: petGeneralInfo.id,
          documentType: "APPOINTMENT_RECORD",
          fileName: payload.url,
        },
        {
          onSuccess: (data) => {},
          onError: (error) => {},
        }
      );
    }

    setIsOpen(false);
  };

  return {
    validationErrors,
    payload,
    setValidationErrors,
    setPayload,
    updateRecordOnClickHandler,
    onCloseWithoutSave,
    createRecordOnClickHandler,
    existingRecordData,
  };
};

