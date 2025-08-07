import { useQuery } from "@tanstack/react-query";
import { IAuthContext, useAuthContext } from "context/AuthContext";
import { QUERY_KEYS } from "hooks/api/queryKeys";
import { services } from "services/index";



export const useViewAllProducts = () => {
  const { setCsrfToken, csrfToken } = useAuthContext() as IAuthContext;
  const { data, error, isError, refetch, isLoading } = useQuery({
    queryKey: [QUERY_KEYS.MAIN.SUBSCRIPTION.VIEW_ALL_PRODUCTS],
    queryFn: async () => {
      try {
        if (!csrfToken) {
          throw new Error("CSRF token is not available.");
        }
        const data = await services.api.main.subscription.viewAllProducts({
          csrfToken: csrfToken as string,
        });

        if (data.status === 200) {
          setCsrfToken(data.headers["x-csrf-token"]);
          const {
            BVT_FREE_TRIAL,
            BVT_ANNUAL_USD,
            BVT_MONTHLY_USD,
            BVT_ANNUAL_GBP,
            BVT_MONTHLY_GBP,
            BVT_ANNUAL_HKD,
            BVT_MONTHLY_HKD
          } = data.data

          const productsGroupByCurrency = {
            freeTrial: [BVT_FREE_TRIAL],
            gbp: [BVT_MONTHLY_GBP, BVT_ANNUAL_GBP],
            hkd: [BVT_MONTHLY_HKD, BVT_ANNUAL_HKD],
            usd: [BVT_MONTHLY_USD, BVT_ANNUAL_USD],
          };
          return productsGroupByCurrency;
        }
        throw new Error();
      } catch (error) {

        return null;
      }
    },

    refetchOnMount: true,
    refetchOnWindowFocus: true,
    enabled: !!csrfToken,
  });

  return {
    refetch,
    isError,
    error,
    data: data,
    isLoading,
  };
};
