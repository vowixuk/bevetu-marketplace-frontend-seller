import { useMutation, useQueryClient } from "@tanstack/react-query";
import { services } from "services/index";
import { Subscription } from "services/api/types/main-services.types";
import { IAuthContext, useAuthContext } from "context";
import { QUERY_KEYS } from "hooks/api/queryKeys";

export const useCreatePaymentLink = () => {
  const queryClient = useQueryClient();
  const { setCsrfToken, csrfToken } = useAuthContext() as IAuthContext;

  const { mutate, isError, error, data, isPending } = useMutation({
    mutationFn: async (payload: Subscription.ICreatePaymentLinkPayload) => {
      if (!csrfToken) {
        throw new Error("CSRF token is not available.");
      }
      const response = await services.api.main.subscription.createPaymentLink({
        ...payload,
        csrfToken,
      });

      return response
    },
    onSuccess: (data) => {
      setCsrfToken(data.headers["x-csrf-token"]);
      queryClient.invalidateQueries([QUERY_KEYS.MAIN.USER.VIEW_PROFILE] as any);
      queryClient.invalidateQueries([
        QUERY_KEYS.MAIN.SUBSCRIPTION.VIEW_USER_RECENT_SUBSCRIPTION,
      ] as any);
      queryClient.invalidateQueries([
        QUERY_KEYS.MAIN.SUBSCRIPTION.VIEW_USER_ALL_SUBSCRIPTIONS,
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
