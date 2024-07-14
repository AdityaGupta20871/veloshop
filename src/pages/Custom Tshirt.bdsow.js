import wixLocation from 'wix-location';
import { authentication, currentMember } from 'wix-members';
import wixData from 'wix-data';
import { generateImage } from 'backend/replicate.web.js';

$w.onReady(async function () {
  // Check if the current user is a member
  const member = await currentMember.getMember();
  if (!member) {
    wixLocation.to('/register'); // Redirect to register page if not a member
    return;
  }

  let selectedColor = ''; // Variable to store the selected T-shirt color

  // Fetch T-shirt collection data
  try {
    const result = await wixData.query('Tshirt')
      .find();

    const tshirtData = result.items.map(item => ({
      _id: item._id,
      imageUrl: item.image,
      color: item.color
    }));

    $w('#repeater').data = tshirtData;
  } catch (error) {
    console.error('Error fetching T-shirt data:', error.message);
  }

  // Handle generate button click
  $w('#generate').onClick(async () => {
    const prompt = $w('#promptBox').value;

    try {
      const imageUrl = await generateImage(prompt);
      $w('#promptImage').src = imageUrl; // Display the generated image
      $w('#promptImage').show(); // Show the image element

      // Store the generated image URL into the AIImage collection
      const newItem = {
        URL: imageUrl,
        Image: imageUrl
      };
      await wixData.insert('AIImage', newItem);

    } catch (error) {
      console.error('Error generating image:', error.message);
      // Optionally, display an error message to the user
    }
  });

  // Handle repeater item click
  $w('#repeater').onItemReady(($item, itemData, index) => {
    $item('#RepeaterImage').src = itemData.imageUrl; // Set the image URL for the repeater item
    $item('#RepeaterImage').onClick(() => {
      $w('#bgImage').src = itemData.imageUrl; // Update the background image
      selectedColor = itemData.color; // Store the selected color
    });
  });
});
