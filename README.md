# action-release-upload-archive

Uploads __files__ to your realase assets

## Example

Follow example starts to run when a release is created. It uploads all json files from current folder to the release assets
```yaml
on:
  release:
    types: [created]

jobs:
  upload_asset:
    runs-on: ubuntu-latest
    name: Upload asset example
    steps:
      - uses: actions/checkout@v2
      - name: upload files to release
        uses: ./
        with:
          token: ${{secrets.GITHUB_TOKEN}}
          path: "./*.json"

```

And with multiline path
```yaml
on:
  release:
    types: [created]

jobs:
  upload_asset:
    runs-on: ubuntu-latest
    name: Upload asset example
    steps:
      - uses: actions/checkout@v2
      - name: upload files to release
        uses: ./
        with:
          token: ${{secrets.GITHUB_TOKEN}}
          path: |
            ./*.json
            ./*.js

```
All files under all subdirs
```yaml
on:
  release:
    types: [created]

jobs:
  upload_asset:
    runs-on: ubuntu-latest
    name: Upload asset example
    steps:
      - uses: actions/checkout@v2
      - name: upload files to release
        uses: ./
        with:
          token: ${{secrets.GITHUB_TOKEN}}
          path: "**/*.json"

```

> Note: The name of an asset is derived from its file's base name (meaning just the name of the file excluding its folder part). Since release assets should have unique name make sure your path option does not yeild more than one file with the same name.
To overcome this issue, you may want to zip all asset files and then upload the zip file as a single asset


### Inputs
__token__ - Action expect an api token. This can be a self generated token or the token each workflow holds when starting a build.

__path__ - A single or multiple (line) string that holds name of files or glob (in this example we use glob)



# Building 
To build this project use `Makefile` 

`make build` or `make rebuild`

The running artifact dist/index.js. To generate this file you need to use ncc

Build process create the dist/index.js that is used in runtime
To make the project single file use:
`ncc build index.js --license licenses.txt`

To install ncc use:
`sudo npm install -g @vercel/ncc`


