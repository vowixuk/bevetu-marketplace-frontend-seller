import { ZodError, ZodObject } from "zod";


export interface ISchemaValidationError  {
    path: string | number,
    code:string,
    message:string,
}

export const schemaValidation = (
  schema: ZodObject<any, any, any>,
  payload: any
): {
    valid:boolean,
    error?: {
        path: string | number,
        code:string,
        message:string,
    }[] 
} => {
        
    try {
       schema.parse(payload);
            return {
                valid:true,
            }
        } catch (error) {

            if (error instanceof ZodError) {

                const e = error.issues.map((issue) => {

                    return {
                      path: issue.path.join(" > "),
                      code: issue.code as string,
                      message: issue.message,
                    };
                });

                return {
                    valid:false,
                    error:e
                }
            }
        
            return {
            valid:false,
            error:[]
        }
    }
}