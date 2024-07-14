import wixData from "wix-data";
import wixLocationFrontend from 'wix-location-frontend'
import { currentMember } from 'wix-members';
import wixLocation from 'wix-location';
let categoryFilter;
let priceFilter;
let sortBy;

$w.onReady(() => {
  bindItemReadyForProductsRepeater();
  populateProductsRepeater();
  populateCategoriesDropdown();
  $w("#categoriesDropdown").onChange(handleCategoryFilterChange);
  $w("#minPriceDropdown , #maxPriceDropdown").onChange(handlePriceRangeFilter);
 
  $w("#clearButton").onClick(clearFilters);
  $w("#sortDropdown").onChange(handleSort);
});

async function getProducts() {
  let productsQuery = wixData.query("Stores/Products");

  if (categoryFilter) {
    productsQuery = productsQuery.and(categoryFilter);
  }
  if (priceFilter) {
    productsQuery = productsQuery.and(priceFilter);
  }
  if (sortBy) {
    productsQuery = applySort(productsQuery, sortBy);
  }

  const productsQueryResult = await productsQuery.find();

  console.log("products", productsQueryResult.items)

  return productsQueryResult.items;
}

function applySort(productsQuery, sortBy) {
  console.log("sortBy", sortBy);

  switch (sortBy) {
    case "Price: Low to High":
      productsQuery = productsQuery.ascending("price");
      break;
    case "Price: High to Low":
      productsQuery = productsQuery.descending("price");
      break;
  }
  return productsQuery;
}

function bindItemReadyForProductsRepeater() {
  $w("#productsRepeater").onItemReady(($item, itemData) => {
    $item("#mainMedia").src = itemData.mainMedia;
    $item("#viewButton").onClick(()=>{
      wixLocationFrontend.to('/products/' + itemData.slug)
    })
    $item("#productName").text = itemData.name;
    $item("#ribbonText").text = itemData.ribbon;
    if (!itemData.ribbon) {
      $item("#ribbon").hide();
    }
    if(itemData.price === itemData.discountedPrice){
      $item("#originalPrice").hide();
    }
    $item("#price").text = `${itemData.discountedPrice} ${itemData.currency}`;
    $item("#originalPrice").text = itemData.formattedPrice;
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
  $w("#categoriesDropdown").options = collections.map((collection) => ({
    label: collection.name,
    value: collection._id,
  }));
}

async function handleCategoryFilterChange() {
  const collectionId = $w("#categoriesDropdown").value;
  categoryFilter = wixData
    .query("Stores/Products")
    .hasSome("collections", collectionId);

  populateProductsRepeater();
}

async function handlePriceRangeFilter() {
  const minPrice = Number($w("#minPriceDropdown").value);
  const maxPrice = Number($w("#maxPriceDropdown").value);

  const minPriceQuery = wixData.query("Stores/Products").ge("price", minPrice);
  const maxPriceQuery = wixData.query("Stores/Products").le("price", maxPrice);

  priceFilter = wixData.query("Stores/Products");

  if (minPrice) {
    priceFilter = priceFilter.and(minPriceQuery);
  }

  if (maxPrice) {
    priceFilter = priceFilter.and(maxPriceQuery);
  }

  populateProductsRepeater();
}

function clearFilters() {
  $w("#categoriesDropdown, #minPriceDropdown, #maxPriceDropdown, #sortDropdown").value = null;
  $w(
    "#categoriesDropdown, #minPriceDropdown, #maxPriceDropdown, #sortDropdown"
  ).resetValidityIndication();
  categoryFilter = null;
  priceFilter = null;
  sortBy = null;

  populateProductsRepeater();
}

async function handleSort() {
  sortBy = $w("#sortDropdown").value;
  populateProductsRepeater();
}