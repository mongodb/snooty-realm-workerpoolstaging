/*
  See https://developer.github.com/v3/activity/events/types/#webhook-payload-example for
  examples of payloads.

  Try running in the console below.
*/
  
exports = function(payload) {
  console.log("HI ALLISON webhook_ARM is firing");
  console.log(JSON.stringify(payload));
  try {
    let jobTitle     = "Github Push: " + payload.repository.full_name;
    let jobUserName  = payload.pusher.name;
    let jobUserEmail = payload.pusher.email;
    const newPayload = {
      jobType:    "githubPush",
      source:     "github", 
      action:     "push", 
      repoName:   payload.repository.name, 
      branchName: payload.ref.split("/")[2],
      isFork:     payload.repository.fork, 
      private:    payload.repository.private,
      isXlarge:   true,
      repoOwner:  payload.repository.owner.login,
      url:        payload.repository.clone_url,
      newHead:    payload.after,
    }; 
    
    
    context.functions.execute("addJobToQueue_ARM", newPayload, jobTitle, jobUserName, jobUserEmail);  
  } catch(err) {
    console.log(err);
  }
  
};