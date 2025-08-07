// Type
import { Document as DocumentType } from "@services/api/types/main-services.types";
import { v4 as uuidv4 } from 'uuid';

const getCurrentDate = ():string => {
  const date = new Date();
  const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
  return time;
}

export const DEFAULT_RECORD_VALUE = {
  recordName: `Daily Record - ${new Date().toISOString().split("T")[0]}`,
  recordDate: new Date(),
  notes: "",
  foodRecords: [
    {
      id: uuidv4(),
      name: "",
      volume: "",
      intakeTime: getCurrentDate(),
      isRefuse: false,
      brand: "",
      selfCook: false,
      notes: "",
      ingridents: [],
      url: "",
    } as DocumentType.IDailyFood & { id: string }, // `id` supplies a stable React key for each record, preventing rendering issues during edits
  ],
  drinkRecords: [
    {
      id: uuidv4(),
      volume: "",
      intakeTime: getCurrentDate(),
      isRefuse: false,
      notes: "",
    } as DocumentType.IDailyDrink & { id: string }, // `id` supplies a stable React key for each record, preventing rendering issues during edits
  ],
  walkRecords: [
    {
      id: uuidv4(),
      location: "",
      geoLocation: {
        latitude: "",
        longitude: "",
      },
      startTime: getCurrentDate(),
      endTime: getCurrentDate(),
      isRefuse: false,
      notes: "",
    } as DocumentType.IDailyWalk & { id: string }, // `id` supplies a stable React key for each record, preventing rendering issues during edits
  ],
  toiletRecords: [
    {
      id: uuidv4(),
      type: "pee" as "pee" | "poo",
      time: getCurrentDate(),
      isRefuse: false,
      notes: "",
    } as DocumentType.IToilet & { id: string }, // `id` supplies a stable React key for each record, preventing rendering issues during edits
  ],
  weightRecord: {
    weight: 0,
    unit: "kg" as "kg" | "g",
  },
};
