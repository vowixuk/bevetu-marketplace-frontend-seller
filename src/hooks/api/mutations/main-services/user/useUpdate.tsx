import { useMutation, useQueryClient } from "@tanstack/react-query";
import { services } from "services/index";
import { User } from "services/api/types/main-services.types";
import { IAuthContext, useAuthContext } from "context";
import { QUERY_KEYS } from "hooks/api/queryKeys";

export const useUpdate = () => {
const queryClient = useQueryClient(); 
 const { setCsrfToken,csrfToken} = useAuthContext() as IAuthContext;

 const { mutate, isError, error, data,isPending } = useMutation({
   mutationFn: async (payload: User.IUpdatePayload) => {

     if (!csrfToken) {
       throw new Error("CSRF token is not available.");
     }
     
     const response = await services.api.main.user.update({
       ...payload,
       csrfToken,
     });
     return response;
   },
   onSuccess: (data) => {
     setCsrfToken(data.headers["x-csrf-token"]);
     queryClient.invalidateQueries([QUERY_KEYS.MAIN.USER.VIEW_PROFILE] as any); 
     
   },
   onError: (error) => {
     
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
