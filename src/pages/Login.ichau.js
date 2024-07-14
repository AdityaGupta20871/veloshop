// Velo API Reference: https://www.wix.com/velo/reference/api-overview/introduction
import { authentication } from "wix-members-frontend";
import wixLocation from 'wix-location';

$w.onReady(function () {
  const loginMember = async () => {
    const email = $w("#email").value;
    const password = $w("#password").value;
    try {
      const loggedIn = await authentication.login(email, password);
      console.log(loggedIn);

      // User successfully logged in
      $w("#successMessage").text = "User logged in successfully";
      $w("#successMessage").show();

      // Redirect to home page
      wixLocation.to('/home');
    } catch (error) {
      console.log(error);

      // Display error message
      $w("#successMessage").text = "Enter correct details for login";
      $w("#successMessage").show();
    }
  };

  $w("#submitButton").onClick(loginMember);
});
