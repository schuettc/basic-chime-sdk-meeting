import('amazon-chime-sdk-js');
import config from './cdk-outputs.json';
var meetingSession;
const apiUrl = config.BackEnd.apiUrl;
console.log('apiUrl: ' + apiUrl);

var br = document.createElement('br');

window.createForm = function createForm() {
  initialize();

  var status = document.createElement('div');
  status.setAttribute('id', 'status');
  var statusText = document.createTextNode('Status information...');
  status.appendChild(statusText);

  var form = document.createElement('form');

  var dialNumber = document.createElement('input');
  dialNumber.setAttribute('type', 'text');
  dialNumber.setAttribute('name', 'Number to Dial');
  dialNumber.setAttribute('placeholder', 'Number to Dial');

  var audioInput = document.createElement('select');
  audioInput.setAttribute('id', 'audio-input');

  var audioOutput = document.createElement('select');
  audioOutput.setAttribute('id', 'audio-output');

  var makeCallButton = document.createElement('input');
  makeCallButton.setAttribute('type', 'button');
  makeCallButton.setAttribute('id', 'makeCallButton');
  makeCallButton.setAttribute('value', 'Call');
  makeCallButton.setAttribute('onclick', 'makeCall();');

  var endCallButton = document.createElement('input');
  endCallButton.setAttribute('type', 'button');
  endCallButton.setAttribute('id', 'endCallButton');
  endCallButton.setAttribute('value', 'End');
  endCallButton.setAttribute('onclick', 'endCall();');

  form.appendChild(dialNumber);
  form.appendChild(makeCallButton);
  form.appendChild(endCallButton);
  form.appendChild(br.cloneNode());
  form.appendChild(audioInput);
  form.appendChild(audioOutput);
  form.appendChild(status);

  document.getElementsByTagName('body')[0].appendChild(form);
};

function updateMicrophoneList(micList) {
  console.log(micList);
  const listElement = document.getElementById('audio-input');
  listElement.innerHTML = '';
  micList.forEach((microphone) => {
    const micOption = document.createElement('option');
    micOption.label = microphone.label;
    micOption.value = microphone.deviceId;
    listElement.add(micOption);
  });
}

function updateSpeakerList(speakerList) {
  console.log(speakerList);
  const listElement = document.getElementById('audio-output');
  listElement.innerHTML = '';
  speakerList.forEach((speaker) => {
    const speakerOption = document.createElement('option');
    speakerOption.label = speaker.label;
    speakerOption.value = speaker.deviceId;
    listElement.add(speakerOption);
  });
}

// Fetch an array of devices of a certain type
async function getConnectedDevices(type) {
  const devices = await navigator.mediaDevices.enumerateDevices();
  console.log('all devices: ' + JSON.stringify(devices));
  return devices.filter((device) => device.kind === type);
}

async function initialize() {
  // getUserMedia in order to get permissions
  console.log('getting user media');
  await navigator.mediaDevices.getUserMedia({ video: false, audio: true });

  // Get the initial set of mics and speakers connected
  const microphones = await getConnectedDevices('audioinput');
  console.log('mic list: ' + JSON.stringify(microphones));
  updateMicrophoneList(microphones);

  const speakers = await getConnectedDevices('audiooutput');
  console.log('speaker list: ' + JSON.stringify(speakers));
  updateSpeakerList(speakers);
}

window.makeCall = async function makeCall() {
  document.getElementById('status').innerText = 'button pressed...';

  const fromNumberOptions = document.getElementById('fromNumber');
  const fromNumber =
    fromNumberOptions.options[fromNumberOptions.selectedIndex].value;
  const toNumber = '+1' + document.getElementById('toNumber').value;
  request = {
    fromNumber,
    toNumber,
  };

  var meeting;
  var attendee;

  try {
    const response = await fetch(`${BASE_API_URL}/clicktocall`, {
      method: 'POST',
      body: JSON.stringify(request),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    const json = await response.json();
    meeting = json.Meeting;
    attendee = json.Attendees[0];
  } catch (error) {
    document.getElementById('status').innerText = 'API failure...';
    return;
  }

  const logger = new ChimeSDK.ConsoleLogger(
    'ChimeMeetingLogs',
    ChimeSDK.LogLevel.INFO,
  );
  const deviceController = new ChimeSDK.DefaultDeviceController(logger);
  const configuration = new ChimeSDK.MeetingSessionConfiguration(
    meeting,
    attendee,
  );
  meetingSession = new ChimeSDK.DefaultMeetingSession(
    configuration,
    logger,
    deviceController,
  );

  try {
    // const audioInputs = await meetingSession.audioVideo.listAudioInputDevices();
    // await meetingSession.audioVideo.chooseAudioInputDevice(audioInputs[0].deviceId);
    const audioInput = document.getElementById('audio-input').value;
    console.log('mic selected: ' + audioInput);
    await meetingSession.audioVideo.chooseAudioInputDevice(audioInput);
    const audioOutput = document.getElementById('audio-output').value;
    console.log('speaker selected:' + audioOutput);
    await meetingSession.audioVideo.chooseAudioOutputDevice(audioOutput);
  } catch (err) {
    // handle error - unable to acquire audio device perhaps due to permissions blocking
  }

  const audioOutputElement = document.getElementById('audio-element');
  meetingSession.audioVideo.bindAudioElement(audioOutputElement);

  meetingSession.audioVideo.start();

  document.getElementById('makeCallButton').style.visibility = 'hidden';
  document.getElementById('endCallButton').style.visibility = 'visible';
};

window.endCall = async function endCall() {
  meetingSession.audioVideo.stop();
  document.getElementById('endCallButton').style.visibility = 'hidden';
  document.getElementById('makeCallButton').style.visibility = 'visible';
};
