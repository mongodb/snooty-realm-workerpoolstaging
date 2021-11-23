
exports = async function(payload, response) {
  // verify slack auth
  var slackAuth = context.functions.execute("validateSlackAPICall", payload);
  if (!slackAuth || slackAuth.status !== 'success') {
    return slackAuth;
  }
  
  console.log('----- BEGIN JOB FROM SLACK ------');
  
  // https://api.slack.com/interactivity/handling#payloads
  var parsed = JSON.parse(payload.query.payload);
  var stateValues = parsed.view.state.values; 
  

  // get repo options for this user from slack and send over
  var entitlement = await context.functions.execute("getUserEntitlements", {
    'query': {
      'user_id': parsed.user.id
    }
  });
  if (!entitlement || entitlement.status !== 'success') {
    return 'ERROR: you are not entitled to deploy any docs repos';
  }
  
  console.log('user deploying job', JSON.stringify(entitlement));
  
  // mapping of block id -> input id
  var values = {};
  var inputMapping = {
    'block_repo_option': 'repo_option',
    'block_hash_option': 'hash_option',
  };
  
  // get key and values to figure out what user wants to deploy
  for (var blockKey in inputMapping) {
    var blockInputKey = inputMapping[blockKey];
    var stateValuesObj = stateValues[blockKey][blockInputKey];
    // selected value from dropdown
    if (stateValuesObj && stateValuesObj.selected_option && stateValuesObj.selected_option.value) {
      values[blockInputKey] = stateValuesObj.selected_option.value;
    } 
    // multi select is an array
    else if (stateValuesObj && stateValuesObj.selected_options && stateValuesObj.selected_options.length > 0) {
      values[blockInputKey] = stateValuesObj.selected_options;
    }
    // input value
    else if (stateValuesObj && stateValuesObj.value) {
      values[blockInputKey] = stateValuesObj.value;
    } 
    // no input
    else {
      values[blockInputKey] = null;
    }
  }

  let coll_name = context.values.get("coll_name");
  const collection_mappings = context.values.get("stage_collection_mapping");
  if (parsed.user.id in collection_mappings) {
      coll_name = collection_mappings[parsed.user.id];
  }
  console.log(coll_name)

  for (repo in values.repo_option) {
    // // e.g. mongodb/docs-realm/master => (site/repo/branch)
    const buildDetails = values.repo_option[i].value.split('/')
    const repoOwner = buildDetails[0]
    const repoName = buildDetails[1]
    const branchName = buildDetails[2]
    const hashOption =  values.hash_option ? values.hash_option : null
    const jobTitle     = 'Slack deploy: ' + entitlement.github_username;
    const jobUserName  = entitlement.github_username;
    const jobUserEmail = entitlement.email ? entitlement.email : 'split@example.com';
    
    console.log(` ${repoName} ${branchName}`);
    
    const branchObject = await context.functions.execute("getBranchAlias", repoName, branchName)
    console.log(` ${JSON.stringify(branchObject)}`);

    const publishOriginalBranchName = branchObject.aliasObject.publishOriginalBranchName
    const aliases = branchObject.aliasObject.urlAliases
    const urlSlug = branchObject.aliasObject.urlSlug ? branchObject.aliasObject.urlSlug : branchObject.aliasObject.gitBranchName;
    const gitBranchName = branchObject.aliasObject.gitBranchName;
    const prefix = branchObject.prefix;
    const project = branchObject.project;
    console.log(` ${publishOriginalBranchName} ${aliases}`);
    console.log(` ${branchObject.aliasObject.publishOriginalBranchName} ${branchObject.aliasObject.urlAliasesliases}`);

    // This is for non aliased repos
    if (aliases === null) {
      const newPayload = context.functions.execute("createNewPayload", "productionDeploy", repoOwner, repoName, branchName, prefix, project, hashOption, false, urlSlug, true)
      context.functions.execute("addJobToQueue", newPayload, jobTitle, jobUserName, jobUserEmail, coll_name);  
    }
    else {
      if (publishOriginalBranchName == true & gitBranchName != urlSlug) {
          aliases = aliases.push(gitBranchName) // now all of the branches we need to build are in the aliases array
      }
      // build urlSlug with global flag
      const globalIndexPayload = context.functions.execute("createNewPayload", "productionDeploy", repoOwner, repoName, branchName, prefix, project, hashOption, true, urlSlug, true);
      context.functions.execute("addJobToQueue", globalIndexPayload, jobTitle, jobUserName, jobUserEmail, coll_name);
      // pop urlSlug out of aliases array
      const remainingAliases = aliases.splice(aliases.indexOf(urlSlug));
      for (var alias of remainingAliases) {
        const newPayload = context.functions.execute("createNewPayload", "productionDeploy", repoOwner, repoName, branchName, prefix, project, hashOption, true, alias, false)
        context.functions.execute("addJobToQueue", newPayload, jobTitle, jobUserName, jobUserEmail, coll_name);
      }
    }
  }
  //respond to modal
  response.setHeader("Content-Type", "application/json");
  response.setStatusCode(200);
    
};
