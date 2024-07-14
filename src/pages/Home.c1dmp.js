import wixData from "wix-data";
import wixLocation from 'wix-location-frontend';
import { currentMember } from 'wix-members';

let mediaSources = []; // This will store the media sources
let currentIndex = 0; // This keeps track of the current media index
let testimonials = []; // This will store the testimonials
let currentTestimonialIndex = 0; // This keeps track of the current testimonial index

$w.onReady(async function () {
  const member = await currentMember.getMember();
  if (!member) {
    wixLocation.to('/register'); // Redirect to register page if not a member
    return;
  }

  // Populate the mediaSources array with data from your products or any other source
  await populateMediaSources();
  await populateTestimonials();
  // Set the initial media
  updateMedia();
  updateTestimonial();

  // Set up event handlers for the previous and next buttons
  $w("#previous").onClick(() => changeMedia(-1));
  $w("#next").onClick(() => changeMedia(1));
  $w("#prevTestimonial").onClick(() => changeTestimonial(-1));
  $w("#nextTestimonial").onClick(() => changeTestimonial(1));
});

async function populateMediaSources() {
  const products = await getProducts(); // Assume this function gets your products
  mediaSources = products.map(product => product.mainMedia); // Adjust based on your media field
}

function updateMedia() {
  if (mediaSources.length > 0) {
    $w("#media").src = mediaSources[currentIndex];
  }
}

function changeMedia(direction) {
  // Update the current index based on the direction (-1 for previous, 1 for next)
  currentIndex += direction;

  // Ensure the index is within the bounds of the mediaSources array
  if (currentIndex < 0) {
    currentIndex = mediaSources.length - 1; // Wrap to the last item
  } else if (currentIndex >= mediaSources.length) {
    currentIndex = 0; // Wrap to the first item
  }

  // Update the media element
  updateMedia();
}

async function getProducts() {
  let productsQuery = wixData.query("Stores/Products");
  const productsQueryResult = await productsQuery.find();
  return productsQueryResult.items;
}

async function populateTestimonials() {
  const additionalInfoQueryResult = await wixData.query("AdditionalInfo").find();
  testimonials = additionalInfoQueryResult.items;
}

function updateTestimonial() {
  if (testimonials.length > 0) {
    const testimonial = testimonials[currentTestimonialIndex];
    $w("#testimonialText").text = testimonial.testimonial;
    $w("#GiverText").text = testimonial.name;
    $w("#testimonialmedia").src = testimonial.image;
  }
}

function changeTestimonial(direction) {
  // Update the current testimonial index based on the direction (-1 for previous, 1 for next)
  currentTestimonialIndex += direction;

  // Ensure the index is within the bounds of the testimonials array
  if (currentTestimonialIndex < 0) {
    currentTestimonialIndex = testimonials.length - 1; // Wrap to the last item
  } else if (currentTestimonialIndex >= testimonials.length) {
    currentTestimonialIndex = 0; // Wrap to the first item
  }

  // Update the testimonial element
  updateTestimonial();
}
