import { currentMember } from 'wix-members';
import { triggeredEmails, contacts } from 'wix-crm';
import wixData from 'wix-data';

$w.onReady(async function () {
    const member = await currentMember.getMember();
    console.log(member)
    $w("#submit").onClick(() => {
        const contactInfo = {
            name: {
                first: $w('#firstName').value,
                last: $w('#lastName').value
            },
            emails: [{
                email: $w('#email').value
            }]
        };

        if (member) {
            contacts.appendOrCreateContact(contactInfo)
                .then((resolvedContact) => {
                    if (resolvedContact) {
                        const toInsert = {
                            firstName: $w('#firstName').value,
                            lastName: $w('#lastName').value,
                            email: $w('#email').value
                        };

                        wixData.insert("NewsLetter", toInsert)
                            .then((item) => {
                                console.log("Inserted item: ", item); // Log the inserted item
                                $w("#thanksText").text = "Thank you for subscribing to our newsletter!";
                                $w("#thanksText").show();

                                triggeredEmails.emailContact('UI9bhCf', resolvedContact.contactId, {
                                    variables: {
                                        firstName: $w('#firstName').value,
                                        lastName: $w('#lastName').value
                                    }
                                })
                                .catch((error) => {
                                    console.error("Error sending triggered email:", error);
                                });
                            })
                            .catch((error) => {
                                console.error("Error inserting into NewsLetter collection:", error);
                            });
                    } else {
                        console.error("Contact not resolved.");
                    }
                })
                .catch((error) => {
                    console.error("Error appending or creating contact:", error);
                });
        } else {
            $w("#thanksText").text = "Please register first to subscribe to our newsletter.";
            $w("#thanksText").show();
        }
    });
});
