import('amazon-chime-sdk-js');
import config from './cdk-outputs.json';

//******** change this to point to the correct Api Gateway URL **************************
// const apiUrl =
//   'https://3fk7amewr9.execute-api.us-east-1.amazonaws.com/Prod/meetingInfo';
//******** change this to point to the correct Api Gateway URL **************************

var meetingSession;
const apiUrl = config.BackEnd.apiUrl;
console.log('apiUrl: ' + apiUrl);
//*******************************************************************************
// Function:  getMeetingInfo(meetingId)
// Returns: Meeting and Attendee Info
// If meeting exists, returns existing meeting info,
// else starts new meeting and returns that info
// Always creates a new Attendee (limit 250)
//*******************************************************************************
async function getMeetingInfo(meetingId) {
  const options = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  };
  const url = apiUrl + '?m=' + meetingId;
  const response = await fetch(url, options);
  return await response.json();
}

// Note: Pressing the Join button multiple times will create multiple attendees

window.joinMeeting = async function joinMeeting() {
  const data = await getMeetingInfo('testMeeting'); // Fetch the meeting and attendee data
  console.log('Success getting meeting info ', data);

  const meeting = data.Meeting;
  const attendee = data.Attendee;

  document.getElementById('meetingId').value = meeting.MeetingId;
  document.getElementById('attendeeId').value = attendee.AttendeeId;
  document.getElementById('externalMeetingId').value =
    meeting.ExternalMeetingId;

  const logger = new ChimeSDK.ConsoleLogger('MyLogger');
  const deviceController = new ChimeSDK.DefaultDeviceController(logger);
  console.log('deviceController', deviceController);

  const configuration = new ChimeSDK.MeetingSessionConfiguration(
    meeting,
    attendee,
  );
  console.log('configuration ', configuration);

  meetingSession = new ChimeSDK.DefaultMeetingSession(
    configuration,
    logger,
    deviceController,
  );
  console.log('meetingSession ', meetingSession);

  const presentAttendeeId = meetingSession.configuration.credentials.attendeeId;
  console.log('presentAttendeeId - ', presentAttendeeId);

  const browserBehaviour = new ChimeSDK.DefaultBrowserBehavior();
  console.log('supportSetSinkId is ', browserBehaviour.supportsSetSinkId());

  try {
    const audioInputs = await meetingSession.audioVideo.listAudioInputDevices();
    var audioOutputDevices = null;
    try {
      audioOutputDevices =
        await meetingSession.audioVideo.listAudioOutputDevices();
    } catch (e) {
      console.log('Failed to listAudioOutputDevices ', e);
    }
    console.log('audio inputs ', audioInputs);
    const videoInputs = await meetingSession.audioVideo.listVideoInputDevices();
    console.log('video inputs ', videoInputs);
    const list = document.getElementById('video-input');
    for (let i = 0; i < videoInputs.length; i++) {
      const option = document.createElement('option');
      list.appendChild(option);
      option.text = videoInputs[i].label || `Audio-in ${i + 1}`;
      option.value = videoInputs[i].deviceId;
    }
    list.addEventListener('change', async () => {
      console.log('video input device is changed');
      try {
        await meetingSession.audioVideo.chooseVideoInputDevice(list.value);
      } catch (e) {
        console.log('error changing video input to ', list.value);
      }
    });
    if (!list.firstElementChild) {
      const option = document.createElement('option');
      option.text = 'Device selection unavailable';
      list.appendChild(option);
    }

    if (audioInputs[0] && audioInputs[0].deviceId != '') {
      await meetingSession.audioVideo.chooseAudioInputDevice(
        audioInputs[0].deviceId,
      );
    } else if (audioInputs[0] && audioInputs[0].groupId != '') {
      await meetingSession.audioVideo.chooseAudioInputDevice(
        audioInputs[0].groupId,
      );
    } else {
      await meetingSession.audioVideo.chooseAudioInputDevice(null);
      console.log('empty set for chooseAudioInputDevice');
    }

    if (videoInputs[0] && videoInputs[0].deviceId != '') {
      await meetingSession.audioVideo.chooseVideoInputQuality(
        '960',
        '540',
        '15',
        '1400',
      ); // 540p 15fps
      await meetingSession.audioVideo.chooseVideoInputDevice(
        videoInputs[0].deviceId,
      ); // Selecting the first camera device for simplicity
      const qualitySetting =
        await meetingSession.audioVideo.getVideoInputQualitySettings();
      console.log('video quality publishing is ', qualitySetting);
    } else {
      await meetingSession.audioVideo.chooseVideoInputDevice(null);
      console.log('empty set for chooseVideoInputDevice');
    }
  } catch (err) {
    // handle error - unable to acquire video or audio device perhaps due to permissions blocking or chromium bug on retrieving device label
    // see setupDeviceLabelTrigger() on https://github.com/aws/amazon-chime-sdk-js/blob/main/demos/browser/app/meetingV2/meetingV2.ts
    console.log('Try Catch Error - unable to acquire device - ', err);
  }

  const audioOutputElement = document.getElementById('audio');
  try {
    await meetingSession.audioVideo.bindAudioElement(audioOutputElement);
  } catch (e) {
    console.log('Failed to bindAudioElement ', e);
  }

  const videoElementSelf = document.getElementById('video-tile-self');
  const remoteVideoTile = document.getElementById('remote-video');

  const observer = {
    audioVideoDidStart: () => {
      logger.debug('Started');
    },

    videoTileDidUpdate: (tileState) => {
      if (!tileState.boundAttendeeId) {
        return;
      }
      if (tileState.localTile) {
        meetingSession.audioVideo.bindVideoElement(
          tileState.tileId,
          videoElementSelf,
        );
      } else {
        if (!document.getElementById(tileState.tileId)) {
          const node = document.createElement('video');
          node.id = tileState.tileId;
          node.style.width = '100%';
          node.style.height = '100%';
          remoteVideoTile.appendChild(node);
        }
        const videoElementNew = document.getElementById(tileState.tileId);
        meetingSession.audioVideo.bindVideoElement(
          tileState.tileId,
          videoElementNew,
        );
      }
    },
    videoTileWasRemoved: (tileId) => {
      const videoElementRemoved = document.getElementById(tileId);
      videoElementRemoved.remove();
    },
  };

  const buttonMute = document.getElementById('mic-muted');
  buttonMute.checked = false;
  buttonMute.addEventListener('change', function () {
    if (buttonMute.checked) {
      meetingSession.audioVideo.realtimeMuteLocalAudio();
      console.log('mic is muted');
    } else {
      meetingSession.audioVideo.realtimeUnmuteLocalAudio();
      console.log('mic is unmuted');
    }
  });

  meetingSession.audioVideo.addObserver(observer);
  meetingSession.audioVideo.startLocalVideoTile();
  meetingSession.audioVideo.start();
};
