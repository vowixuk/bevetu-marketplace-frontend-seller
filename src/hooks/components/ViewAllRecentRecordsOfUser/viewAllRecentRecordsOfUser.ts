export default {}

// import { useViewProfile } from "hooks/api/queries";
// import useViewAllRecentRecordsOfPet from "../ViewAllRecentRecordsOfPet/viewAllRecentRecordsOfPet";
// import { Document } from "@services/api/types/main-services.types";
// type UseViewAllRecordsOfUserProps = {
//   limit?: number;
// };
// const useViewAllRecentRecordsOfUser = (props: UseViewAllRecordsOfUserProps) => {
//   const { limit } = props;
//   let _limit = limit ? limit : 5;
//   const { data: userViewProfileData } = useViewProfile();


  
//   const petIds = userViewProfileData?.pets.map(pet => pet.id) ?? []

//   const recentDocumentsAll: Omit<
//     Document.IViewOneBloodReportReturn,
//     "type" | "attributes"
//   >[] = [];

//   for (let i = 0; i < petIds?.length; i++) {
//     // eslint-disable-next-line react-hooks/rules-of-hooks
//     const { recentRecords } = useViewAllRecentRecordsOfPet({
//       petId: petIds[i],
//       limit: _limit,
//     });

//     recentRecords.forEach((record)=>{
//       recentDocumentsAll.push({
//         ...record,
//         petId: petIds[i],
//       });
//     })
//   }

//   // const { recentRecords } = useViewAllRecentRecordsOfPet({
//   //       petId: petIds[0],
//   //       limit: _limit,
//   //     });

//   // recentRecords.forEach((record)=>{
//   //       recentDocumentsAll.push({
//   //         ...record,
//   //         petId: petIds[0],
//   //       });
//   //     })

//   recentDocumentsAll.sort((a, b) => {
//     return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
//   });
  
//   return {
//     recentRecords: recentDocumentsAll,
//   };
// };


// export default useViewAllRecentRecordsOfUser;