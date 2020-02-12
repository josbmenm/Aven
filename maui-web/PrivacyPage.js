import React from 'react';
import GenericPage from './GenericPage';
import GenericHeroHeader from './GenericHeroHeader';
import { SubSection } from './Tokens';
import BodyText from '../dashboard-ui-deprecated/BodyText';
import Container from '../dashboard-ui-deprecated/Container';
import { useTheme } from '../dashboard-ui-deprecated/Theme';
import PageFooter from './PageFooter';
import LegalLinks from './LegalLinks';

function Privacy() {
  const theme = useTheme();
  return (
    <GenericPage>
      <GenericHeroHeader
        title="Privacy Policy"
        backgroundColor={theme.colors.lightGrey}
      />
      <LegalLinks />
      <Container style={{ maxWidth: theme.layouts.small }}>
        <SubSection>
          <BodyText>
            <BodyText bold>Effective Date:</BodyText> May 27th, 2019
          </BodyText>
        </SubSection>
        <SubSection>
          <BodyText>
            We at Ono Food Co. know you care about how your personal information
            is used and shared, and we take your privacy seriously. Please read
            the following to learn more about our Privacy Policy. By using or
            accessing the Services in any manner, you acknowledge that you
            accept the practices and policies outlined in this Privacy Policy,
            and you hereby consent that we will collect, use, and share your
            information in the following ways. By using or accessing the
            Services in any manner, you acknowledge that you accept the
            practices and policies outlined in this Privacy Policy, and you
            hereby consent that we will collect, use, and share your information
            in the following ways. Remember that your use of Ono Food Co’s
            Services is at all times subject to the Terms of Use, which
            incorporates this Privacy Policy. Any terms we use in this Policy
            without defining them have the definitions given to them in the
            Terms of Use.
          </BodyText>
        </SubSection>

        <SubSection title="What does our Privacy Policy cover?">
          <BodyText>
            This Privacy Policy covers Ono Food Co’s treatment of personally
            identifiable information ("Personal Information") that we gather
            when you are accessing or using our Services, but not to the
            practices of companies we don’t own or control, or people that we
            don’t manage. We gather various types of Personal Information from
            our users, as explained in more detail below, and we use this
            Personal Information internally in connection with our Services,
            including to personalize, provide, and improve our products and
            services, develop new products and services, to allow you to set up
            a user account and profile, to contact you and allow other users to
            contact you, to fulfill your requests for certain products and
            services, to analyze how you use the Services, and for other
            internal business purposes. In certain cases, we may also share some
            Personal Information with third parties, but only as described
            below. As noted in the Terms of Service
            (http://onofood.co/legal/terms), we do not knowingly collect or
            solicit personal information from anyone under the age of 13. If you
            are under 13, please do not attempt to register for the Services or
            send any personal information about yourself to us. If we learn that
            we have collected personal information from a child under age 13, we
            will delete that information as quickly as possible. If you believe
            that a child under 13 may have provided us with personal
            information, please contact us at support@onofood.co
          </BodyText>
        </SubSection>
        <SubSection title="Privacy Policy Changes">
          <BodyText>
            At Ono Food Co, we are constantly trying to improve our Services, so
            we may need to change this Privacy Policy from time-to-time, but we
            will alert you to changes by sending a notice on the Services, by
            emailing you, and/or by another means. Do note that if you’ve opted
            not to receive legal notice emails from us (or you haven’t provided
            us with your email address), those legal notices will still govern
            your use of the Services, and you are still responsible for reading
            and understanding them. If you use the Services after any changes to
            the Privacy Policy have been posted, that means you agree to all of
            the changes.
          </BodyText>
        </SubSection>

        <SubSection title="Information you provide">
          <BodyText>
            Ono Food Co. receives and stores any information you knowingly
            provide to us. An example of this would be, if you provide your
            email when checking out from our ordering kiosks. Specific
            information may be required to register with us or to take advantage
            of some of our Services. We may communicate with you if you’ve
            provided us the means to do so. For example, if you’ve given us your
            email address, we may email you promotional offers on behalf of our
            business, or email you about your use of the Services. Also, we may
            receive a confirmation when you open an email from us. This
            confirmation helps us make our communications with you more
            interesting and improve our services.
          </BodyText>
          <BodyText>
            If you do not want to receive communications from us, please
            indicate your preference by letting us know that you no longer wish
            to receive such communications by clicking on the unsubscribe option
            in our emails or contacting us at support@onofood.co.
          </BodyText>
        </SubSection>
        <SubSection title="Information we collect automatically">
          <BodyText>
            Whenever you interact with our Services, we automatically receive
            and record information on our server logs from your browser or
            device, which may include your IP address, geolocation data, device
            identification, “cookie” information, the type of browser and/or
            device you’re using to access our Services, and the page you
            requested. “Cookies” are identifiers we transfer to your browser or
            device that allow us to recognize your browser or device and tell us
            how and when pages and features in our Services are visited and by
            how many people. You may be able to change the preferences on your
            browser or device to prevent or limit your device’s acceptance of
            cookies, but this may prevent you from taking advantage of some of
            our features. Our advertising partners may also transmit cookies to
            your browser or device, when you click on ads that appear on the
            Services. Additionally, if you click on a link to a third party
            website or service, such third party may also transmit cookies to
            you. Again, this Privacy Policy does not cover the use of cookies by
            any other third parties, and we aren’t responsible for their privacy
            policies and practices. We may use this data to customize content
            for you that we think you might like, based on your usage patterns.
            We may also use it to improve the Services - for example, this data
            can tell us how often users use a particular feature of the
            Services, and we can use that information to make our Services
            engaging to as many users as possible.
          </BodyText>
        </SubSection>
        <SubSection title="Do we share any of the personal information we receive?">
          <BodyText>
            We never sell or rent your Personal Information in personally
            identifiable form to anyone, except as expressly provided below. We
            may share your Personal Information with third parties to provide
            the services to you through our website and mobile app:
          </BodyText>
          <BodyText>
            We may use third-party analytics services, such as Google Analytics
            and Google Analytics Remarketing and Advertising Reporting Feature,
            to grow our business, to improve our Services, to monitor and
            analyze the use of our Services, to help our tech administration, to
            ensure that users have the authorization they need for us to process
            their requests, and to advertise online. These services may collect
            and retain some information about you. Google Analytics collects the
            IP address assigned to you on the date you use the Services for
            example, but not your name or other personal information.
          </BodyText>
        </SubSection>
        <SubSection title="Questions about our Privacy Policy?">
          <BodyText>
            If you have any questions or concerns, email us at
            support@onofood.co, and we will answer your inquiry as soon as
            possible.
          </BodyText>
        </SubSection>
      </Container>
      <PageFooter />
    </GenericPage>
  );
}

Privacy.navigationOptions = {
  title: 'Privacy Policy',
};

export default Privacy;
