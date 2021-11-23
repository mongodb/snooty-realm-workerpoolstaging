// This function is the webhook's request handler.
exports = async function(payload, response) {
    console.log(Object.keys(payload.query))
    // Data can be extracted from the request as follows:

    // Query params, e.g. '?arg1=hello&arg2=world' => {arg1: "hello", arg2: "world"}
    const {arg1, arg2} = payload.query;

    // Headers, e.g. {"Content-Type": ["application/json"]}
    const contentTypes = payload.headers["Content-Type"];

    // Raw request body (if the client sent one).
    // This is a binary object that can be accessed as a string using .text()
    // const {email, name} = await JSON.parse(await payload.body.text());
    
    console.log("arg1, arg2: ", arg1, arg2);
    console.log("Content-Type:", JSON.stringify(contentTypes));
    // console.log("this is the email: ", email, "this is the name ", name)
    
      try {
        let jobTitle     = "DevHub CMS Staging Build";
        let jobUserName  = "Jordan";
        let jobUserEmail = "jordan.stapinski@mongodb.com";
        const newPayload = {
          jobType:    "githubPush",
          source:     "strapi", 
          action:     "push", 
          repoName:   "devhub-content-integration", 
          branchName: "strapi",
          isFork:     true, 
          private:    true,
          isXlarge:   true,
          repoOwner:  "jestapinski",
          url:        "https://github.com/jestapinski/devhub-content-integration.git",
          newHead:    null,
        }; 
    
    console.log(JSON.stringify(newPayload));
    let coll_name = context.values.get("coll_name");
    const collection_mappings = context.values.get("stage_collection_mapping");
    if (jobUserName in collection_mappings) {
      coll_name = collection_mappings[jobUserName];
    }
    console.log(coll_name);
    context.functions.execute("addJobToQueue", newPayload, jobTitle, jobUserName, jobUserEmail, coll_name);  
  } catch(err) {
    console.log(err);
  }


    return  "Hello World!";
};