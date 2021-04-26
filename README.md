# action-release-upload-archive



# Compiling
We ncc to make the project independent from node_modules.

To make the project single file use:
`ncc build index.js --license licenses.txt`

A folder named `dist` is created holding two files: 
- `index.js` - compressed version of the project
- `licenses.txt` - Extract the liceses of all node_modules

To install ncc use:
`sudo npm install -g @vercel/ncc`


