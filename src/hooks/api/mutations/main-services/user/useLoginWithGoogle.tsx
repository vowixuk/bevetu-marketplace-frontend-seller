import { useMutation } from "@tanstack/react-query";
import { services } from "services/index";
import { Authentication } from "services/api/types/main-services.types";
import { IAuthContext, useAuthContext } from "context";

export const useLoginWithGoogle = () => {

 const { setCsrfToken,setIsAuth, setUser } = useAuthContext() as IAuthContext;

 const { mutate, isError, error, data } = useMutation({
   mutationFn: async (payload: Authentication.ILoginWithGooglePayload) => {
     const response = await services.api.main.auth.loginWithGoogle(payload);
     return response;
   },
   onSuccess: (data) => {
     setCsrfToken(data.headers["x-csrf-token"]);
     setIsAuth(true)
     setUser({
       givenName: data.data.givenName || "",
       familyName: data.data.familyName || "",
       email: data.data.email || "",
       isNewUser: data.data.isNewUser,
       picture: data.data.picture || "",
     });
   },
   onError: (error) => {
    setIsAuth(false);
    setCsrfToken(null);
    setUser(null)
   },
});
  return {
    loginWithGoogle: mutate,
    isGoogleLoginError:isError,
    error,
    data,
  };
};
