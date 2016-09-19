# youtube-to-slack
Node.JS script sending slack message when selected youtube channel/user upload new video

## Features
- Detect if a youtube channel uploaded a new video
- Send notification to a Slack webhook if a whatched channel upload a new video
- Can watch multiple youtube user/channel

## Installation
- Simply clone this depot anywhere on your server.
- Copy [config.json.exemple](https://github.com/BernardJeremy/youtube-to-slack/blob/master/config.json.example) file into a `config.json` file.
- Perform `npm install` command.
- Install a [incoming-webhooks](https://api.slack.com/incoming-webhooks) on your Slack.
- Add your link of the Slack incoming-webhooks in the `config.json` file.
- Add your wanted reference in the `config.json` file.
- Optional (but recommended) : Install a task scheduler (like `CRON`) to run the script regularly.

## Configuration
- `youtubeBaseLink` : Link to the base Youtube page (You shouldn't have to change this).
- `chaineID`.`user` : Name of the watched user (`ZeratoRSC2` in `https://www.youtube.com/user/ZeratoRSC2`). Could be a single string or an array of string, to watch multiple user.
- `chaineID`.`channel` : Name of the watched user (`UCCMxHHciWRBBouzk-PGzmtQ` in `https://www.youtube.com/channel/UCCMxHHciWRBBouzk-PGzmtQ`). Could be a single string or an array of string, to watch multiple channel.
- `slackHookUrl` :  Link to your Slack incoming-webhooks.
- `slackHookName` :  Name to display when you will get notified on Slack.
