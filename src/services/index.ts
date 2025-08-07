
import { todoReturn } from "./api/fixtures/modules/main.fixtures";
import { IServices } from "./api/interfaces/api-service.interface";
import { aiServices } from "./api/modeules/ai.services";
import { mainServices } from "./api/modeules/main.services";


export const services: IServices = {
  /* ------ Bevetu Services -------- */
  api: {
    ai: aiServices,
    main: mainServices,
    marketplace: todoReturn,
    social:todoReturn,
    matching:todoReturn,
    insurance:todoReturn,
  },

  /* - Other third party services (Example)-- */
  google: todoReturn, // API calls are made for maps, geocoding, etc.
  analytics: todoReturn, // send events directly to third-party servers.
  cdn: todoReturn, //Frontend fetches content directly
  monitor: todoReturn, // sending error to 3 party error monitor platform
  tracking: todoReturn, // Tracking user activities with user's consent 
};