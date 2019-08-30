import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

class FAQ extends React.Component {
  render() {
    return (
      <div>
        <div>
          <Navbar />
          <Sidebar />
        </div>
        <div id="wrapper">
          <div id="main-wrapper">
            <div className="header">
              <div className="header-icon">
                <FontAwesomeIcon
                  icon="question-circle"
                  size="2x"
                  color="#ff5252"
                />
              </div>
              <a className="header-text">FAQ</a>
            </div>
            <div className="FAQBody">
              <div className="scrollBody FAQVertFix">
                <ol>
                  <li>What is MyGarage?</li>
                  <p>
                    MYGarage is a portal for community residents to manage their
                    neighborhood accounts and vehicles. Residents may register
                    their and their guest&#39s vehicles for entry into the
                    neighborhood via the automated gate. Resident may also view
                    their entry records, contact the MYGarage administrators,
                    and receive community-wide messages.
                  </p>
                  <li>How can I update my account info?</li>
                  <p>
                    Click on the Profile icon in the top Navbar. From the
                    dropdown list, click on ACCOUNT. This will render your
                    account component. Data renders in account component for you
                    to view. Click on the blue settings cog icon. This will open
                    a modal form to change select account information. You have
                    the options to update your email and phone number. Click
                    SUBMIT to update the account data. A confirmation will be
                    displayed. Click OK to exit the modal. The page will
                    automatically refresh with your updated account information.
                    Click CANCEL, or the modal X button, to simply close the
                    modal without submitting a change. Click the Change Password
                    button to change your current password. All fields must be
                    filled. Click SUBMIT to update your password. A confirmation
                    will be displayed. Click OK to exit the modal. Click CANCEL,
                    or the modal X button, to simple close the modal without
                    updating your password.
                  </p>
                  <li>Can I add/update my own vehicles?</li>
                  <p>
                    Absolutely! In fact, you are the only one who can manage
                    your vehicles.
                  </p>
                  <li>Can I add/update my guest&#39;s vehicles?</li>
                  <p>
                    Absolutely! However, in the event a guest has abused their
                    privileged access to our community, our administrators
                    reserve the right to block their vehicle from gaining access
                    to our automated gate.
                  </p>
                  <li>How can I see recent garage activity?</li>
                  <p>
                    Simply go to your sidebar menu and find the Activity icon.
                    Click on the icon, which will take you to the Activity page.
                    The page will list the entry history for all your currently
                    registered vehicles.
                  </p>
                  <li>Can I block a vehicle from my approved vehicle list?</li>
                  <p>
                    Absolutely! You have the authority to block any vehicles
                    registered under your account. Simply go to your Vehicle
                    page, select the update icon for the vehicle you wish to
                    block, change the Blocked status of the vehicle, and SUBMIT.
                    The vehicle&#39s blocked status will be updated.
                  </p>
                  <li>How long does a vehicle access last?</li>
                  <p>
                    Resident vehicles have no expiration date, until the
                    resident moves out and their resident account is deleted by
                    our administrators. Guest vehicle access expires exactly one
                    year after their vehicle is registered. At that time, you
                    will need to re-register their vehicle to your account if
                    you wish for that vehicle to continue to have access to our
                    automated gate.
                  </p>
                  <li>Where can I get help with MYGarage?</li>
                  <p>
                    Please contact the MyGarage administrators with any and all
                    inquiries by using the Contact Us form. Find and click the
                    CONTACT US link in the top navbar. This will open the
                    contact us form. Fill in all fields, including your name,
                    the email address you&#39;d like the administrators to
                    respond to, and your message. Click SUBMIT to email a copy
                    of your message to all registered MYGarage administrators.
                  </p>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default FAQ;
