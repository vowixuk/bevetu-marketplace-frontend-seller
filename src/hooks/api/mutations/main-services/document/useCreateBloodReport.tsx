import { useMutation, useQueryClient } from "@tanstack/react-query";
import { services } from "services/index";
import { Document } from "services/api/types/main-services.types";
import { IAuthContext, useAuthContext } from "context";
import { QUERY_KEYS } from "hooks/api/queryKeys";

export const useCreateBloodReport = () => {
  const queryClient = useQueryClient();
  const { setCsrfToken, csrfToken } = useAuthContext() as IAuthContext;

  const { mutate, isError, error, data, isPending } = useMutation({
    mutationFn: async (payload: Document.ICreateBloodReportPayload) => {
      if (!csrfToken) {
        throw new Error("CSRF token is not available.");
      }
      return await services.api.main.document.createBloodReport({
        ...payload,
        csrfToken,
      });
    },
    onSuccess: (data) => {
      setCsrfToken(data.headers["x-csrf-token"]);
      queryClient.invalidateQueries([
        QUERY_KEYS.MAIN.DOCUMENT.VIEW_ALL_BLOOD_REPORTS,
      ] as any);
    },
    onError: (error) => {},
  });
  return {
    mutate,
    isError,
    error,
    data,
    isPending,
  };
};
