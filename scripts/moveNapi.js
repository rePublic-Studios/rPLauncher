const fs = require('fs');

if (!fs.existsSync('../public/native')) fs.mkdirSync('../public/native');

fs.renameSync('./napi.node', `../public/native/napi.node`);
// fs.renameSync('./index.d.ts', `../public/native/${os.platform()}/index.d.ts`);
