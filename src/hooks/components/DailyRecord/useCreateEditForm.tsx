/* eslint-disable react-hooks/exhaustive-deps */
/**
 * Create/Edit Form
 *
 * This component manages input state and constructs the payload.
 * The parent component, “CreateEditFormView,” is responsible for submitting the form.
 */

import React, { useEffect, useState } from "react";
import { Document as DocumentType, User, } from "@services/api/types/main-services.types";
import { DEFAULT_RECORD_VALUE } from "./constants";
import { v4 as uuidv4 } from 'uuid';

export interface IUseCreateEditFormProp {
  /**
   * General information about the pet
   * Setter to update the payload as the form changes
   * Form mode: CREATE or EDIT
   * -- only relevant when mode is "EDIT" --
   * Id of the record being edited;
   * When user want to edit the record, this 'existingRecordData' store the current record data
   */
  petGeneralInfo: User.IPetGeneralInfo;
  setPayload: React.Dispatch<
    React.SetStateAction<
      | DocumentType.ICreateDailyRecordPayload
      | DocumentType.IUpdateDailyRecordPayload
      | null
    >
  >;
  mode: "CREATE" | "EDIT";
  reportId: string | undefined | null;
  existingRecordData?: DocumentType.IViewOneDailyRecordReturn;
}

export interface IUserCreateEditFormDailyProp extends IUseCreateEditFormProp {
  onCloseWithoutSave: () => void;
  createRecordOnClickHandler: () => void;
  updateRecordOnClickHandler: () => void;
}

export const useCreateEditForm = ({
  petGeneralInfo,
  setPayload,
  reportId,
  mode,
  existingRecordData,
}:IUseCreateEditFormProp) => {
  /**
   * ******************************
   *   Form Input Field Section   *
   * ******************************
   * Following are the inputs of the form
   */
  const defaultValue = DEFAULT_RECORD_VALUE;

  const [recordName, setRecordName] = useState<string>(defaultValue.recordName);
  const [recordDate, setRecordDate] = useState<Date>(defaultValue.recordDate);
  const [recordNotes, setRecordNotes] = useState<string>(defaultValue.notes);
  const [weightRecord, setWeightRecord] = useState< typeof defaultValue.weightRecord >(defaultValue.weightRecord);
  
  // DIF
  const [foodRecords, setFoodRecord] = useState< typeof defaultValue.foodRecords >(defaultValue.foodRecords);
  const [drinkRecords, setDrinkRecord] = useState< typeof defaultValue.drinkRecords >(defaultValue.drinkRecords);
  const [walkRecords, setWalkRecord] = useState< typeof defaultValue.walkRecords >(defaultValue.walkRecords);
  const [toiletRecords, setToiletRecords] = useState< typeof defaultValue.toiletRecords >(defaultValue.toiletRecords);

  /**
   * ***************************************
   *        Map Handling Section       *
   * ***************************************
   */
  const [showMap, setShowMap] = useState<boolean>(false);

  /**
   * ***************************************
   *    Edit Mode Data Initiation Section  *
   * ***************************************
   * On EDIT mode,
   * this useEffect populates the form fields with the existing record’s values.
   */
  useEffect(() => {
    if (
      !!existingRecordData &&
      mode === "EDIT" &&
      !!existingRecordData.attributes
    ) {
      let existingFoodRecords: React.SetStateAction< (DocumentType.IDailyFood & { id: string })[] > = [];
      let existingDrinkRecords: React.SetStateAction< (DocumentType.IDailyDrink & { id: string })[] > = [];
      let existingWalkRecords: React.SetStateAction< (DocumentType.IDailyWalk & { id: string })[] > = [];
      let existingToiletRecords: React.SetStateAction< (DocumentType.IToilet & { id: string })[] > = [];
      let existingWeightRecords = defaultValue.weightRecord;

      const {food, drink, walking, weight, toilet, notes} = existingRecordData.attributes;
      setRecordName(existingRecordData.name || defaultValue.recordName);
      setRecordDate( new Date(existingRecordData.date) || defaultValue.recordDate );
      setRecordNotes(notes || defaultValue.notes);
      setFoodRecord(EditUpdateRecord(food, existingFoodRecords));
      setDrinkRecord(EditUpdateRecord(drink, existingDrinkRecords));
      setWalkRecord(EditUpdateRecord(walking, existingWalkRecords));
      setToiletRecords(EditUpdateRecord(toilet, existingToiletRecords));
      setWeightRecord(EditUpdateWeightRecord(weight, existingWeightRecords));      
    }
  }, [existingRecordData]);

  const EditUpdateRecord = (arr: any, existingRecords: any) => {
    if ( arr && arr.length > 0 ) {
      return existingRecords = arr.map((record: any) => ({
          ...record,
          id: uuidv4(),
        })
      );
    } else return existingRecords
  }

  const EditUpdateWeightRecord = (arr: any, existingRecords: any) => {
    if (
        arr &&
        arr.weight &&
        arr.unit
    ) {
        return {
          weight: Number(arr.weight) || 0,
          unit: arr.unit,
        };
    } else return existingRecords;
  }

  /**
   * ***************************************
   *       Payload Preparation Section     *
   * ***************************************
   * This useEffect set the payload which will be used for 'create' / 'edit' function in parent component
   */
  useEffect(() => {
    /**
     * to remove record that is same as default value
     */
    function filterUnusedInput<T extends { id?: string }>( recordGroup: "foodRecords" | "drinkRecords" | "walkRecords" | "toiletRecords", records: T[] ): T[] {
      const comparable = (defaultValue[recordGroup] as unknown as T[])[0];
      delete comparable.id;

      return records.filter((r) => {
        const recordCopy = { ...r };
        delete recordCopy.id;
        return JSON.stringify(recordCopy) !== JSON.stringify(comparable);
      });
    }

    const update = {
      petId: petGeneralInfo.id,
      name: recordName,
      date: recordDate,
      attributes: {
        notes: recordNotes,
        food: filterUnusedInput("foodRecords", foodRecords),
        drink: filterUnusedInput("drinkRecords", drinkRecords),
        walking: filterUnusedInput("walkRecords", walkRecords),
        toilet: toiletRecords,
        weight: weightRecord,
      },
      ...(!!reportId && mode === "EDIT" ? { reportId } : {}),
    };
    setPayload(update);
  }, [
    recordName,
    recordDate,
    recordNotes,
    foodRecords,
    drinkRecords,
    walkRecords,
    toiletRecords,
    weightRecord,
    petGeneralInfo.id,
    setPayload,
    defaultValue,
  ]);

  /**
   * ***************************************
   *  Dynamic Input Field Hanlders Section *
   * ***************************************
   * The following handlers manage dynamic input fields (DIF) for adding,
   * updating, and removing records.
   */
  const handleFoodChange = (
    index: string,
    field: keyof DocumentType.IDailyFood,
    value: DocumentType.IDailyFood[keyof DocumentType.IDailyFood]
  ) => {
    const updated = foodRecords.map((record) => {
      if (record.id === index) return { ...record, [field]: value };
      return record;
    });
    // console.log(updated, " <<<< handleFoodChange")
    setFoodRecord(updated);
  };

  const handleDrinkChange = (
    index: string,
    field: keyof DocumentType.IDailyDrink,
    value: any
  ) => {
    const updated = drinkRecords.map((record) => {
      if (record.id === index) return { ...record, [field]: value };
      return record;
    });
    setDrinkRecord(updated);
  };

  const handleToiletChange = (
    index: string,
    field: keyof DocumentType.IToilet,
    value: any
  ) => {
    const updated = toiletRecords.map((record) => {
      if (record.id === index) return { ...record, [field]: value };
      return record;
    });
    setToiletRecords(updated);
  };

  const handleWalkChange = (
    index: string,
    field: keyof DocumentType.IDailyWalk,
    value: any
  ) => {
    const updated = walkRecords.map((record) => {
      if (record.id !== index) return record;

      let updatedRecord = { ...record, [field]: value };

      if (field === "startTime") {
        const [hour, minute] = value.split(":").map(Number);
        const newStart = new Date();
        newStart.setHours(hour, minute + 30); // add 30 mins
        const newEnd = newStart.toTimeString().slice(0, 5);
        updatedRecord.endTime = newEnd;
      }

      if (field === "endTime") {
        const [startHour, startMinute] = record.startTime
          .split(":")
          .map(Number);
        const [endHour, endMinute] = value.split(":").map(Number);
        const startDate = new Date();
        const endDate = new Date();
        startDate.setHours(startHour, startMinute);
        endDate.setHours(endHour, endMinute);

        if (endDate <= startDate) {
          const newEnd = new Date(startDate.getTime() + 30 * 60000);
          updatedRecord.endTime = newEnd.toTimeString().slice(0, 5);
        }
      }

      return updatedRecord;
    });
    setWalkRecord(updated);
  };

  const handleWeightChange = (
    field: keyof DocumentType.IBodyWeight,
    value: any
  ) => {
    const updated = { ...weightRecord, [field]: value };
    setWeightRecord(updated);
  };

  // remove functions
  const removeFoodRecord = (id: string) => {
    const update = foodRecords.filter((r) => r.id !== id);
    setFoodRecord(update);
  };

  const removeDrinkRecord = (id: string) => {
    const update = drinkRecords.filter((r) => r.id !== id);
    setDrinkRecord(update);
  };

  const removeWalkRecord = (id: string) => {
    const update = walkRecords.filter((r) => r.id !== id);
    setWalkRecord(update);
  };

  const removeToiletRecord = (id: string) => {
    const update = toiletRecords.filter((r) => r.id !== id);
    setToiletRecords(update);
  };

  // Add functions to add new records
  const addFoodRecord = () => {
    const update = { ...defaultValue.foodRecords[0], id: uuidv4() };
    setFoodRecord([...foodRecords, ...[update]]);
  };

  const addDrinkRecord = () => {
    const update = { ...defaultValue.drinkRecords[0], id: uuidv4() };
    setDrinkRecord([...drinkRecords, ...[update]]);
  };

  const addWalkRecord = () => {
    const update = { ...defaultValue.walkRecords[0], id: uuidv4() };
    setWalkRecord([...walkRecords, ...[update]]);
  };

  const addToiletRecord = () => {
    const update = { ...defaultValue.toiletRecords[0], id: uuidv4()};
    setToiletRecords([...toiletRecords, ...[update]]);
  };

  const addPrevRecord = (type: string, update: any) => {
    switch (type) {
      case 'toliet':
          setToiletRecords(CheckExist(toiletRecords, update));
          break;
      case 'food':
          setFoodRecord(CheckExist(foodRecords, update));
          break;
      case 'drink':
          setDrinkRecord(CheckExist(drinkRecords, update));
          break;
      case 'walking':
          setWalkRecord(CheckExist(walkRecords, update));
          break;
      default:
          break;
    }
  }

  const CheckExist = (current: any[], data: any[]) => {
    // Create a new arr
    // loop data arr
    // check the current datas have record with same id
    // if current data doesn't have the same id. add to new arr
    // set records with new arr

    const existingIds = new Set(current.map(item => item.id));
    const newItems = data.filter(item => !existingIds.has(item.id));
    return [...current, ...newItems];
  }

  return {
    // Variables
    recordName,
    recordDate,
    recordNotes,
    foodRecords,
    drinkRecords,
    walkRecords,
    weightRecord,
    toiletRecords,
    showMap,
    defaultValue,

    // Setters
    setRecordName,
    setRecordDate,
    setFoodRecord,
    setRecordNotes,
    setDrinkRecord,
    setWalkRecord,
    setToiletRecords,
    setWeightRecord,
    setShowMap,

    //functions
    handleFoodChange,
    handleDrinkChange,
    handleToiletChange,
    handleWalkChange,
    handleWeightChange,

    // Remove functions
    removeFoodRecord,
    removeDrinkRecord,
    removeWalkRecord,
    removeToiletRecord,

    // add functions
    addFoodRecord,
    addDrinkRecord,
    addWalkRecord,
    addToiletRecord,
    addPrevRecord,
  };
};


