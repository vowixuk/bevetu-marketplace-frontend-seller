import { useMutation, useQueryClient } from "@tanstack/react-query";
import { services } from "services/index";
import { IAuthContext, useAuthContext } from "context";
import { User } from "services/api/types/main-services.types";

export const useDelete = () => {
  const queryClient = useQueryClient();
  const { setCsrfToken, csrfToken, setUser } = useAuthContext() as IAuthContext;

  const { mutate, isError, error, data, isPending } = useMutation({
    mutationFn: async (payload: User.IDeletePayload) => {
      if (!csrfToken) throw new Error("CSRF token is not available.");

      const response = await services.api.main.user.delete({
        ...payload,
        csrfToken,
      });
      return response;
    },
    onSuccess: (data) => {
      // more to clear?
      setCsrfToken(null);
      setUser(null)
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
