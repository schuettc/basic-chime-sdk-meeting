# Click-to-Call Web Integrations

This repo presents samples and easily deployable components to integrate [Amazon Chime Click-to-Call](https://github.com/aws-samples/amazon-chime-sdk-click-to-call) in a general website with the absolute minimal dependencies and a very simple mechanism to include the functionality.

## Assumptions

* The website where Click-to-Call is to be integrated will exercise user management and present the functionality to logged in users so as 
  * secure access the API and backend resources

In this project a small sample website using [Amazon Cognito](https://aws.amazon.com/cognito/) user management, authentication, and authorization is provided for reference.

## Tenets

* Simple integration with minimal footprint (e.g. `<script>` and `<div>` tags)
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

[ ] Storyboard/Wireframe use cases

[ ] Architecture Diagram

[ ] API design (actions/objects) and sequence diagram
