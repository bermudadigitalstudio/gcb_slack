const IncomingWebhook = require('@slack/client').IncomingWebhook;
const SLACK_WEBHOOK_URL = 

const webhook = new IncomingWebhook(SLACK_WEBHOOK_URL);


// subscribe is the main function called by Cloud Functions.
module.exports.subscribe = (event, callback) => {
 const build = eventToBuild(event.data.data);


// Skip if the current status is not in the status list.
// Add additional statues to list if you'd like:
// QUEUED, WORKING, SUCCESS, FAILURE,
// INTERNAL_ERROR, TIMEOUT, CANCELLED
  const status = ['WORKING', 'SUCCESS', 'FAILURE', 'INTERNAL_ERROR', 'TIMEOUT', 'CANCELLED'];
  if (status.indexOf(build.status) === -1) {
    return callback();
  }


// Send message to Slack.
  const message = createSlackMessage(build);
  webhook.send(message, (err, res) => {
    if (err) console.log('Error:', err);
    callback(err);
  });
};


// eventToBuild transforms pubsub event message to a build object.
const eventToBuild = (data) => {
  return JSON.parse(new Buffer(data, 'base64').toString());
}

function statusToColor(status) {
  switch (status) {
    case 'SUCCESS':
      return 'good'
    case 'FAILURE':
    case 'INTERNAL_ERROR':
    case 'TIMEOUT':
    case 'CANCELLED':
      return 'danger'
    case 'WORKING':
      return '#2956B2'
    default:
      return 'danger'
  }
}

// createSlackMessage create a message from a build object.
const createSlackMessage = (build) => {
  let message = {
    attachments: [
      {
	color: statusToColor(build.status),
	title: `${build.status} on ${build.source.repoSource.repoName}: ${build.source.repoSource.tagName || build.source.repoSource.branchName || build.source.repoSource.commitSha}`,
        title_link: build.logUrl,
      }
    ],
  };
  return message
}
