import React from 'react';
import { Document, Page, Text, View, Font } from '@react-pdf/renderer';
import ReactPDF from '@react-pdf/renderer';
import fetch, { Headers } from 'node-fetch';
import fs from 'fs-extra';

Font.register({
  family: 'Open Sans',
  src: `${__dirname}/fonts/Open_Sans/OpenSans-Regular.ttf`,
});
Font.register({
  family: 'Lato',
  src: `${__dirname}/fonts/Lato/Lato-Regular.ttf`,
});
Font.register({
  family: 'Lato Italic',
  src: `${__dirname}/fonts/Lato/Lato-Italic.ttf`,
});
Font.register({
  family: 'Lato Bold',
  src: `${__dirname}/fonts/Lato/Lato-Bold.ttf`,
});

function PageTitle({ children }) {
  return (
    <Text
      style={{ textAlign: 'center', fontFamily: 'Lato Bold', marginBottom: 60 }}
    >
      {children}
    </Text>
  );
}
function AppendixTitle({ children }) {
  return <Text style={{ fontFamily: 'Lato Bold' }}>{children}</Text>;
}

function Term({ children, title, number }) {
  return (
    <View style={{ flexDirection: 'row', marginBottom: 30, borderWidth: 1 }}>
      <View style={{ width: 50 }}>
        <Text>{number}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: 'Lato Bold' }}>{title} </Text>
        <Text style={{ fontFamily: 'Lato' }}>{children}</Text>
      </View>
    </View>
  );
}

function TermList({ children }) {
  return children;
}

function StandardPage({ children }) {
  return (
    <Page style={{ paddingVertical: 80 }}>
      <View style={{ flex: 1, justifyContent: 'center', flexDirection: 'row' }}>
        <View
          style={{
            flex: 1,
            maxWidth: '80%',
            alignSelf: 'stretch',
            paddingTop: 100,
            paddingBottom: 80,
          }}
        >
          {children}
        </View>
      </View>
    </Page>
  );
}

function Contract({
  clientName,
  clientAddress,
  openSourceDeliverables,
  proprietaryDeliverables,
  paymentTerms,
  scheduleTerms,
  softwareServices,
}) {
  return (
    <Document
      author="Aven, LLC"
      // keywords="awesome, resume, start wars"
      // subject="The resume of Luke Skywalker"
      title="Software Services Agreement"
    >
      <StandardPage>
        <PageTitle>Software Services Agreement</PageTitle>
        <TermList>
          <Text>
            This Software Services Agreement (this “​Agreement”​ ) is made and
            entered into as of 00/00/2020 (the “​Effective Date​”) by and
            between {clientName} with its principal place of business at{' '}
            {clientAddress} (the Client), and Aven LLC, a limited liability
            company in the state of California, with its principal place of
            business at 548 Market St. #74668 San Francisco ("Aven") (each
            herein referred to individually as a “​Party​,” or collectively as
            the “​Parties​”).
          </Text>
          <Term number="1." title="Services and Payment">
            Aven agrees to undertake and complete the Services (as defined in
            Exhibit A) in accordance with and on the schedule specified in
            Exhibit A.
          </Term>
          <Term number="2." title="Fees">
            The Client will pay Aven the fees (the "Fees") as specified in
            Exhibit E.
          </Term>

          <Term
            number="3."
            title="Ownership; Rights; Proprietary Information; Publicity"
          >
            The Client retains all right, title and interest to content provided
            to Aven for the work.
          </Term>
          <Term number="3.1" title="Client Ownership">
            Aven grants the Client a non-expiring, worldwide, royalty-free,
            non-exclusive license to use, reproduce, modify, display, sublicense
            and distribute (except where prohibited by law) the Proprietary
            Deliverables, as specified in Exhibit B, and to the results of the
            services in Exhibit A, after the invoice is paid to Aven.
          </Term>
          <Term number="3.2" title="Open Source Ownership">
            Subject to the terms and conditions of the Apache 2.0 License, Aven
            hereby grants to the Client a perpetual, worldwide, non-exclusive,
            no-charge, royalty-free, irrevocable copyright license to reproduce,
            prepare Derivative Works of, publicly display, publicly perform,
            sublicense, and distribute the Aven framework, including the
            Deliverables specified in Exhibit C, in Source or Object form.
          </Term>

          <Term number="5." title="Confidentiality" />
          <Term number="5.1." title="Definition of Confidential Information">
            "CONFIDENTIAL INFORMATION" as used in this Agreement shall mean any
            and all technical and non-technical information including patent,
            copyright, trade secret, proprietary information, computer files,
            and client information related to the past, current, future, and
            proposed services of Client and includes, without limitation, Client
            property, and Client's information concerning customers, research,
            financial information, purchasing, business forecasts, sales and
            merchandising, and marketing plans and information.
          </Term>
          <Term number="5.2." title="Nondisclosure and Nonuse Obligations">
            Aven agrees to protect the confidentiality of all Confidential
            Information and, except as permitted in this section, Aven shall
            neither use nor disclose the Confidential Information. Aven may use
            the Confidential Information solely to perform consulting services
            under this Agreement for the benefit of Client.
          </Term>
          <Term
            number="5.3."
            title="Exclusion from Nondisclosure and Nonuse Obligations"
          >
            Aven's obligations under Section 5.2 ("NONDISCLOSURE AND NONUSE
            OBLIGATIONS") with respect to any portion of the Confidential
            Information shall not apply to any such portion that Aven can
            demonstrate (a) was in the public domain at or subsequent to the
            time such portion was communicated to Aven by Client; (b) was
            rightfully in Aven's possession free of any obligation of confidence
            at or subsequent to the time such portion was communicated to Aven
            by Client; or (c) was developed by Aven independently of and without
            reference to any information communicated to Aven by Client. A
            disclosure of Confidential Information by Aven, either (i) in
            response to a valid order by a court or other governmental body,
            (ii) otherwise required by law, or (iii) necessary to establish the
            rights of either party under this Agreement, shall not be considered
            a breach of this Agreement or a waiver of confidentiality for other
            purposes, provided, however, that Aven shall provide prompt written
            notice thereof to Client to enable Client to seek a protective order
            or otherwise prevent such disclosure.
          </Term>
          <Term number="6." title="General Provisions" />
          <Term number="6.1." title="Governing Law">
            This Agreement shall be governed in all respects by the laws of the
            United States of America and by the laws of the State of California.
            Each of the parties irrevocably consents to the exclusive personal
            jurisdiction of the state courts of California, as applicable, for
            any matter arising out of or relating to this Agreement, except that
            in actions seeking to enforce any order or any judgment of such
            state courts located in California, such personal jurisdiction shall
            be nonexclusive.
          </Term>
          <Term number="6.2." title="Severability">
            If any provision of this Agreement is held by a court of law to be
            illegal, invalid, or unenforceable, (a) that provision shall be
            deemed amended to achieve as nearly as possible the same economic
            effect as the original provision, and (b) the legality, validity,
            and enforceability of the remaining provisions of this Agreement
            shall not be affected or impaired thereby.
          </Term>
          <Term number="2." title="Warranty">
            Aven warrants that the Services will be performed in a professional
            and workmanlike manner and that none of such Services or any part of
            this Agreement is or will be inconsistent with any obligation Aven
            may have to others.
          </Term>
          <Term number="3." title="Independent Contractor Relationship">
            Aven's relationship with Client will be that of an independent
            contractor, and nothing in this Agreement is intended to, or should
            be construed to, create a partnership, agency, joint venture, or
            employment relationship. No part of Aven’s compensation will be
            subject to withholding by Client for the payment of any social
            security, federal, state ,or any other employee payroll taxes. The
            Client warrants and guarantees that the Client’s software and/or
            services do not violate and law, codes or regulations, and that the
            same does not infringe upon any trademarks, patents, copyrights etc.
            throughout the world. To the fullest extent of the law the Client
            agrees to indemnify and hold harmless Aven for any suit or claim
            against Aven which arises out of section 3 of this agreement.
          </Term>
        </TermList>
      </StandardPage>
      <StandardPage>
        <PageTitle>Appendix</PageTitle>
        <AppendixTitle>Exhibit A. Proprietary Services</AppendixTitle>
        {softwareServices}
        <AppendixTitle>Exhibit B. Proprietary Deliverables</AppendixTitle>
        {proprietaryDeliverables}
        <AppendixTitle>Exhibit C. Open Source Deliverables</AppendixTitle>
        {openSourceDeliverables}
        <AppendixTitle>Exhibit D. Payment</AppendixTitle>
        {paymentTerms}
        <AppendixTitle>Exhibit E. Schedule</AppendixTitle>
        {scheduleTerms}
      </StandardPage>
    </Document>
  );
}

async function createProcedure({ name }) {
  console.log('hi');
  const pdfBuildPath = `${__dirname}/example.pdf`;
  await ReactPDF.render(
    <Contract
      clientName="SciFind"
      clientAddress="asdf"
      softwareServices={null}
      proprietaryDeliverables={null}
      openSourceDeliverables={null}
      paymentTerms={null}
      scheduleTerms={null}
    />,
    pdfBuildPath,
  );
  console.log('ho');

  const pdfFile = await fs.readFile(pdfBuildPath);
  var yousignHeaders = new Headers();
  yousignHeaders.append(
    'Authorization',
    'Bearer ' + process.env.YOUSIGN_API_KEY,
  );
  yousignHeaders.append('Content-Type', 'application/json');

  var requestOptions = {
    method: 'GET',
    headers: yousignHeaders,
    redirect: 'follow',
  };

  const resp = await fetch(
    'https://staging-api.yousign.com/users',
    requestOptions,
  );
  const yousignUsers = await resp.json();
  console.log('yousignUsers', yousignUsers);
  const payload = JSON.stringify({
    name: 'MyContract2.pdf',
    content: pdfFile.toString('base64'),
  });

  const fileUploadResp = await fetch('https://staging-api.yousign.com/files', {
    method: 'POST',
    headers: yousignHeaders,
    body: payload,
    redirect: 'follow',
  });
  const yousignFile = await fileUploadResp.json();
  console.log('yousignFile', yousignFile);

  const createProcedureResponse = await fetch(
    'https://staging-api.yousign.com/procedures',
    {
      method: 'POST',
      headers: yousignHeaders,
      body: JSON.stringify({
        name: 'My first procedure',
        description: 'Awesome! Here is the description of my first procedure',
        members: [
          {
            firstname: 'John',
            lastname: 'Doe',
            email: 'john.doe@yousign.fr',
            phone: '+33612345678',
            fileObjects: [
              {
                file: yousignFile.id,
                page: 1,
                position: '230,499,464,589',
                mention: 'Read and approved',
                mention2: 'Signed by John Doe',
              },
            ],
          },
        ],
      }),
      redirect: 'follow',
    },
  );
  const procedure = await createProcedureResponse.json();
  console.log('procedure', procedure);
}

createProcedure({
  name: process.argv[2],
})
  .then(() => {
    console.log('done.');
  })
  .catch(err => {
    console.error(err);
  });
