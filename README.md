# Click-to-Call Web Integrations

This repo presents samples and easily deployable components to integrate [Amazon Chime Click-to-Call](https://github.com/aws-samples/amazon-chime-sdk-click-to-call) in a general website with the absolute minimal dependencies and a very simple mechanism to include the functionality.

## Assumptions

* The website where Click-to-Call is to be integrated will exercise user management and present the functionality to logged in users so as to
  * secure access the API and backend resources

In this project a small sample website using [Amazon Cognito](https://aws.amazon.com/cognito/) user management, authentication, and authorization is provided for reference.

## Tenets

* Simple integration with minimal footprint (e.g. `<script>` and `<div>` tags or React include and Component)
  * single url to include
  * single div tag to place

* Provide Higher Order integration patterns (e.g. React Component)

* Allow for configuration of features and styling with tag attributes
  * compatible with Bootstrap
  * integrates with CSS

* Minimal trust of client
  * user must log in
  * logged in user receives an access token which must be passed to the Click-to-Call object to allow the widget to access the backend API to setup the call

## Structure of project

![Project Structure](./images/solution-overview.png)

Consider a case where a company serves a website or app to customers and where a logged-in customer wishes to connect to an agent for service. The website maintainer can include a script and div tag on the appropriate page to present a 'Click to Call' button (widget) to the user. For the purposes of this project, a sample website is included in the `site` directory.

The source for the Click to Call widget is in the `src/frontend` directory, and when deployed, is served from an S3 Bucket origin through a CloudFront distribution into the `script` tag in the `site` source. It is necessary to pass the API token to the widget (via attribute) as the API Gateway requires token authentication. For this sample, the `site` uses Amazon Cognito for user login and token issuance.

When the user clicks the button, the widget will call the API Gateway created from the source in `src/backend`, which is configured for Cognito token authorization, to request a new meeting ID. Using this meeting ID, the frontend widget initiates a WebRTC (audio) connection to Amazon Chime SDK.  Upon meeting creation a Lambda function will create a connection to the Amazon Chime Voice Connector which will dial out to the call center. Metadata such as username and page context can also be passed as transaction attributes to the agent call.

## Backlog of work items -- TODOs

[ ] Build 'Octank Financial' **_site_** for a sample with Amplify and Cognito

[ ] Add `CallControl` and `UpdateCall` Lambda to deployment (or just include the click to call repo?)

[ ] Separate the deployment of site from Click-to-Call. These deployments should be separable. In that way, the customer can deploy the entire sample to evaluate it and then deploy _just_ the frontend/backend stacks and perform an integration on their existing site. The 'non-site' part of the project should as '1-click' reusable as possible.

[ ] Write doc about how to modify API AuthZ for non-Cognito uses (e.g. Lambda Authorizer)

[ ] 'Package' FrontEnd as a Button where all fields are hidden or given in attributes

[ ] Configure Button styles with attribute bindings to CSS (or Bootstrap)

[ ] API should return meetingID (does it need to stored in database?)

[ ] Widget should auto-create attendeeID (UUID ?)

[ ] Widget should accept some opaque data (like username, or path) through attributes and possibly setter method. Data should be passed (eventually) into call's TransactionAttributes.

[ ] Widget should present a menu of audio devices for user selection, but select the first one by default and retain user choice in local storage.

[ ] Mute control should also be included in the audio menu. Off by default.

[ ] Voice focus should be enabled by attribute to the Widget and setter method. On by default.

[ ] When connected, the 'click to call' button should change to 'end call'

[ ] Provide pre- and post- callback hooks to the Widget so that customers can present 'TOU agreements' or other disclosures/releases as well as summary or follow up info.

[ ] Widget should perform a 'capacity check' call to the API on startup. The API can check a dynamo table or other to ensure there are agents available to take a call and if the call is within service hours. If the call cannot be completed, the widget can be configured (by attribute) to either show a 'greyed out button' of no one available (customizable message) or suppress drawing all together.
