// callControl.js
var { v4: uuidv4 } = require('uuid');
var AWS = require('aws-sdk');
var chime = new AWS.Chime({ region: 'us-east-1' });
chime.endpoint = new AWS.Endpoint(
  'https://service.chime.aws.amazon.com/console',
);
var docClient = new AWS.DynamoDB.DocumentClient();
var region = 'us-east-1';

const response = {
  statusCode: 200,
  body: '',
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json',
  },
};

exports.handler = async (event, context) => {
  const body = JSON.parse(event.body);
  console.info('Body: ' + JSON.stringify(body));

  const joinInfo = await createMeeting();
  const dialInfo = await executeDial(joinInfo, toNumber);
  await putInfo(joinInfo, dialInfo);
  const responseInfo = JSON.stringify({ joinInfo, dialInfo });
  console.info('Repsonse to Client: ' + responseInfo);
  response.statusCode = 200;
  response.body = responseInfo;
  return response;
};
async function createMeeting() {
  const meetingRequest = {
    ClientRequestToken: uuidv4(),
    MediaRegion: region,
    ExternalMeetingId: uuidv4(),
  };
  console.info(
    'Creating new meeting before joining: ' + JSON.stringify(meetingRequest),
  );
  const meetingInfo = await chime.createMeeting(meetingRequest).promise();
  console.info('Meeting Info: ' + JSON.stringify(meetingInfo));

  const clientAttendeeRequest = {
    MeetingId: meetingInfo.Meeting.MeetingId,
    ExternalUserId: 'Client-User',
  };
  console.info(
    'Creating new attendee: ' + JSON.stringify(clientAttendeeRequest),
  );
  const clientAttendeeInfo = await chime
    .createAttendee(clientAttendeeRequest)
    .promise();
  console.info('Client Attendee Info: ' + JSON.stringify(clientAttendeeInfo));

  const phoneAttendeeRequest = {
    MeetingId: meetingInfo.Meeting.MeetingId,
    ExternalUserId: 'Phone-User',
  };
  console.info(
    'Creating new attendee: ' + JSON.stringify(phoneAttendeeRequest),
  );
  const phoneAttendeeInfo = await chime
    .createAttendee(phoneAttendeeRequest)
    .promise();
  console.info('Client Attendee Info: ' + JSON.stringify(phoneAttendeeInfo));

  const joinInfo = {
    Meeting: meetingInfo.Meeting,
    Attendee: [clientAttendeeInfo.Attendee, phoneAttendeeInfo.Attendee],
  };
  console.info('joinInfo: ' + JSON.stringify(joinInfo));
  return joinInfo;
}
