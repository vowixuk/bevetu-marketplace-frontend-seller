import { useMutation, useQueryClient } from "@tanstack/react-query";
import { services } from "services/index";
import { Document } from "services/api/types/main-services.types";
import { IAuthContext, useAuthContext } from "context";
import { QUERY_KEYS } from "hooks/api/queryKeys";

export const useDeleteVaccineRecord = () => {
  const queryClient = useQueryClient();
  const { setCsrfToken, csrfToken } = useAuthContext() as IAuthContext;

  const { mutate, isError, error, data, isPending } = useMutation({
    mutationFn: async (payload: Document.IDeleteVaccineRecordPayload) => {
      if (!csrfToken) {
        throw new Error("CSRF token is not available.");
      }

      const response = await services.api.main.document.deleteVaccineRecord({
        ...payload,
        csrfToken,
      });
      return response;
    },
    onSuccess: (data) => {
      const url = data.config.url;
      const parts = url!.split("/");
      const documentId = parts[parts.length - 1];
      setCsrfToken(data.headers["x-csrf-token"]);
      queryClient.removeQueries([
        QUERY_KEYS.MAIN.DOCUMENT.VIEW_ONE_VACCINE_RECORD(documentId),
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
