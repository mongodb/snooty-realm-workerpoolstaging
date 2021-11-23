exports = function(jobType, repoOwner, repoName, branchName, prefix, project, newHead, aliased=false, urlSlug, useInGlobalSearch=false){
    try {
      const newPayload = {
        jobType,
        source:     "github", 
        action:     "push", 
        repoName, 
        branchName,
        prefix,
        project,
        aliased,
        urlSlug,
        isFork:     true, 
        private:    ( repoOwner === '10gen') ? true : false,
        isXlarge:   true,
        repoOwner,
        url:        'https://github.com/' + repoOwner + '/' + repoName,
        newHead, 
        useInGlobalSearch,
      }; 
      console.log("in create new payload ", JSON.stringify(newPayload))
      return newPayload
    } catch(err) {
      console.log(err);
    }
    
};