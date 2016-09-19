const fs = require('fs');

const request = require('request');
const Slack = require('slack-node');
const cheerio = require('cheerio')

// Retrieve config
let youtubeBaseLink = require('./config.json').youtubeBaseLink;
let channelID = require('./config.json').chaineID;
let slackUrl = require('./config.json').slackHookUrl;
let slackName = require('./config.json').slackHookName;

// Return if parameter is an array
function isArray(a) {
    return (!!a) && (a.constructor === Array);
};

// return filename for a given channelID
function getSaveFilename(targetChannel) {
  return 'last_video_' + targetChannel + '.json'
}

// Perform update of the last video ID file
function updateSavedData(targetChannel, lastRecordedId) {
  let newData = {};
  newData.lastRecordedId = lastRecordedId;
  if (fs.existsSync(getSaveFilename(targetChannel))) {
    fs.unlinkSync(getSaveFilename(targetChannel));
  }
  fs.writeFileSync(getSaveFilename(targetChannel), JSON.stringify(newData));
}

// Send the slack message to the config's webhook
function sendSlackMessage(targetChannel, displayedName, videoElement) {
  let title = videoElement.find(".yt-uix-tile-link").text();
  let duration = videoElement.find(".video-time").text();
  let link = youtubeBaseLink + videoElement.find(".yt-uix-tile-link").attr('href');

  let text = '*' + displayedName + '*' + ' released a new video : ';
  text += title + ' (' + duration + ')' + '\n';
  text += '<' + link + '>';

  let msgParameters = {
    username: slackName,
    icon_emoji: 'https://www.youtube.com/yt/brand/media/image/YouTube-icon-full_color.png',
    text: text,
  };
  
  let slack = new Slack();
  slack.setWebhook(slackUrl);
  slack.webhook(msgParameters, function (err, response) {
    if (response.statusCode != 200) {
      console.log(err, response);
    }
  });
}

// Check if the given user/channel has new video.
function performOnlineCheck(prefix, targetChannel, suffix) {
  request(youtubeBaseLink + prefix + targetChannel + suffix, function (err, resp, html) {
    if (err) return console.error(err);

    let $ = cheerio.load(html);
    let displayedName = $(".branded-page-header-title-link").text();

    let retrievedId = [];
    let retrievedVideo = {};
    $("div[data-context-item-id]").each(function (i, row) {
      retrievedId.push($(this).data('context-item-id'))
      retrievedVideo[$(this).data('context-item-id')] = $(this);
    });

    let savedData = {};
    if (fs.existsSync(getSaveFilename(targetChannel))) {
      savedData = JSON.parse(fs.readFileSync(getSaveFilename(targetChannel), 'utf8'))
    } else {
      return updateSavedData(targetChannel, retrievedId[0]); // first time, set last recorded ID to last video ID
    }

    let retrievedIdLength = retrievedId.length;
    let lastRecordedIdIndex = 0; // by default, the last recorded id is the 'most recent' video
    for (let i = retrievedIdLength - 1; i >= 0; --i) {
        if (retrievedId[i] == savedData.lastRecordedId) {
          lastRecordedIdIndex = i;
          console.log("LAST RECORDED:", retrievedId[i]);
        } else if (i < lastRecordedIdIndex) {
          console.log("NEW ID:", retrievedId[i]);
          sendSlackMessage(targetChannel, displayedName, retrievedVideo[retrievedId[i]]);
        }
    }

    if (savedData.lastRecordedId != retrievedId[0]) { // If more recent video detected
      updateSavedData(targetChannel, retrievedId[0])
    }
  });
}

// If channelID.user is an array, iterate over it.
if (isArray(channelID.user)) {
  channelID.user.forEach(function(username){
    performOnlineCheck('/user/',  username, '/videos');
  });
} else {
  performOnlineCheck('/user/', channelID.user, '/videos');
}

// If channelID.channel is an array, iterate over it.
if (isArray(channelID.channel)) {
  channelID.channel.forEach(function(id){
    performOnlineCheck('/channel/', id, '/videos');
  });
} else {
  performOnlineCheck('/channel/', channelID.channel, '/videos');
}
