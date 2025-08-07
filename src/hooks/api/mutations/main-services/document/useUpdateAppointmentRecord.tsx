import { useMutation, useQueryClient } from "@tanstack/react-query";
import { services } from "services/index";
import { Document } from "services/api/types/main-services.types";
import { IAuthContext, useAuthContext } from "context";
import { QUERY_KEYS } from "hooks/api/queryKeys";

export const useUpdateAppointmentRecord = () => {
  const queryClient = useQueryClient();
  const { setCsrfToken, csrfToken } = useAuthContext() as IAuthContext;

  const { mutate, isError, error, data, isPending } = useMutation({
    mutationFn: async (payload: Document.IUpdateAppointmentRecordPayload) => {
      if (!csrfToken) {
        throw new Error("CSRF token is not available.");
      }
      return await services.api.main.document.updateAppointmentRecord({
        ...payload,
        csrfToken,
      });
    },
    onSuccess: (data) => {
      const url = data.config.url;
      const parts = url!.split("/");
      const documentId = parts[parts.length - 1];
      setCsrfToken(data.headers["x-csrf-token"]);
      queryClient.invalidateQueries([
        QUERY_KEYS.MAIN.DOCUMENT.VIEW_ALL_APPOINTMENT_RECORDS,
      ] as any);
      queryClient.invalidateQueries([
        QUERY_KEYS.MAIN.DOCUMENT.VIEW_ONE_APPOINTMENT_RECORD(documentId),
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
