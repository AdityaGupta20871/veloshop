// import { currentCart } from "wix-ecom-backend";
// import { webMethod, Permissions } from "wix-web-module";

// export const getCart = webMethod(
//   Permissions.Anyone,
//   async () => {
//     try {
//       const myCurrentCart = await currentCart.getCurrentCart();
//       console.log("Success! Retrieved current cart:", myCurrentCart);
//       return myCurrentCart;
//     } catch (error) {
//       console.error("Error retrieving current cart:", error);
//       throw new Error("Failed to retrieve current cart");
//     }
//   }
// );
import { Permissions, webMethod } from "wix-web-module";
import { cart } from "wix-ecom-backend";

// Function to create a new cart
export const myCreateCartFunction = webMethod(
  Permissions.Anyone,
  async (options) => {
    try {
      const newCart = await cart.createCart(options);
      console.log("Success! Created newCart:", newCart);
      return newCart;
    } catch (error) {
      console.error("Error creating cart:", error);
      throw new Error("Failed to create cart");
    }
  },
);

// Function to add items to the cart
export const myAddToCartFunction = webMethod(
  Permissions.Anyone,
  async (_id, options) => {
    try {
      const updatedCart = await cart.addToCart(_id, options);
      console.log("Success! Updated cart:", updatedCart);
      return updatedCart;
    } catch (error) {
      console.error("Error adding to cart:", error);
      throw new Error("Failed to add to cart");
    }
  },
);
