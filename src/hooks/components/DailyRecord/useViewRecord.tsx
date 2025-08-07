import React, { useState } from "react";
import { useViewOneDailyRecord } from "hooks/api/queries";
import { useDeleteDailyRecord } from "hooks/api/mutations";
import {
  Document as DocumentType,
  User,
} from "@services/api/types/main-services.types";
import { DocumentSchemas } from "schemas/main.schema";
import {
  ISchemaValidationError,
  schemaValidation,
} from "schemas/schemaValidator";


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
   */
  setMode: React.Dispatch<React.SetStateAction<"CREATE" | "EDIT">>;
  onClick?: () => void;
}

export const useViewRecord = ({
  petGeneralInfo,
  recordId,
  setIsOpen,
  setIsCreateEditFormOpen,
  setMode,
}: IUseViewRecordProps) => {
  const { mutate: deleteDailyRecord } = useDeleteDailyRecord();
  const [validationErrors, setValidationErrors] = useState< ISchemaValidationError[] | null >(null);  
  const { data: record } = useViewOneDailyRecord({
    petId: petGeneralInfo.id,
    reportId: recordId,
  });

  const editRecordOnClickHandler = () => {
    setMode("EDIT");
    setIsOpen((prev) => !prev);
    setIsCreateEditFormOpen((prev) => !prev);
  };

  const deleteRecordOnClickHandler = () => {
    setValidationErrors(null);

    if (!recordId) return;
    const payload: DocumentType.IDeleteDailyRecordPayload = {
      petId: petGeneralInfo.id,
      reportId: recordId,
    };

    const validation = schemaValidation(
      DocumentSchemas.deleteDailyRecord,
      payload
    );

    if (!validation.valid) {
      setValidationErrors(validation.error as ISchemaValidationError[]);
      return;
    }

    deleteDailyRecord(payload, {
      onSuccess: (data) => {
        setIsOpen(false);
      },
      onError: (err) => {},
    });
  };

  return {
    record,
    validationErrors,
    setValidationErrors,
    deleteDailyRecord,
    deleteRecordOnClickHandler,
    editRecordOnClickHandler,
  };
};
