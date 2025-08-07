import { useMutation } from "@tanstack/react-query";
import { services } from "services/index";
import { DocumentScanner } from "services/api/types/ai-services.types";
import { IAuthContext, useAuthContext } from "context";
import { useNotificationCreate } from "hooks/api/mutations";

export const useScanBloodReport= () => {
  const { mutate: createNotification } = useNotificationCreate()

  const { setCsrfToken, csrfToken } = useAuthContext() as IAuthContext;

  const { mutate, isError, error, data, isPending } = useMutation({
    mutationFn: async (payload: DocumentScanner.IScanBloodReportPayload) => {
      if (!csrfToken) {
        throw new Error("CSRF token is not available.");
      }
      
      return await services.api.ai.documentScanner.scanBloodReport({
        ...payload,
        csrfToken,
      });
    },
    onSuccess: (data) => {
      setCsrfToken(data.headers["x-csrf-token"]);
    },
    onError: (error) => {
      console.log(error, "<<< error useScanBloodReport");
      createNotification({
          title   : "Scan blood report Error",
          txt     : error.message,
          isRead  : false,
          createdAt: new Date(),
      })

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
