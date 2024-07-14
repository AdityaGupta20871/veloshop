import { authentication } from "wix-members.v2";
import wixLocation from 'wix-location';
$w.onReady(function () {

  const sendResetPasswordEmail = async () => {
    const email = $w("#email").value;

    try {
      const result = await authentication.sendSetPasswordEmail(email);
      console.log(result);
      // Show success message
      $w("#message").text = "Reset password email sent successfully";
      $w("#message").show();
	  wixLocation.to('/login');
    } catch (error) {
      console.error(error);
      
      $w("#message").text = "Failed to send reset password email. Please try again.";
      $w("#message").show();
    }
  };

  $w("#resetButton").onClick(sendResetPasswordEmail);

});
