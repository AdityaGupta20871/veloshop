import { getProductVariants } from "backend/store.web.js";
import { cart } from "wix-stores-frontend";
import wixData from "wix-data";
import wixLocationFrontend from "wix-location-frontend";

let product;
let selectedOptions = {};


$w.onReady(function () {
  bindItemReadyForProductsRepeater();
  populateProductsRepeater();
	populateProductData();
	 populateMediaItems();
   populateOptions();
   ProductFeatures();
   loadReviews();
   ReviewsForm();
   populateCategoriesDropdown();
   $w("#addToCartButton").onClick(async () => {
     const quantity = Number($w("#quantityInput").value);

    // Validate quantity
    if (quantity < 1) {
      $w("#errorMessage").text = "Please add at least 1 item.";
      $w("#errorMessage").show();
      return;
    }
 $w("#errorMessage").hide();

    $w("#addToCartButton").disable();
    try {
      const productInfo = {
        productId: product._id,
        quantity: Number($w("#quantityInput").value),
        options: {
          choices: selectedOptions,
        },
      };
      const updatedCart = await cart.addProducts([productInfo]);
      wixLocationFrontend.to("/custom-cart");
      cart.showMiniCart();
      setTimeout(()=>{
        cart.hideMiniCart();
      }, 2000)
      console.log("updated cart", updatedCart);
    } catch (error) {
      console.log(error);
      $w("#addToCartButton").enable();
    }
  });
});


function populateProductData() {
  product = $w("#dynamicDataset").getCurrentItem();
	console.log(product);
  let description = product.description;

// Remove <p> and </p> tags using a regular expression
description = description.replace(/<\/?p[^>]*>/g, '');

// Set the cleaned text to the #description element
$w('#description').text = description;

	$w("#productName").text = product.name;
	if (product.price === product.discountedPrice) {
	  $w("#originalPrice").hide();
	}
	$w("#originalPrice").text = product.formattedPrice;
	$w("#discountedPrice").text = product.formattedDiscountedPrice;
	if (!product.ribbon) {
	  $w("#ribbonWrapper").hide();
	}
	$w("#ribbon").text = product.ribbon;
	$w("#productSKU").text = product.sku;
  }

  async function loadReviews() {
  const productId = product._id;
  console.log("Loading reviews for product:", productId);

  try {
    // Query the Reviews collection to fetch reviews for the current product
    const reviewsQueryResult = await wixData
      .query("Reviews")
      .hasSome("product", productId) // Adjust this to match the field name used to link reviews to products
      .find();

    const reviews = reviewsQueryResult.items;
    console.log("Fetched reviews:", reviews);


    // Assuming you have repeater to display reviews
    $w("#reviewsRepeater").onItemReady(($item, itemData) => {
      console.log("Setting item data:", itemData); // Log each review item data
      $item("#reviewName").text = itemData.reviewerName;
      $item("#ratingInput").value = itemData.rating;
      $item("#reviewInfo").text = itemData.review;
      $item("#reviewMedia").src = itemData.reviewerImage;
    });

    $w("#reviewsRepeater").data = reviews;
  } catch (error) {
    console.error("Failed to load reviews:", error);
  }
}


 async function ReviewsForm() {
  const { mainMedia } = product;
  $w("#reviewProduct").src = mainMedia;
  const productName = product.name;

  // Event handler for the submit button
  $w("#Submit").onClick(async () => {
    const reviewerName = $w("#Name").value;
    const reviewText = $w("#addReview").value;
    const rating = $w("#addRating").value;
    const reviewerImage = $w("#addProfile").src;

    const review = {
      reviewerName,
      review: reviewText,
      rating,
      reviewerImage,
      product: product._id, // Multi-reference to the product
    };

    try {
      const insertedReview = await wixData.insert("Reviews", review);
      console.log("Inserted review:", insertedReview);

      // Link the review to the product
      await wixData.insertReference("Reviews", "product", insertedReview._id, product._id);
      console.log("Linked review to product:", product.name);

      // Optionally, refresh the reviews to show the new review
      await loadReviews();
    } catch (error) {
      console.error("Failed to submit review:", error);
    }
  });
}





async function getProducts() {
  let productsQuery = wixData.query("Stores/Products");
  const productsQueryResult = await productsQuery.find();

  console.log("products", productsQueryResult.items)

  return productsQueryResult.items;
}

function bindItemReadyForProductsRepeater() {
  $w("#productsRepeater").onItemReady(($item, itemData) => {
    $item("#Image").src = itemData.mainMedia;
    $item("#viewButton").onClick(()=>{
      wixLocationFrontend.to('/products/' + itemData.slug)
    })
    $item("#ProductName").text = itemData.name;
    $item("#ribbonText").text = itemData.ribbon;
    if (!itemData.ribbon) {
      $item("#ribbon").hide();
    }
    if(itemData.price === itemData.discountedPrice){
      $item("#ogPrice").hide();
    }
    $item("#price").text = `${itemData.discountedPrice} ${itemData.currency}`;
    $item("#ogPrice").text = itemData.formattedPrice;
  });
}

async function populateProductsRepeater() {
  const products = await getProducts();
  $w("#productsRepeater").data = products;
}

async function populateCategoriesDropdown() {
  const collectionsQueryResult = await wixData
    .query("Stores/Collections")
    .find();
  const collections = collectionsQueryResult.items;
  console.log("collections", collections);
}


async function ProductFeatures() {
  const productId = product._id;
   const { mainMedia } = product;
  $w("#featuremedia").src = mainMedia;
  const featuresQueryResult = await wixData
    .query("Features")
    .hasSome("product", productId)
    .find();
  const features = featuresQueryResult.items;
  $w("#featuresRepeater").onItemReady(($item, itemData) => {
    $item("#featureTitle").text = itemData.title;
    $item("#featureText").text = itemData.description;
    $item("#featureIcon").src = itemData.icon;
  });
  $w("#featuresRepeater").data = features;
}

  




  function populateMediaItems() {
  const { mainMedia, mediaItems } = product;
  $w("#mainMedia").src = mainMedia;

  $w("#mediaItemsRepeater").onItemReady(($item, itemData) => {
    $item("#mediaItem").src = itemData.src;

    if (itemData.src === mainMedia) {
      $item("#mediaItemWrapper").style.borderColor = "blue";
    }

    $item("#mediaItem").onClick(() => {
      $w("#mainMedia").src = itemData.src;
      $w("#mediaItemWrapper").style.borderColor = "#F5E47E";
      $item("#mediaItemWrapper").style.borderColor = "blue";
    });
  });

  $w("#mediaItemsRepeater").data = mediaItems
    .filter((item) => !item.src.includes("wix:video://"))
    .map((item, index) => ({ ...item, _id: index.toString() }));
}




function populateOptions() {
  
  const { productOptions } = product;
  const optionKeys = Object.keys(productOptions); // [Size, Scent];
  let options = optionKeys.map((option) => productOptions[option]);
  console.log("options", options);

  if (optionKeys.includes("Size")) {
    const sizeOption = productOptions["Size"];
    options = options.filter((option) => option.name !== "Size");
    $w("#optionsSelectionTags").options = sizeOption.choices.map((choice) => ({
      label: choice.description,
      value: choice.description,
    }));

    $w("#optionsSelectionTags").onChange((event) => {
      const currentSelection =
        event.target.value[event.target.value.length - 1];
      $w("#optionsSelectionTags").value = [currentSelection];
      selectedOptions["Size"] = currentSelection;
      updateProductPageWithOptions();
    });

    $w("#optionsSelectionTags").expand();
  }


  async function updateProductPageWithOptions() {
    console.log(selectedOptions);
  
    const color = selectedOptions["Color"];
    if (color) {
      const colorOption = product.productOptions["Color"];
      console.log("colorOption", colorOption);
      const slectedChoice = colorOption.choices.filter(
        (choice) => choice.description === color
      )[0];
      console.log("selectedChoice", slectedChoice);
      $w("#mainMedia").src = slectedChoice.mainMedia;
    }
  
    // get a variant based on the options;
    const variants = await getProductVariants(product._id, {
      choices: selectedOptions,
    });
  
    console.log("variants", variants);
    if (variants.length > 1) return;
  
    const { variant } = variants[0];
  
    $w("#originalPrice").text = variant.formattedPrice;
    $w("#discountedPrice").text = variant.formattedDiscountedPrice;
    $w("#productSKU").text = variant.sku;
  
    // display mainMedia if relevant
  }




  $w("#dropdownOptionsRepeater").onItemReady(($item, itemData) => {
    $item("#optionDropdown").label = itemData.name;
    $item("#optionDropdown").options = itemData.choices.map((choice)  => ({
      label: choice.description,
      value: choice.description,
    }));

    $item("#optionDropdown").onChange((event) => {
      selectedOptions[itemData.name] = event.target.value;
      updateProductPageWithOptions();
    });
  });

  $w("#dropdownOptionsRepeater").data = options.map((option) => ({
    ...option,
    _id: option.name,
  }));
}






// import { myCreateCartFunction, myAddToCartFunction } from "backend/cart.web.js";
// import wixData from "wix-data";
// import wixLocationFrontend from "wix-location";
// import { getProductVariants } from "backend/store.web.js";

// let product;
// let selectedOptions = {};

// $w.onReady(function () {
//   populateProductData();
//   populateMediaItems();
//   populateOptions();

//   // Add click event listener to the add to cart button
//   $w("#addToCartButton").onClick(async () => {
//     $w("#addToCartButton").disable(); // Disable button to prevent multiple clicks

//     try {
//       console.log("Product:", product);

//       // Construct product info for the cart
//       const productInfo = {
//         catalogReference: {
//           appId: "215238eb-22a5-4c36-9e7b-e7c08025e04e", // Replace with your Wix Stores appId
//           catalogItemId: product._id, // Product ID from the current item
//         },
//         quantity: Number($w("#quantityInput").value), // Quantity from user input
//         options: selectedOptions, // Selected options
//       };

//       console.log("Product Info:", productInfo);

//       // Create cart options with the line items
//       const createCartOptions = {
//         lineItems: [productInfo],
//       };

//       console.log("Create Cart Options:", createCartOptions);

//       // Check if lineItems are correctly populated before creating the cart
//       if (!createCartOptions.lineItems || createCartOptions.lineItems.length === 0) {
//         throw new Error("No items in lineItems array");
//       }

//       // Create a new cart with the provided options
//       const newCart = await myCreateCartFunction(createCartOptions);
//       const cartId = newCart._id; // Get the new cart ID
//       console.log("Created Cart:", newCart);

//       // Prepare add to cart options with the line items
//       const addToCartOptions = {
//         lineItems: [productInfo],
//       };

//       console.log("Add to Cart Options:", addToCartOptions);

//       // Check if lineItems are correctly populated before adding to the cart
//       if (!addToCartOptions.lineItems || addToCartOptions.lineItems.length === 0) {
//         throw new Error("No items in lineItems array for add to cart");
//       }

//       // Add items to the cart using the cart ID and options
//       const updatedCart = await myAddToCartFunction(cartId, addToCartOptions);
//       console.log("Updated Cart:", updatedCart);

//       // Redirect to the cart page after adding items to the cart
//       wixLocationFrontend.to("/c");
//     } catch (error) {
//       console.error("Error in addToCartButton click:", error);
//       $w("#addToCartButton").enable(); // Re-enable button in case of error
//       // Display error message to user
//       $w("#errorMessage").text = `Failed to add to cart: ${error.message}`;
//       $w("#errorMessage").show();
//     }
//   });
// });

// // Populate product data on the page
// function populateProductData() {
//   product = $w("#dynamicDataset").getCurrentItem();
//   console.log("Product Data:", product);

//   $w("#productName").text = product.name;
//   if (product.price === product.discountedPrice) {
//     $w("#originalPrice").hide();
//   }

//   $w("#originalPrice").text = product.formattedPrice;
//   $w("#discountedPrice").text = product.formattedDiscountedPrice;

//   if (!product.ribbon) {
//     $w("#ribbonWrapper").hide();
//   }

//   $w("#ribbon").text = product.ribbon;
//   $w("#productSKU").text = product.sku;
// }

// // Populate media items on the page
// function populateMediaItems() {
//   const { mainMedia, mediaItems } = product;
//   $w("#mainMedia").src = mainMedia;

//   $w("#mediaItemsRepeater").onItemReady(($item, itemData) => {
//     $item("#mediaItem").src = itemData.src;

//     if (itemData.src === mainMedia) {
//       $item("#mediaItemWrapper").style.borderColor = "blue";
//     }

//     $item("#mediaItem").onClick(() => {
//       $w("#mainMedia").src = itemData.src;
//       $w("#mediaItemWrapper").style.borderColor = "#F5E47E";
//       $item("#mediaItemWrapper").style.borderColor = "blue";
//     });
//   });

//   $w("#mediaItemsRepeater").data = mediaItems
//     .filter((item) => !item.src.includes("wix:video://"))
//     .map((item, index) => ({ ...item, _id: index.toString() }));
// }

// // Populate options on the page
// function populateOptions() {
//   const { productOptions } = product;
//   const optionKeys = Object.keys(productOptions);
//   let options = optionKeys.map((option) => productOptions[option]);
//   console.log("Options:", options);

//   if (optionKeys.includes("Size")) {
//     const sizeOption = productOptions["Size"];
//     options = options.filter((option) => option.name !== "Size");
//     $w("#optionsSelectionTags").options = sizeOption.choices.map((choice) => ({
//       label: choice.description,
//       value: choice.description,
//     }));

//     $w("#optionsSelectionTags").onChange((event) => {
//       const currentSelection = event.target.value[event.target.value.length - 1];
//       $w("#optionsSelectionTags").value = [currentSelection];
//       selectedOptions["Size"] = currentSelection;
//       updateProductPageWithOptions();
//     });

//     $w("#optionsSelectionTags").expand();
//   }

//   async function updateProductPageWithOptions() {
//     console.log("Selected Options:", selectedOptions);

//     const color = selectedOptions["Color"];
//     if (color) {
//       const colorOption = product.productOptions["Color"];
//       console.log("Color Option:", colorOption);
//       const selectedChoice = colorOption.choices.filter(
//         (choice) => choice.description === color
//       )[0];
//       console.log("Selected Choice:", selectedChoice);
//       $w("#mainMedia").src = selectedChoice.mainMedia;
//     }

//     const variants = await getProductVariants(product._id, {
//       choices: selectedOptions,
//     });

//     console.log("Variants:", variants);
//     if (variants.length > 1) return;

//     const { variant } = variants[0];

//     $w("#originalPrice").text = variant.formattedPrice;
//     $w("#discountedPrice").text = variant.formattedDiscountedPrice;
//     $w("#productSKU").text = variant.sku;
//   }

//   $w("#dropdownOptionsRepeater").onItemReady(($item, itemData) => {
//     $item("#optionDropdown").label = itemData.name;
//     $item("#optionDropdown").options = itemData.choices.map((choice) => ({
//       label: choice.description,
//       value: choice.description,
//     }));

//     $item("#optionDropdown").onChange((event) => {
//       selectedOptions[itemData.name] = event.target.value;
//       updateProductPageWithOptions();
//     });
//   });

//   $w("#dropdownOptionsRepeater").data = options.map((option) => ({
//     ...option,
//     _id: option.name,
//   }));
// }