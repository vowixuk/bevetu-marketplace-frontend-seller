import {
  useMutation,
  useQueryClient,
  UseMutationResult,
} from "@tanstack/react-query";
import { services } from "services/index";
import { Pet } from "services/api/types/main-services.types";
import { IAuthContext, useAuthContext } from "context";
import { QUERY_KEYS } from "hooks/api/queryKeys";
import { AxiosResponse } from "axios";

export const useCreate = (): UseMutationResult<
  AxiosResponse<Pet.ICreateReturn>,
  Error,
  Pet.ICreatePayload
> => {
  const queryClient = useQueryClient();
  const { setCsrfToken, csrfToken } = useAuthContext() as IAuthContext;

  return  useMutation({
    mutationFn: async (payload: Pet.ICreatePayload) => {
      if (!csrfToken) {
        throw new Error("CSRF token is not available.");
      }
      return await services.api.main.pet.create({
        ...payload,
        csrfToken,
      });
    },
    onSuccess: (data) => {
      setCsrfToken(data.headers["x-csrf-token"]);
      queryClient.invalidateQueries([QUERY_KEYS.MAIN.USER.VIEW_PROFILE] as any);
    },
    onError: (error) => {},
  });
};
