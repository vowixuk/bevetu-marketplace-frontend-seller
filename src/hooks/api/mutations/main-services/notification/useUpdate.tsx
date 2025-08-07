import { useMutation, UseMutationResult, useQueryClient } from "@tanstack/react-query";
import { services } from "services/index";
import { Notification } from "services/api/types/main-services.types";
import { IAuthContext, useAuthContext } from "context";
import { QUERY_KEYS } from "hooks/api/queryKeys";
import { AxiosResponse } from "axios";

export const useNotificationUpdate = (): UseMutationResult<
  AxiosResponse<Notification.IUpdateReturn>,
  Error, 
  Notification.IUpdatePayload
> => {
  const queryClient = useQueryClient();
  const { setCsrfToken, csrfToken } = useAuthContext() as IAuthContext;

  return  useMutation({
    mutationFn: async (payload: Notification.IUpdatePayload) => {
      if (!csrfToken) {
        throw new Error("CSRF token is not available.");
      }

      const response = await services.api.main.notification.update({
        ...payload,
        csrfToken,
      });

      return response;
    },
    onSuccess: (data) => {
      setCsrfToken(data.headers["x-csrf-token"]);
      queryClient.invalidateQueries([QUERY_KEYS.MAIN.NOTIFICATION.UPDATE] as any);
    },
    onError: (error) => {},
  });
};
