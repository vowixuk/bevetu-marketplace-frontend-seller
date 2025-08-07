import {
  useMutation,
  useQueryClient,
  UseMutationResult,
} from "@tanstack/react-query";
import { services } from "services/index";
import { Notification } from "services/api/types/main-services.types";
import { IAuthContext, useAuthContext } from "context";
import { QUERY_KEYS } from "hooks/api/queryKeys";
import { AxiosResponse } from "axios";

export const useNotificationCreate = (): UseMutationResult<
  AxiosResponse<Notification.ICreateReturn>,
  Error,
  Notification.ICreatePayload
> => {
  const queryClient = useQueryClient();
  const { setCsrfToken, csrfToken } = useAuthContext() as IAuthContext;

  return  useMutation({
    mutationFn: async (payload: Notification.ICreatePayload) => {
      if (!csrfToken) throw new Error("CSRF token is not available.");
      console.log(payload, "<< payload")
      return await services.api.main.notification.create({
        ...payload,
        csrfToken,
      });
    },
    onSuccess: (data) => {
      setCsrfToken(data.headers["x-csrf-token"]);
      queryClient.invalidateQueries([QUERY_KEYS.MAIN.NOTIFICATION.CREATE] as any);
    },
    onError: (error) => {},
  });
};
