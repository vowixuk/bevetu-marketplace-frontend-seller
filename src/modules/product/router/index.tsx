import {EditProduct,ViewAllProducts,CreateProduct} from "../views";

export const productRoutes = [
  { path: "", element: <ViewAllProducts />, index: true },
  { path: "edit", element: <EditProduct /> },
  { path: "create", element: <CreateProduct /> },
];

