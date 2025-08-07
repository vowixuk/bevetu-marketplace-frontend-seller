import { useEffect, useState } from "react";
import { Document,User } from "@services/api/types/main-services.types";
import { useNavigate } from "react-router-dom";
import { useViewOneAiDiagnosisRecord, useViewOneBloodReport } from "hooks/api/queries";
import { schemaValidation } from "schemas/schemaValidator";
import { toast } from "react-toastify";
import { useDeleteAiDiagnosisRecord, useUpdateAiDiagnosisRecord } from "hooks/api/mutations";
import { DocumentSchemas } from "schemas/main.schema";
import { useViewRecord } from "hooks/components/BloodReport";
import { v4 as uuidv4 } from "uuid";


interface useAIDisgnosisReportContentProps {
  /**
   *  General pet information
   */
  petGeneralInfo: User.IPetGeneralInfo;
  /**
   *  The id of the Ai diagnosis report
   */
  reportId: string;
}
 
const useAIDisgnosisReportContent = ( props: useAIDisgnosisReportContentProps) => {
  const { petGeneralInfo, reportId } = props;

  const navigate = useNavigate();

  /**
   *  query of fetaching the data for Ai diagnosis report
   */
  const { data: diagnosticRecord } = useViewOneAiDiagnosisRecord({
    petId: petGeneralInfo.id,
    reportId: reportId,
  });

  /**
   *  query of fetaching the data of blood report
   */
  const { data: bloodReport } = useViewOneBloodReport({
    petId: petGeneralInfo.id,
    reportId: diagnosticRecord?.attributes.referenceDocumentIds[0] || "",
  });

  /**
   *  `useViewRecord()` is the custimer hook.
   *  It returns the essential data to display the pdf of the blood report
   */
  const { record, blobUrl, fileType } = useViewRecord({
    petGeneralInfo,
    recordId: bloodReport?.id || "",
  });

  /**
   *  mutation of update the ai diagnosis record
   *  This is used if users change the analytical data and regenerate the AI Diagnosis Reprot.
   *  The new data generated will overwrite the old data by calling this mutation
   */
  const { mutate: updateAiDiagnosisRecord } = useUpdateAiDiagnosisRecord();

  /**
   *  mutation of delete this ai diagnosis record
   */
  const { mutate: deleteAiDiagnosisRecord } = useDeleteAiDiagnosisRecord();

  /**
   * state to store which tab the use is in (e.g. showing "diagnosis report page" or showing  "analytical data page")
   */
  const [recordTabsActive, setRecordTabsActive] = useState<number>(0);

  /**
   *  state to store if this file is public accessible
   */
  const [publicAccessible, setPublicAccessible] = useState<boolean>(false);

  /**
   * state to store the access password
   */
  const [accessPassword, setAccessPassword] = useState<string>("");

  /**
   *  state to store the sharable url
   */
  const [shareableUrl, setShareableUrl] = useState<string>("");

  /**
   *  state to store if the pdf is triggered to scale up
   */
  const [isScaleUp, setIsScaleUp] = useState<boolean>(false);

  /**
   *  state to store if the sharable url is copied
   */
  const [copied, setCopied] = useState<boolean>(false);

  /**
   *  state to store if the sharable url is copied
   */
  const [copiedPassword, setCopiedPassword] = useState<boolean>(false);

  /**
   *  function that let user to copy the sharable url
   */
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(shareableUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Show "Copied!" message briefly
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  }

  async function handleCopyPassword() {
    try {
      await navigator.clipboard.writeText(accessPassword);
      setCopiedPassword(true);
      setTimeout(() => setCopiedPassword(false), 2000); // Show "Copied!" message briefly
    } catch (err) {
      console.error("Failed to copy: ", err);
    }
  }

  const GeneratePassword = () => {
    setAccessPassword(uuidv4())
  }

  /**
   *  Handler that enable public access
   */
  function enablePublicAccess() {
    if (!accessPassword || accessPassword.trim() === "") {
      toast.error("Password cannot be empty", {
        theme: "colored",
        autoClose: 10000,
      });
      return;
    }

    const payload: Document.IUpdateAiDiagnosisRecordPayload = {
      petId: petGeneralInfo.id,
      reportId: reportId,
      attributes: {
        publicAccessible,
        accessPassword,
      },
    };

    const validation = schemaValidation(
      DocumentSchemas.updateAiDiagnosisRecord,
      payload
    );

    if (!validation.valid) {
      toast.error("Validation error", {
        theme: "colored",
        autoClose: 10000,
      });
      return;
    }

    updateAiDiagnosisRecord(payload, {
      onSuccess: (data) => {
        toast.success("Password Protection Enabled", {
          theme: "colored",
          autoClose: 10000,
        });
      },
      onError: (error) => {
        toast.error(JSON.stringify(error), {
          theme: "colored",
          autoClose: 10000,
        });
      },
    });
  }

  /**
   *  Handler that  disable public access
   */
  function disablePublicAccess() {
    setPublicAccessible(false);
    setAccessPassword("");

    const payload: Document.IUpdateAiDiagnosisRecordPayload = {
      petId: petGeneralInfo.id,
      reportId: reportId,
      attributes: {
        publicAccessible: false,
        accessPassword: "",
      },
    };

    const validation = schemaValidation(
      DocumentSchemas.updateAiDiagnosisRecord,
      payload
    );

    if (!validation.valid) {
      toast.error("Validation error", {
        theme: "colored",
        autoClose: 10000,
      });
      return;
    }

    updateAiDiagnosisRecord(payload, {
      onSuccess: (data) => {
        toast.success("Public access disabled", {
          theme: "colored",
          autoClose: 10000,
        });
      },
      onError: (error) => {
        toast.error(JSON.stringify(error), {
          theme: "colored",
          autoClose: 10000,
        });
      },
    });
  }

  /**
   *  Handler that removes the current viewing AI diagnosis report
   */
  function deleteDiagnosisReportHandler() {
    const payload: Document.IDeleteAiDiagnosisRecordPayload = {
      petId: petGeneralInfo.id,
      reportId: reportId,
    };

    const validation = schemaValidation(
      DocumentSchemas.deleteAiDiagnosisRecord,
      payload
    );

    if (!validation.valid) {
      toast.error("Validation error", {
        theme: "colored",
        autoClose: 10000,
      });
      return;
    }

    deleteAiDiagnosisRecord(payload, {
      onSuccess: (data) => {
        toast.success("AI diagnosis report Deleted", {
          theme: "colored",
          autoClose: 10000,
        });
        navigate(
          `/ai-diagnosis/${petGeneralInfo.id}/${petGeneralInfo.id}`,
          {
            replace: true,
          }
        );
      },
      onError: (error) => {
        toast.error(JSON.stringify(error), {
          theme: "colored",
          autoClose: 10000,
        });
      },
    });
  }

  /**
   *  Change the viewing secction
   *  e.g. 'Analytical data page' or 'AI Diagnosis Report Page' 
   */
  function RegenClick ()  {
    setRecordTabsActive(0);
  };

  /**
   *  Initial configuration when  thecomponent is mounted
   */
  useEffect(() => {
    if (diagnosticRecord) {
      if (diagnosticRecord.attributes.publicAccessible) {
        setPublicAccessible(diagnosticRecord.attributes.publicAccessible);
      }

      if (diagnosticRecord.attributes.accessPassword) {
        setAccessPassword(diagnosticRecord.attributes.accessPassword || "");
      }

      const _shareableUrl = `${process.env.REACT_APP_BASE_URL}/public-access/ai-diagnosis/${petGeneralInfo.id}/${reportId}`;
      setShareableUrl(_shareableUrl);
    }
  }, [diagnosticRecord, petGeneralInfo.id, reportId]);

  return {
    diagnosticRecord,
    bloodReport,
    blobUrl,
    fileType,
    updateAiDiagnosisRecord,
    deleteAiDiagnosisRecord,
    recordTabsActive,
    setRecordTabsActive,
    publicAccessible,
    setPublicAccessible,
    accessPassword,
    setAccessPassword,
    shareableUrl,
    setShareableUrl,
    isScaleUp,
    setIsScaleUp,
    copied,
    setCopied,
    handleCopy,
    enablePublicAccess,
    disablePublicAccess,
    deleteDiagnosisReportHandler,
    navigate,
    RegenClick,
    handleCopyPassword,
    copiedPassword,
    GeneratePassword,
  };
};
 
export default useAIDisgnosisReportContent;
