import { useMutation, useQueryClient } from "@tanstack/react-query";
import { services } from "services/index";
import { Diagnosis } from "services/api/types/ai-services.types";
import { IAuthContext, useAuthContext } from "context";
import { QUERY_KEYS } from "hooks/api/queryKeys";

export const useResetAllServiceSubscriptionUsage = () => {
  const queryClient = useQueryClient();
  const { setCsrfToken, csrfToken } = useAuthContext() as IAuthContext;

  const { mutate, isError, error, data, isPending } = useMutation({
    mutationFn: async (
      payload: Diagnosis.IResetAllServiceSubscriptionUsagePayload
    ) => {
      if (!csrfToken) {
        throw new Error("CSRF token is not available.");
      }

      return await services.api.ai.diagnosis.resetAllServiceSubscriptionUsage(
        {
          ...payload,
          csrfToken,
        }
      );
    },
    onSuccess: (data) => {
      setCsrfToken(data.headers["x-csrf-token"]);
      queryClient.invalidateQueries([QUERY_KEYS.AI.DIAGNOSIS.VIEW_ALL_SERVICE_SUBSCRIPTION] as any);
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
