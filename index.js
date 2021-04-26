const core = require('@actions/core');
const github = require('@actions/github');

const path = require('path');
const fs = require('fs');
const glob = require('glob')

async function run() {
  try {
    const octokit = github.getOctokit(github.token);
    let parts = github.ref.split('/')
    let tagName = parts[parts.length - 1]

    //see https://octokit.github.io/rest.js/v18#repos-get-release-by-tag
    const { upload_url } = octokit.rest.repos.getReleaseByTag({
      owner: github.repository_owner,
      repo: github.repository.substring(github.repository_owner.length),
      tagName,
    });

    console.log(`Asset upload url ${upload_url}`)

    // Get the inputs from the workflow file: https://github.com/actions/toolkit/tree/master/packages/core#inputsoutputs
    const assetPathsSt = core.getInput('paths', { required: true });

    const assetPaths = JSON.parse(assetPathsSt)
    if (!assetPaths || assetPaths.length == 0) {
      core.setFailed("asset_paths must contain a JSON array of quoted paths");
      return
    }

    let assetsToUpload = []
    for (let i = 0; i < assetPaths.length; i++) {
      let assetPath = assetPaths[i];
      if (assetPath.indexOf("*") > -1) {
        const files = glob.sync(assetPath, { nodir: true })
        for (const file of files) {
          assetsToUpload.push(file)
        }
      } else {
        assetsToUpload.push(assetPath) //change this to match case that the name of the asset is a dir
      }
    }

    core.debug(`Asset to upload: ${assetsToUpload}`)

    for (let i = 0; i < assetsToUpload.length; i++) {
      let asset = assetsToUpload[i];

      const contentLength = filePath => fs.statSync(filePath).size; // Calc content-length for header to upload asset

      const headers = {
        'content-type': "binary/octet-stream",
        'content-length': contentLength(asset)
      };

      const assetName = path.basename(asset)
      console.log(`Uploading ${assetName}...`)

      // Octokit Documentation: https://octokit.github.io/rest.js/#octokit-routes-repos-upload-release-asset
      const uploadAssetResponse = await octokit.repos.uploadReleaseAsset({
        url: uploadUrl,
        headers,
        name: assetName,
        data: fs.readFileSync(asset)
      });
      console.log(`Upload result: ${JSON.stringify(uploadAssetResponse, " ", 2)}`)
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

run().then(res=>{
  console.log('Assets uploaded')
},rej=>{
  core.setFailed(rej);
})