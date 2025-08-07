import { useMutation } from "@tanstack/react-query";
import { services } from "services/index";
import { Diagnosis } from "services/api/types/ai-services.types";
import { IAuthContext, useAuthContext } from "context";

export const useAnalyseTestResult = () => {
  const { setCsrfToken, csrfToken } = useAuthContext() as IAuthContext;

  const { mutate, isError, error, data, isPending } = useMutation({
    mutationFn: async (payload: Diagnosis.IAnalyseTestResultPayload) => {
      if (!csrfToken) {
        throw new Error("CSRF token is not available.");
      }

      return await services.api.ai.diagnosis.analyseTestResult({
        ...payload,
        csrfToken,
      });
    },
    onSuccess: (data) => {
      setCsrfToken(data.headers["x-csrf-token"]);
    },
    onError: (error) => {
      console.log(error, "<<< error useAnalyseTestResult");
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
