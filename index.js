const core = require('@actions/core');
const github = require('@actions/github');

const path = require('path');
const fs = require('fs');
const glob = require('glob');


function uploadAsset(apiToken, owner, repo, releaseID, asset) {
  return new Promise((resolve, reject) => {
    const octokit = github.getOctokit(apiToken);
    const contentLength = filePath => fs.statSync(filePath).size; // Calc content-length for header to upload asset

    const headers = {
      'content-type': "binary/octet-stream",
      'content-length': contentLength(asset)
    };

    const assetName = path.basename(asset)

    console.log(`Uploading ${asset} ...`)

    octokit.repos.uploadReleaseAsset({
      owner: owner,
      repo: repo,
      release_id: releaseID,
      headers,
      name: assetName,
      data: fs.readFileSync(asset)
    }).then(uploadAssetResponse => {
      if (uploadAssetResponse.status < 400) {
        resolve(uploadAssetResponse)
      } else {
        reject(new Error(`Failed to upload resource with status code ${uploadAssetResponse.status}`))
      }
    }, err => {
      reject(err)
    });
  })
}

async function run() {
  try {
    const apiToken = core.getInput('token', { required: true }) || ''
    const inRepo = github.context.payload.repository.full_name
    const ownerSplitter = inRepo.indexOf('/')
    const owner = inRepo.substring(0, ownerSplitter)
    const repo = inRepo.substring(ownerSplitter + 1)
    const releaseID = github.context.payload.release.id

    const assetPathsSt = core.getInput('path', { required: true }) || '';

    const assetPaths = assetPathsSt.split('\n')
    if (!assetPaths || assetPaths.length == 0) {
      throw new Error("asset_paths must contain a JSON array of quoted paths");
    }
    console.log(`Search for files unders: ${assetPaths}`)
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

    if (Array.isArray(assetsToUpload) && assetsToUpload.length<1){
      console.log('No file to upload')
    }else{
      console.log(`Uploading ${assetsToUpload.length} files`) 
    }
    
    let f = function () {
      let uploads = []
      for (let i = 0; i < assetsToUpload.length; i++) {
        let asset = assetsToUpload[i];
        uploads.push(uploadAsset(apiToken, owner, repo, releaseID, asset))
      }
      return Promise.all(uploads)
    }
    await f()

  } catch (error) {
    console.log(error)
    throw error
  }
}

run().then(res => {
  console.log('Assets uploaded')
}, rej => {
  console.log('Failed to upload ', rej)
  core.setFailed(rej);
})
