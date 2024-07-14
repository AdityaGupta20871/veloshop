import { authentication } from "wix-members.v2";
import { currentMember } from "wix-members";
import wixLocation from 'wix-location';

$w.onReady(async function () {

  const resetErrorMessage = () => {
    $w("#successMessage").hide();
  };

  const RegisterNewMember = async () => {
    const email = $w("#email").value;
    const password = $w("#password").value;
    try {
      const registerResult = await authentication.register(email, password);
      if (registerResult.member) {
        $w("#successMessage").text = "Member Registered successfully";
        $w("#successMessage").show();

        // Redirect to login page
        wixLocation.to('/login');
      }
    } catch (error) {
      console.log(error);

      // Display error message
      $w("#successMessage").text = "Registration failed. Please enter correct details.";
      $w("#successMessage").show();
    }
  };

  $w("#submitButton").onClick(RegisterNewMember);

  // Attach the resetErrorMessage function to input fields' onChange event
  $w("#email").onInput(resetErrorMessage);
  $w("#password").onInput(resetErrorMessage);

});





