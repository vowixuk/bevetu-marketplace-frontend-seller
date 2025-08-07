import { useMutation, useQueryClient } from "@tanstack/react-query";
import { services } from "services/index";
import { Pet, User } from "services/api/types/main-services.types";
import { IAuthContext, useAuthContext } from "context";
import { QUERY_KEYS } from "hooks/api/queryKeys";

export const useSoftDelete = () => {

  const queryClient = useQueryClient();
  const { setCsrfToken, csrfToken } = useAuthContext() as IAuthContext;

  const { mutate, isError, error, data, isPending } = useMutation({
    mutationFn: async (payload: Pet.ISoftDeletePayload) => {
      if (!csrfToken) {
        throw new Error("CSRF token is not available.");
      }


      const response = await services.api.main.pet.softDelete({
        ...payload,
        csrfToken,
      });
      return response;
    },
    onSuccess: (data) => {
      const url = data.config.url
      const parts = url!.split("/");
      const petId = parts[parts.length - 2];
  
      setCsrfToken(data.headers["x-csrf-token"]);
      queryClient.invalidateQueries([QUERY_KEYS.MAIN.USER.VIEW_PROFILE] as any);
      queryClient.invalidateQueries([
        QUERY_KEYS.MAIN.PET.VIEW_ONE(petId),
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
