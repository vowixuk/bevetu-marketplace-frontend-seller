
import { TODO } from "../types/basic.type";
import { IMainServices } from "./main-service.interface";

export interface IServices {
  api: {

    main: IMainServices;
    marketplace: TODO;
    social: TODO;
    matching: TODO;
    insurance: TODO;
  };
  google: TODO;
  analytics: TODO;
  cdn: TODO;
  tracking: TODO;
  monitor: TODO;
}
