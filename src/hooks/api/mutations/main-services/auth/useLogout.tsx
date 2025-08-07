import { useMutation } from "@tanstack/react-query";
import { services } from "services/index";
import { IAuthContext, useAuthContext } from "context";

export const useLogout = () => {

 const { setCsrfToken,setIsAuth } = useAuthContext() as IAuthContext;

 const { mutate, isError, error, data } = useMutation({
   mutationFn: async () => await services.api.main.auth.logout({}),
   onSuccess: data => {
      setIsAuth(false);
      setCsrfToken(null);
   },
   onError: error => {
    setIsAuth(false);
    setCsrfToken(null);
   },
});
  return {
    logout: mutate,
    isError,
    error,
    data,
  };
};
