import {EditProduct,ViewAllProducts,CreateProduct} from "../views";

export const productRoutes = [
  { path: "", element: <ViewAllProducts />, index: true },
  { path: "edit", element: <EditProduct /> },
  { path: "create", element: <CreateProduct /> },
];


/**
 *  If nested structure 
 */
// export const productRoutes = [
//   {
//     element: <ProductsLayout />, // Nested layout
//     children: [
//       { path: "", element: <ViewAllProducts />, index: true },
//       { path: "create", element: <CreateProduct /> },
//       { path: "edit", element: <EditProduct /> },
//     ],
//   },
// ];