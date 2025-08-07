import { useMutation } from "@tanstack/react-query";
import { services } from "services/index";
import { Document } from "services/api/types/main-services.types";
import { IAuthContext, useAuthContext } from "context";

/**
 * ⚠️ This function is intended **only** for removing preview files that are already stored in Storage
 * and are **not** associated with any document records.
 *
 * ❌ Do **not** use this to modify attachments of document records or profile images for users/pets.
 *
 * ✅ To remove an attachment from a document record, use: `useUpdate-<DOCUMENT_TYPE>-Record` 
 * and set the corresponding URL field to `null`. This will trigger deletion from Storage.
 *
 * ✅ To remove a user or pet profile image, use `useUpdate()` and set the profile image field to `null`.
 */
export const useDeleteDocumentFromStorage = () => {

  const { setCsrfToken, csrfToken } = useAuthContext() as IAuthContext;

  const { mutate, isError, error, data, isPending } = useMutation({
    mutationFn: async (payload: Document.IDeleteDocumentFromStoragePayload) => {
      if (!csrfToken) {
        throw new Error("CSRF token is not available.");
      }

      const response = await services.api.main.document.deleteDocumentFromStorage({
        ...payload,
        csrfToken,
      });

      return response;
    },
    onSuccess: (data) => {
      setCsrfToken(data.headers["x-csrf-token"]);
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
