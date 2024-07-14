import { cart } from 'wix-stores-frontend';

$w.onReady(function () {
    populateCartItems();
    setupCheckoutForm();
});

async function populateCartItems(){
    const currentCart = await cart.getCurrentCart();
    console.log(currentCart);
    
    const { lineItems, currency, totals } = currentCart; // Added `totals` to get tax and shipping

    // Check if lineItems array is empty
    if (lineItems.length === 0) {
        console.log("Cart is empty");
        // Optionally hide or clear the repeater or display a message
        $w('#lineItemsRepeater').data = [];
        return;
    }
    
    // Add a unique _id property to each lineItem
    const itemsWithId = lineItems.map((item, index) => {
        return {
            ...item,
            _id: String(index) // Use index as a unique identifier
        };
    });
    
    $w("#lineItemsRepeater").onItemReady(($item, itemData) => {
        console.log("Item Data in onItemReady:", itemData); // Add this line to see if itemData is correct
        
        // Display product name
        $item("#productName").text = itemData.name;
        
        // Display product image
        $item("#media").src = itemData.mediaItem.src;
        
        // Display quantity
        $item('#quantityInput').value = itemData.quantity.toString();
        
        // Calculate and display unit price
        const Price = itemData.price * itemData.quantity;
        $item("#price").text = `${currency.code} ${Price.toFixed(2)}`;
        
        // Display total price with currency
        $item("#unitPrice").text = `${currency.code} ${itemData.price.toFixed(2)}`;
        
        // Display product options
        const optionsText = itemData.options.map(option => `${option.option}: ${option.selection}`).join(', ');
        $item("#productOptions").text = optionsText;
        
        // Event handler for increasing quantity
        $item("#addButton").onClick(async () => {
            const newQuantity = itemData.quantity + 1;
            try {
                const updatedCart = await cart.updateLineItemQuantity(itemData.id, newQuantity);
                itemData.quantity = newQuantity; // Update the itemData with the new quantity
                $item('#quantityInput').value = newQuantity.toString(); // Update the input field with the new quantity
                $item("#price").text = `${currency.code} ${(unitPrice * newQuantity).toFixed(2)}`; // Update total price
                console.log("Quantity increased", updatedCart);
            } catch (error) {
                console.error("Failed to increase quantity", error);
            }
        });

        // Event handler for decreasing quantity
        $item("#subButton").onClick(async () => {
            if (itemData.quantity > 1) {
                const newQuantity = itemData.quantity - 1;
                try {
                    const updatedCart = await cart.updateLineItemQuantity(itemData.id, newQuantity);
                    itemData.quantity = newQuantity; // Update the itemData with the new quantity
                    $item('#quantityInput').value = newQuantity.toString(); // Update the input field with the new quantity
                    $item("#price").text = `${currency.code} ${(unitPrice * newQuantity).toFixed(2)}`; // Update total price
                    console.log("Quantity decreased", updatedCart);
                } catch (error) {
                    console.error("Failed to decrease quantity", error);
                }
            } else {
                console.log("Quantity cannot be less than 1");
            }
        });

        // Event handler for removing item
        $item("#removeButton").onClick(async () => {
            try {
                const updatedCart = await cart.removeProduct(itemData.id);
                console.log("Item removed", updatedCart);
                // Refresh the cart items after removal
                populateCartItems();
            } catch (error) {
                console.error("Failed to remove item", error);
            }
        });
    });

    // Ensure the itemsWithId array is not empty and has valid objects
    if (itemsWithId && itemsWithId.length > 0 && itemsWithId[0].name) {
        $w('#lineItemsRepeater').data = itemsWithId;
    } else {
        console.log("No valid line items found");
    }

    // Display tax and shipping charges
    $w("#tax").text = `${currency.code} ${totals.tax}`;
    $w("#shipping").text = `${currency.code} ${totals.shipping}`;
    $w("#total").text = `${currency.code} ${totals.total}`;
}

function setupCheckoutForm() {
    $w("#applyCouponButton").onClick(async () => {
        const couponCode = $w("#couponInput").value;
        if (couponCode) {
            try {
                const updatedCart = await cart.applyCoupon(couponCode);
                console.log("Coupon applied", updatedCart);
                populateCartItems(); // Refresh the cart items to reflect the coupon discount
            } catch (error) {
                console.error("Failed to apply coupon", error);
                $w("#couponErrorMessage").text = "Invalid coupon code.";
            }
        } else {
            $w("#couponErrorMessage").text = "Please enter a coupon code.";
        }
    });
}

// {
//   "_id": "29e33b46-5fa0-44b8-8f60-de02211d825c",
//   "buyerNote": "null",
//   "appliedCoupon": "null",
//   "status": "INCOMPLETE",
//   "shippingInfo": {
//     "shippingAddress": {
//       "address": "Delhi 110043\nIndia"
//     }
//   },
//   "billingAddress": "null",
//   "buyerInfo": "null",
//   "lineItems": [
//     {
//       "mediaItem": {
//         "src": "wix:image://v1/22e53e_6818890490334e429d78876ba5f757ce~mv2.jpg/file.jpg#originWidth=3941&originHeight=3941",
//         "type": "IMAGE"
//       },
//       "productId": "c8539b66-7a44-fe18-affc-afec4be8562a",
//       "lineItemType": "PHYSICAL",
//       "name": "Facial Cream",
//       "notes": "null",
//       "price": 10,
//       "quantity": 3,
//       "sku": "364115376135191",
//       "totalPrice": 30,
//       "weight": 0,
//       "id": 1,
//       "options": [
//         {
//           "option": "Color",
//           "selection": "Black"
//         }
//       ],
//       "customTextFields": []
//     }
//   ],
//   "totals": {
//     "discount": 0,
//     "quantity": 3,
//     "shipping": 0,
//     "subtotal": 30,
//     "tax": 0,
//     "total": 30,
//     "weight": 0
//   },
//   "currency": {
//     "code": "INR",
//     "symbol": ""
//   },
//   "weightUnit": "null"
// }