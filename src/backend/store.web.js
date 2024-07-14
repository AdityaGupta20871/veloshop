
import wixStoresBackend from "wix-stores-backend";

export function getProductVariants(productId, options) {
  return wixStoresBackend.getProductVariants(productId, options);
}




// let productId = "3fb6a3c8-988b-7895-04bd-5c59ae0b18ea"; // get product ID
// let options = {
//   choices: {
//     Size: "Large",
//     Color: "Red",
//   },
// };

