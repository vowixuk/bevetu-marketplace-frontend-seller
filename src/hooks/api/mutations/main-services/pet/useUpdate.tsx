import { useMutation, UseMutationResult, useQueryClient } from "@tanstack/react-query";
import { services } from "services/index";
import { Pet } from "services/api/types/main-services.types";
import { IAuthContext, useAuthContext } from "context";
import { QUERY_KEYS } from "hooks/api/queryKeys";
import { AxiosResponse } from "axios";

export const useUpdate = (): UseMutationResult<
  AxiosResponse<Pet.IUpdateReturn>,
  Error, 
  Pet.IUpdatePayload
> => {
  const queryClient = useQueryClient();
  const { setCsrfToken, csrfToken } = useAuthContext() as IAuthContext;

  return  useMutation({
    mutationFn: async (payload: Pet.IUpdatePayload) => {
      if (!csrfToken) {
        throw new Error("CSRF token is not available.");
      }

      const response = await services.api.main.pet.update({
        ...payload,
        csrfToken,
      });

      return response;
    },
    onSuccess: (data) => {
      const url = data.config.url;
      const parts = url!.split("/");
      const petId = parts[parts.length - 1];
      setCsrfToken(data.headers["x-csrf-token"]);
      queryClient.invalidateQueries([QUERY_KEYS.MAIN.USER.VIEW_PROFILE] as any);
      queryClient.invalidateQueries([
        QUERY_KEYS.MAIN.PET.VIEW_ONE(petId),
      ] as any);
    },
    onError: (error) => {},
  });
};
