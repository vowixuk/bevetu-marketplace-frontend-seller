/* ******************************************************
 * Create Daily Record View (containing the create form)
 ********************************************************/

import React, { useState } from "react";
import { useViewOneDailyRecord } from "hooks/api/queries";
import {
  useCreateDailyRecord,
  useUpdateDailyRecord,
} from "hooks/api/mutations";
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
   * Whether the slider is open
   */
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;

  /**
   * Slider mode: CREATE or EDIT
   */
  mode?: "CREATE" | "EDIT";

  /**
   * Id of the record being edited;
   * only relevant when mode is "EDIT"
   */
  reportId: string | undefined | null;
}

export const useCreateEditFormSlider = ({
  petGeneralInfo,
  isOpen,
  setIsOpen,
  mode = "CREATE", // default to be a "Create mode"
  reportId,
}: IUseCreateEditFormSliderProps) => {
  const [validationErrors, setValidationErrors] = useState< ISchemaValidationError[] | null >(null);
  const { mutate: createDailyRecord } = useCreateDailyRecord();
  const { mutate: updateDailyRecord } = useUpdateDailyRecord();
  const [payload, setPayload] = useState<
    | DocumentType.ICreateDailyRecordPayload
    | DocumentType.IUpdateDailyRecordPayload
    | null
  >(null);

  // Set Daily Record data (Related to Edit mode only)
  const { data: existingRecordData } = useViewOneDailyRecord({
    petId: petGeneralInfo.id,
    reportId: reportId!,
  });
  
  // Create Daily Record Handler
  const createRecordOnClickHandler = () => {
    setValidationErrors(null);

    if (payload == null) return;

    const validation = schemaValidation(
      DocumentSchemas.createDailyRecord,
      payload
    );

    // console.log(payload, "<<< payload, createRecordOnClickHandler")

    if (!validation.valid) {
      setValidationErrors(validation.error as ISchemaValidationError[]);
      return;
    }

    createDailyRecord(payload as DocumentType.ICreateDailyRecordPayload, {
      onSuccess: (data) => {
        setIsOpen((prev: boolean) => !prev);
      },
      onError: (err) => {},
    });
  };

  // Edit (Update) Daily Record Handler
  const updateRecordOnClickHandler = () => {
    setValidationErrors(null);

    if (payload == null) return;

    // console.log(payload, "<<< payload, updateRecordOnClickHandler")

    const validation = schemaValidation(
      DocumentSchemas.updateDailyRecord,
      payload
    );

    if (!validation.valid) {
      setValidationErrors(validation.error as ISchemaValidationError[]);
      return;
    }

    updateDailyRecord(payload as DocumentType.IUpdateDailyRecordPayload, {
      onSuccess: (data) => {
        setIsOpen((prev: boolean) => !prev);
      },
      onError: (err) => {},
    });
  };


  const onCloseWithoutSave = () => {
    /* *******************************************************
     * !! Uncomment the below if <DocumnerUplaoder/> is used *
     * *******************************************************/
    // // The form was closed without creating or editing a record
    // // (e.g. the user exited the form without saving).
    // //
    // // When a file is uploaded via the form, `payload.url` will be set.
    // // Here's the issue:
    // // - Uploaded files are immediately stored in S3.
    // // - If the user closes the form without completing a create or edit action,
    // //   no corresponding database record is created.
    // // - This results in an orphaned file — a file not linked to any document.
    // //
    // // To avoid unnecessary storage usage, we need to clean up these orphaned files.

    // if (payload && payload.url !== null && typeof payload.url == "string") {
    //   // Exceptional case during edit:
    //   // If a file is already linked to the existing record,
    //   // we compare its filename with the newly uploaded one (`payload.url`).
    //   // If the filenames match, it means the file hasn't changed.
    //   // In this case, we should NOT remove the file from storage.
    //   // This allows the unsaved record to retain the original file.

    //   if (mode === "EDIT" && existingRecordData?.url === payload.url) {
    //     setIsOpen(false);
    //     return;
    //   }

    //   deleteDocument(
    //     {
    //       petId: petGeneralInfo.id,
    //       documentType: "VACCINE_RECORD",
    //       fileName: payload.url,
    //     },
    //     {
    //       onSuccess: (data) => {},
    //       onError: (error) => {},
    //     }
    //   );
    // }

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


