import { useMutation } from "@tanstack/react-query";
import { services } from "services/index";
import { Diagnosis } from "services/api/types/ai-services.types";
import { IAuthContext, useAuthContext } from "context";


export const useProcessDiagnosis = () => {
  const { setCsrfToken, csrfToken } = useAuthContext() as IAuthContext;

  const { mutate, isError, error, data, isPending } = useMutation({
    mutationFn: async (payload: Diagnosis.IProcessDiagnosisPayload) => {
      if (!csrfToken) {
        throw new Error("CSRF token is not available.");
      }

      return await services.api.ai.diagnosis.processDiagnosis({
        ...payload,
        csrfToken,
      });
    },
    onSuccess: (data) => {
      setCsrfToken(data.headers["x-csrf-token"]);
    },
    onError: (error) => {
      console.log(error, "<<< error useProcessDiagnosis");
    },
  });
  return {
    mutate,
    isError,
    error,
    data,
    isPending,
  };
};
