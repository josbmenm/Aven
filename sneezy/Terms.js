import React from 'react';
import GenericPage from './GenericPage';
import { Section, SubSection, List, ListItem, BodyText } from './Tokens';
import GenericHeroHeader from './GenericHeroHeader';
import { useTheme } from './ThemeContext';
import Container from './Container';
import PageFooter from './PageFooter';
import MainMenu from './MainMenu';

function Terms() {
  const theme = useTheme();
  return (
    <GenericPage>
      <MainMenu />
      <GenericHeroHeader
        title="Terms of Service"
        backgroundColor={theme.colors.lightGrey}
      />
      <Container style={{ maxWidth: 640 }}>
        <SubSection>
          <BodyText>
            <BodyText bold>Effective Date:</BodyText> May 27th, 2019
          </BodyText>
        </SubSection>

        <SubSection>
          <BodyText>
            Welcome to Ono Food Co. Please read these Terms of Service (the
            “Terms”), and our Privacy Policy (http://onofood.co/legal/privacy)
            carefully because they govern your use of our website (the “Site”),
            products, services, application (the “App”), and our robotic kitchen
            services accessible at our mobile food facility, via our Site, and
            via the App. To make these Terms easier to read, the Site, the App,
            the robotic kitchen and related services are collectively called the
            “Services.” If you have any questions, concerns, or comments
            regarding these terms or the Services, please contact us via email
            at support@onofood.co, or through a written letter sent to our
            physical address: 915 Venice Blvd. Los Angeles, CA 90015.
          </BodyText>
          <BodyText>
            These Terms are a binding contract between you and Ono Food Co.,
            doing business as Ono Blends (“Ono Blends”, “we”, “us”, or “our”).
            You must agree to and accept all of the Terms, or you don’t have the
            right to use the Services. Your using the Services in any way means
            that you agree to all of these Terms, and these Terms will remain in
            effect while you use the Services. These Terms include the
            provisions in this document, as well as those in the Privacy Policy
            (http://onofood.co/legal/privacy).
          </BodyText>
        </SubSection>
        <SubSection title="Modification">
          <BodyText>
            We are constantly trying to improve our Services, and so these Terms
            may change at any time, in Ono Food Co’s sole discretion. If we do
            so, we’ll let you know either by posting the modified Terms on our
            Site or through other communications. The amended Terms will have
            immediate effect. Your continued use of the Services following the
            posting of any changes to the Terms constitutes your acceptance of
            such changes. The most updated version of these Terms is available
            at onofood.co/legal. Ono Food Co’s Services are evolving, and hence
            it may suspend, modify or discontinue, temporarily or permanently,
            the Services from time to time without notice, and in our sole
            discretion. You agree that Ono Food Co. will not be liable to you or
            any third party as a result of such suspension, modification or
            discontinuation.
          </BodyText>
          <BodyText>
            If you do not agree with our new Terms, you are free to reject them;
            unfortunately, that means you will no longer be able to use the
            Services. If you use the Services in any way after a change to the
            Terms is effective, that means you agree to all of the changes.
          </BodyText>
        </SubSection>
        <SubSection title="Our Services">
          <BodyText>
            Ono Food Co. is a robotic food truck that is called “Ono Blends”,
            and it provides its customers smoothies and coffee. You can order
            your smoothie when you’re on-site at our ordering kiosk. At our
            ordering kiosk you select and enter the details of your order, and
            some other relevant information such as your name, phone number,
            email address, and credit card information (such information, “Order
            Details”). When your smoothie or coffee is ready, we will display
            your name that you entered on the ordering kiosk, so that you can
            grab your beverage at the designated pick-up area. Please note that
            if your beverage will not sit on at the pick-up area for longer than
            3-minutes after displaying your name. If you fail to pick-up your
            order within 3-minutes of displaying your name on our status
            display, you will have to pick it up from our counter or you will
            have to have one of our employees re-order your beverage for you.
          </BodyText>
        </SubSection>
        <SubSection title="Registration & Your Information">
          <BodyText>
            In order to use the Services via our App, you are required to create
            an account (Account), and select a password. We may, at our
            discretion, allow you to connect through your account with certain
            third-party social networking services such as Facebook (“SNS
            Account”). If you choose the SNS Account option we’ll create your
            Account by extracting from your SNS Account certain personal
            information such as your name and email address and other personal
            information that your privacy settings on the SNS Account permit us
            to access. You agree to (1) provide true, accurate, current and
            complete data about yourself on the Ono Food Co registration form
            when you create an Account (“Registration Data”) and (2) promptly
            update the Registration Data to keep it true, accurate, current and
            complete. If you fail to do any of these things, Ono Food Co. will
            have the right to suspend or terminate your Account and your use of
            the Services. You will be required to create a password as part of
            your Account creation process. You are solely responsible for
            maintaining the confidentiality of your password and Account, and
            for all use of your password and Account, whether authorized by you
            or not. You agree to (a) immediately notify Ono Food Co. via email
            at support@onofood.co of any unauthorized use of your password or
            Account or any other breach of security and (b) ensure that you
            properly exit or log out from your Account each time you use the
            Services.
          </BodyText>
        </SubSection>
        <SubSection title="Eligibility">
          <BodyText>
            The Children’s Online Privacy Protection Act (“COPPA”) requires that
            online service providers obtain parental consent before they
            knowingly collect personally identifiable information online from
            children who are under 13. You may use the Services only if you are
            13 years or older and are not barred from using the Services under
            applicable law.
          </BodyText>
          <BodyText>
            We do not knowingly collect or solicit personally identifiable
            information from children under the age of 13; if you are a child
            under 13, please do not attempt to register for the Services or send
            any personal information about yourself to us. If we learn we have
            collected personal information from a child under 13, we will delete
            that information as soon as possible. If you believe that a child
            under 13 may have provided us with personal information, please
            contact us at support@onofood.co.
          </BodyText>
        </SubSection>
        <SubSection title="Payment">
          <BodyText>
            When you place an order with us through our ordering kiosk of via
            the App, we will provide you the price of the smoothies and other
            items you have ordered. By clicking the “Place Order” button on the
            ordering kiosk or App, you are confirming your order and agreeing to
            pay the price of the items you have ordered. You authorize Ono Food
            Co or its third party payment processor to charge your credit card
            or other form of payment for the price of the beverages and other
            items that you have ordered and confirmed.
          </BodyText>
          <BodyText>We accept the following forms of payment:</BodyText>
          <List>
            <ListItem>Visa</ListItem>
            <ListItem>Mastercard</ListItem>
            <ListItem>American Express</ListItem>
            <ListItem>Discover</ListItem>
          </List>
        </SubSection>
        <SubSection title="Return Policy">
          <BodyText>
            If you don’t like your beverage for any reason at all, we will
            return it free of charge. To do so, please contact
            support@onofood.co
          </BodyText>
        </SubSection>
        <SubSection title="Communications & Feedback">
          <BodyText>
            Ono Food Co. welcomes feedback, comments, and suggestions for
            improvements and/or feature requests relating to the Services
            (“Feedback”). You can submit Feedback by emailing us at
            support@onofood.co or via our kiosk on-site. You grant to us a
            non-exclusive, worldwide, perpetual, irrevocable, fully-paid,
            royalty-free, sublicensable and transferable license under any and
            all intellectual property rights that you own or control to use,
            copy, modify, create derivative works based upon and otherwise
            exploit the Feedback for any purpose.
          </BodyText>
          <BodyText>
            As part of the Services, you may receive alerts, notifications, or
            other types of messages via text message (“Messages”). Please be
            aware that third party messaging fees may occur for some of the
            Messages depending on the message plan you have with your wireless
            carrier. By providing your cellular phone number as part of the
            registration process, you are agreeing to receive communications
            from Ono Food Co., and you specifically authorize Ono Food Co. to
            send text messages to your mobile phone.
          </BodyText>
        </SubSection>
        <SubSection title="Content & Content Rights ">
          <BodyText>
            For purposes of these Terms: (i) “Content” means text, graphics,
            images, music, software, audio, video, works of authorship of any
            kind, and information or other materials that are posted, generated,
            provided or otherwise made available through the Services; and (ii)
            “User Content” means any Content that Account holders (including
            you) provide to be made available through the Services including
            without limitation, the Order Details. Content includes without
            limitation User Content.
          </BodyText>
        </SubSection>
        <SubSection title="Ownership, Responsibility, & Removal ">
          <BodyText>
            Ono Food Co does not claim any ownership rights in any User Content
            and nothing in these Terms will be deemed to restrict any rights
            that you may have to use and exploit your User Content. Subject to
            the foregoing, Ono Food Co., and its licensors exclusively own all
            right, title and interest in and to the Services and Content,
            including all associated intellectual property rights. You
            acknowledge that the Services and Content are protected by
            copyright, trademark, and other laws of the United States and
            foreign countries. You agree not to remove, alter or obscure any
            copyright, trademark, service mark or other proprietary rights
            notices incorporated in or accompanying the Services or Content.
          </BodyText>
        </SubSection>
        <SubSection title="Rights in User Content Granted by You ">
          <BodyText>
            By making any User Content available through the Services you hereby
            grant to Ono Food Co. a non-exclusive, transferable, sublicensable,
            worldwide, royalty-free license to use, copy, modify, create
            derivative works based upon, distribute, publicly display, publicly
            perform and distribute your User Content in connection with
            operating, providing, and improving our Services and providing
            Content to you. You are solely responsible for all your User
            Content. You represent and warrant that: (i) you own all your User
            Content or you have all rights that are necessary to grant us the
            license rights in your User Content under these Terms; (ii) neither
            your User Content, nor your use and provision of your User Content
            to be made available through the Services, nor any use of your User
            Content by us on or through the Services will infringe,
            misappropriate or violate a third party’s intellectual property
            rights, or rights of publicity or privacy, or result in the
            violation of any applicable law or regulation, and (iii) you will
            comply with these Terms. You can remove your User Content by
            specifically deleting it or your Account. However, in certain
            instances, some of your User Content may not be completely removed
            and copies of your User Content may continue to exist on the
            Services. We are not responsible or liable for the removal or
            deletion of (or the failure to remove or delete) any of your User
            Content.
          </BodyText>
        </SubSection>
        <SubSection title="Rights in Services & Content Granted by Us">
          <BodyText>
            Subject to your compliance with these Terms, Ono Food Co. grants you
            a limited, non-exclusive, non-transferable, non-sublicensable
            license to download, view, copy, display and print the Content
            solely in connection with your permitted use of the Services and
            solely for your personal and non-commercial purposes. In addition,
            subject to your compliance with these Terms, Ono Food Co. grants you
            the right to use the Services solely for your personal and
            non-commercial use. Unless otherwise agreed to in writing by Ono
            Food Co., you agree that you will not use the Services or duplicate,
            download, publish, modify or otherwise distribute or use any
            material included in the Services for any purpose, except to review
            the information included in the Services, to subscribe to programs
            included in the Services, and to purchase the services or products
            offered by Ono Food Co. for your personal use.
          </BodyText>
        </SubSection>
        <SubSection title="General Prohibitions & Ono Food Co’s Enforcement Rights">
          <BodyText>You agree not to do any of the following:</BodyText>
          <List>
            <ListItem>
              Post, upload, publish, submit or transmit any Content that: (i)
              infringes a third party’s intellectual property rights or rights
              of privacy or publicity, (ii) violates, or encourages any conduct
              that would violate, any applicable law or regulation or would give
              rise to civil liability, or (iii) is fraudulent, false, misleading
              or deceptive;{' '}
            </ListItem>
            <ListItem>
              Use, display, mirror or frame the Services or any individual
              element within the Services, Ono Food Co or Ono Blend’s name, any
              Ono Food Co. trademark, logo or other proprietary information, or
              the layout and design of any page or form contained on a page,
              without Ono Food Co’s express written consent;{' '}
            </ListItem>
            <ListItem>
              Access, tamper with, or use non-public areas of the Services, Ono
              Food Co’s computer systems, or the technical delivery systems of
              Ono Food Co’s providers;{' '}
            </ListItem>
            <ListItem>
              Attempt to probe, scan or test the vulnerability of any Ono Food
              Co. system or network or breach any security or authentication
              measures;{' '}
            </ListItem>
            <ListItem>
              Avoid, bypass, remove, deactivate, impair, descramble or otherwise
              circumvent any technological measure implemented by Ono Food Co.
              or any of Ono Food Co.’s providers or any other third party
              (including another user) to protect the Services or Content;{' '}
            </ListItem>
            <ListItem>
              Use the Services or Content, or any portion thereof, for any
              commercial purpose or for the benefit of any third party or in any
              manner not permitted by these Terms;{' '}
            </ListItem>
            <ListItem>
              Attempt to decipher, decompile, disassemble or reverse engineer
              any of the software used to provide the Services or Content;{' '}
            </ListItem>
            <ListItem>
              Collect or store any personally identifiable information from the
              Services from other users of the Services without their express
              permission;{' '}
            </ListItem>
            <ListItem>
              Impersonate or misrepresent your affiliation with any person or
              entity;{' '}
            </ListItem>
            <ListItem>Violate any applicable law or regulation; or </ListItem>
            <ListItem>
              Encourage or enable any other individual to do any of the
              foregoing.{' '}
            </ListItem>
          </List>
          <BodyText>
            Although we’re not obligated to monitor access to or use of the
            Services or Content or to review or edit any Content, we have the
            right to do so for the purpose of operating the Services, to ensure
            compliance with these Terms, and to comply with applicable law or
            other legal requirements. We reserve the right, but are not
            obligated, to remove or disable access to any Content, at any time
            and without notice, including, but not limited to, if we, at our
            sole discretion, consider any Content to be objectionable or in
            violation of these Terms. We have the right to investigate
            violations of these Terms or conduct that affects the Services
            including, consulting and cooperating with law enforcement
            authorities to prosecute users who violate the law.
          </BodyText>
        </SubSection>
        <SubSection title="Warranty Disclaimer">
          <BodyText>
            YOUR USE OF THE SERVICE IS AT YOUR SOLE RISK AND IS PROVIDED ON AN
            ‘AS IS’ AND ‘AS AVAILABLE’ BASIS. THE SERVICES ARE FOR YOUR PERSONAL
            USE ONLY AND WE MAKE NO REPRESENTATION OR WARRANTY OF ANY KIND,
            EXPRESS OR IMPLIED. WE DO NOT ENDORSE, WARRANT OR GUARANTEE ANY
            MATERIAL, PRODUCT OR SERVICE OFFERED THROUGH US OR THE SERVICES.
            WITHOUT LIMITING THE FOREGOING, ONO FOOD CO. DISCLAIMS ANY
            WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE,
            QUIET ENJOYMENT, AND NON-INFRINGEMENT, AND ANY WARRANTIES ARISING
            OUT OF COURSE OF DEALING OR USAGE OF TRADE. ONO FOOD CO. FURTHER
            DISCLAIMS ANY WARRANTY THAT THE SERVICES WILL BE UNINTERRUPTED, BE
            FREE FROM INACCURACIES, ERRORS, VIRUSES OR OTHER HARMFUL COMPONENTS,
            OR MEET YOUR REQUIREMENTS.
          </BodyText>
        </SubSection>
        <SubSection title="Limitation of Liability">
          <BodyText>
            TO THE EXTENT PERMITTED BY LAW, ONO FOOD CO. AND ITS SUBSIDIARIES
            AND LICENSORS WILL NOT BE LIABLE TO YOU OR ANY THIRD PARTY FOR ANY
            DIRECT, INDIRECT, PUNITIVE, INCIDENTAL, SPECIAL, CONSEQUENTIAL
            DAMAGES (INCLUDING DAMAGES RELATING TO LOST PROFITS, LOST DATA OR
            LOSS OF GOODWILL) OR ANY DAMAGES WHATSOEVER THAT RESULT FROM YOUR
            USE OF OR INABILITY TO USE THE SERVICES. THIS LIMITATION APPLIES
            WHETHER THE ALLEGED LIABILITY IS BASED ON CONTRACT, TORT,
            NEGLIGENCE, STRICT LIABILITY, OR ANY OTHER LEGAL THEORY, AND EVEN IF
            ONO FOOD CO. HAS BEEN ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
            WITHOUT LIMITING THE FOREGOING, ONO FOOD CO. WILL NOT BE LIABLE FOR
            ANY LOSS OR DAMAGE ARISING OUT OF YOUR FAILURE TO COMPLY WITH THE
            “REGISTRATION, ACCOUNTS AND PASSWORDS” SECTION OF THESE TERMS OR
            YOUR USER CONTENT.IN NO EVENT WILL ONO FOOD CO’S TOTAL LIABILITY
            ARISING OUT OF OR IN CONNECTION WITH THESE TERMS OR FROM THE USE OF
            OR INABILITY TO USE THE SERVICES EXCEED THE AMOUNTS YOU HAVE PAID OR
            ARE PAYABLE BY YOU TO ONO FOOD CO. FOR USE OF THE SERVICES IN THE
            THREE MONTHS PRECEDING THE CLAIM, OR ONE HUNDRED DOLLARS ($100), IF
            YOU HAVE NOT HAD ANY PAYMENT OBLIGATIONS TO ONO FOOD CO., AS
            APPLICABLE.
          </BodyText>
        </SubSection>
        <SubSection title="Third Party Websites">
          <BodyText>
            The third party websites linked to or from the Services are not
            controlled by Ono Food Co. and Ono Food Co. is not responsible for
            the contents of such third party websites. Accordingly, Ono Food Co.
            makes no warranties or conditions regarding such third party
            websites and will not be liable for any loss or damage caused by
            your use of or reliance on such websites. Your use of third party
            websites is at your own risk. The inclusion on the Services of a
            link to third party websites are provided solely for your
            convenience and do not indicate, expressly or impliedly, any
            endorsement by Ono Food Co. for the third party websites or the
            products or services provided at such websites.
          </BodyText>
        </SubSection>
        <SubSection title="Indemnity">
          <BodyText>
            You will indemnify and hold harmless Ono Food Co. and its
            representatives, agents, affiliates, members, officers, directors,
            employees and managers (the “Indemnified Parties”), and at Ono Food
            Co’s option defend the Indemnified Parties, from and against any
            damage, loss, cost or expense (including without limitation, legal
            and attorney’s fees and costs) incurred in connection with any third
            party claim, demand, proceeding or action (“Claim”) brought against
            any of the Indemnified Parties arising out of: (i) your use of the
            Services, (ii) your User Content, or (iii) any alleged breach by you
            of any provision of these Terms. If you are obligated to indemnify
            Ono Food Co., Ono Food Co. may, in its sole and absolute discretion,
            control the defense and disposition (including its possible
            settlement) of any Claim at your sole cost and expense. Without
            limitation of the foregoing, you will not settle, compromise or in
            any other manner dispose of any Claim without the written consent of
            Ono Food Co.
          </BodyText>
        </SubSection>
        <SubSection title="Termination">
          <BodyText>
            In its sole and absolute discretion, with or without notice to you,
            Ono Food Co. may (1) suspend or terminate your use of the Service,
            or (2) terminate your Account. You may terminate your Account for
            any reason by emailing Ono Food Co. at support@onofood.co. Ono Food
            Co. shall not be liable to you or any third party for any claims or
            damages arising out of any termination or suspension of the Services
            or your Account.
          </BodyText>
        </SubSection>
        <SubSection title="Dispute Resolution" />
        <SubSection title="Governing Law">
          <BodyText>
            These Terms and any action related thereto will be governed by the
            laws of the State of California without regard to its conflict of
            laws provisions.
          </BodyText>
        </SubSection>
        <SubSection title="Agreement to Arbitrate">
          <BodyText>
            You and Ono Food Co. agree that any dispute, claim or controversy
            arising out of or relating to these Terms or the breach,
            termination, enforcement, interpretation or validity thereof or the
            use of the Services or Content (collectively, “Disputes”) will be
            settled by binding arbitration, except that each party retains the
            right: (i) to bring an individual action in small claims court and
            (ii) to seek injunctive or other equitable relief in a court of
            competent jurisdiction to prevent the actual or threatened
            infringement, misappropriation or violation of a party’s copyrights,
            trademarks, trade secrets, patents or other intellectual property
            rights (the action described in the foregoing clause (ii), an “IP
            Protection Action”). Without limiting the preceding sentence, you
            will also have the right to litigate any other Dispute if you
            provide Ono Food Co. with written notice of your desire to do so by
            email or regular mail at: support@onofood.co; 915 Venice Blvd. Los
            Angeles, CA 90015 within thirty (30) days following the date you
            first agree to these Terms (such notice, an “Arbitration Opt-out
            Notice”). If you don’t provide Ono Food Co. with an Arbitration
            Opt-out Notice within the thirty (30) day period, you will be deemed
            to have knowingly and intentionally waived your right to litigate
            any Dispute except as expressly set forth in clauses (i) and (ii)
            above. The exclusive jurisdiction and venue of any IP Protection
            Action or, if you timely provide Ono Food Co. with an Arbitration
            Opt-out Notice, will be the state and federal courts located in the
            Northern District of California and each of the parties hereto
            waives any objection to jurisdiction and venue in such courts.
            Unless you timely provide Ono Food Co. with an Arbitration Opt-out
            Notice, you acknowledge and agree that you and Ono Food Co. are each
            waiving the right to a trial by jury or to participate as a
            plaintiff or class member in any purported class action or
            representative proceeding.Further, unless both you and Ono Food Co.
            otherwise agree in writing, the arbitrator may not consolidate more
            than one person's claims, and may not otherwise preside over any
            form of any class or representative proceeding. If this specific
            paragraph is held unenforceable, then the entirety of this “Dispute
            Resolution” section will be deemed void. Except as provided in the
            preceding sentence, this “Dispute Resolution” section will survive
            any termination of these Terms.
          </BodyText>
        </SubSection>
        <SubSection title="Arbitration Rules">
          <BodyText>
            The arbitration will be administered by the American Arbitration
            Association (“AAA”) in accordance with the Commercial Arbitration
            Rules and the Supplementary Procedures for Consumer Related Disputes
            (the “AAA Rules”) then in effect, except as modified by this
            “Dispute Resolution” section. (The AAA Rules are available at
            www.adr.org/arb_medor by calling the AAA at 1-800-778-7879.) The
            Federal Arbitration Act will govern the interpretation and
            enforcement of this Section.
          </BodyText>
        </SubSection>
        <SubSection title="Arbitration Process">
          <BodyText>
            A party who desires to initiate arbitration must provide the other
            party with a written Demand for Arbitration as specified in the AAA
            Rules. (The AAA provides a general Demand for Arbitration and a
            separate Demand for Arbitration for California residents.) The
            arbitrator will be either a retired judge or an attorney licensed to
            practice law and will be selected by the parties from the AAA’s
            roster of arbitrators. If the parties are unable to agree upon an
            arbitrator within seven (7) days of delivery of the Demand for
            Arbitration, then the AAA will appoint the arbitrator in accordance
            with the AAA Rules.
          </BodyText>
        </SubSection>
        <SubSection title="Arbitration Location & Procedure">
          <BodyText>
            Unless you and Ono Food Co. otherwise agree, the arbitration will be
            conducted in the county where you reside. If your claim does not
            exceed $10,000, then the arbitration will be conducted solely on the
            basis of the documents that you and Ono Food Co. submitted to the
            arbitrator, unless you request a hearing or the arbitrator
            determines that a hearing is necessary. If your claim exceeds
            $10,000, your right to a hearing will be determined by the AAA
            Rules. Subject to the AAA Rules, the arbitrator will have the
            discretion to direct a reasonable exchange of information by the
            parties, consistent with the expedited nature of the arbitration.
          </BodyText>
        </SubSection>
        <SubSection title="Arbitrator’s Decision">
          <BodyText>
            The arbitrator will render an award within the time frame specified
            in the AAA Rules. The arbitrator’s decision will include the
            essential findings and conclusions upon which the arbitrator based
            the award. Judgment on the arbitration award may be entered in any
            court having jurisdiction thereof. The arbitrator’s award of damages
            must be consistent with the terms of the “Limitation of Liability”
            section above as to the types and amounts of damages for which a
            party may be held liable. The arbitrator may award declaratory or
            injunctive relief only in favor of the claimant and only to the
            extent necessary to provide relief warranted by the claimant’s
            individual claim. If you prevail in arbitration you will be entitled
            to an award of attorneys’ fees and expenses, to the extent provided
            under applicable law. Ono Food Co. will not seek, and hereby waives
            all rights it may have under applicable law to recover, attorneys’
            fees and expenses if it prevails in arbitration.
          </BodyText>
        </SubSection>
        <SubSection title="Fees">
          <BodyText>
            Your responsibility to pay any AAA filing, administrative and
            arbitrator fees will be solely as set forth in the AAA Rules.
            However, if your claim for damages does not exceed $75,000, Ono Food
            Co. will pay all such fees unless the arbitrator finds that either
            the substance of your claim or the relief sought in your Demand for
            Arbitration was frivolous or was brought for an improper purpose (as
            measured by the standards set forth in Federal Rule of Civil
            Procedure 11(b)).
          </BodyText>
        </SubSection>
        <SubSection title="Changes">
          <BodyText>
            Notwithstanding the provisions of the “Modification” section above,
            if Ono Food Co. changes this “Dispute Resolution” section after the
            date you first accepted these Terms (or accepted any subsequent
            changes to these Terms), you may reject any such change by sending
            us written notice (including by email to support@onofood.co) within
            30 days of the date such change became effective, as indicated in
            the “Last Updated” date above or in the date of Ono Food Co’s email
            to you notifying you of such change. By rejecting any change, you
            are agreeing that you will arbitrate any Dispute between you and Ono
            Food Co. in accordance with the provisions of this “Dispute
            Resolution” section as of the date you first accepted these Terms
            (or accepted any subsequent changes to these Terms).
          </BodyText>
        </SubSection>
        <SubSection title="General">
          <BodyText>
            These Terms constitute the entire and exclusive understanding and
            agreement between Ono Food Co. and you regarding the Services and
            Content, and these Terms supersede and replace any and all prior
            oral or written understandings or agreements between Ono Food Co,
            and you regarding the Services and Content. If any provision of
            these Terms is held invalid or unenforceable (either by an
            arbitrator appointed pursuant to the terms of the “Arbitration”
            section above or by a court of competent jurisdiction, but only if
            you timely opt out of arbitration by sending us an Arbitration
            Opt-out Notice in accordance with the terms set forth above), that
            provision will be enforced to the maximum extent permissible and the
            other provisions of these Terms will remain in full force and
            effect. You may not assign or transfer these Terms, by operation of
            law or otherwise, without Ono Food Co’s prior written consent. Any
            attempt by you to assign or transfer these Terms, without such
            consent, will be null. Ono Food Co. may freely assign or transfer
            these Terms without restriction. Subject to the foregoing, these
            Terms will bind and inure to the benefit of the parties, their
            successors and permitted assigns. Any notices or other
            communications provided by Ono Food Co. under these Terms, including
            those regarding modifications to these Terms, will be given: (i) via
            email; or (ii) by posting to the Services. For notices made by
            e-mail, the date of receipt will be deemed the date on which such
            notice is transmitted. Ono Food Co’s failure to enforce any right or
            provision of these Terms will not be considered a waiver of such
            right or provision. The waiver of any such right or provision will
            be effective only if in writing and signed by a duly authorized
            representative of Ono Food Co. Except as expressly set forth in
            these Terms, the exercise by either party of any of its remedies
            under these Terms will be without prejudice to its other remedies
            under these Terms or otherwise.
          </BodyText>
        </SubSection>
        <SubSection title="Contact Us">
          <BodyText>
            In order to resolve a complaint regards the Site or Services or to
            receive further information regarding the use of the Site or
            Services, please contact us at:
          </BodyText>
          <BodyText>
            Ono Food Co.{'\n'}
            915 Venice Blvd.{'\n'}
            Los Angeles, CA 90015{'\n'}
            United States{'\n'}
            Phone: (213) 357-0614{'\n'}
            support@onofood.co{'\n'}
          </BodyText>
        </SubSection>
      </Container>
      <PageFooter />
    </GenericPage>
  );
}

Terms.navigationOptions = {
  title: 'Terms',
};

export default Terms;
