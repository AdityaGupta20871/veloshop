// The code in this file will load on every page of your site
import wixlocation from 'wix-location';
import {  currentMember , authentication } from "wix-members";
$w.onReady(async function () {
  const member = await currentMember.getMember();
  if(member){
    $w('#authButton').label = 'Log Out' 
  }else{
      $w('#authButton').label = 'Register' 
  }
  $w('#authButton').onClick(()=>{
    if(member){
      authentication.logout();
	  wixlocation.to('/login')
    }else{
      wixlocation.to('/register')
    }
  })

});