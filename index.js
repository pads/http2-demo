const spdy = require('spdy');
const fs = require('fs');
const path = require('path');

const PORT = 8443;

const JS_BUNDLES = [
  'main.bundle.js',
  'vendor.bundle.js'
]

const config = {
  key: fs.readFileSync(path.join(__dirname, 'ssl', 'localhost-privkey.pem')),
  cert: fs.readFileSync(path.join(__dirname, 'ssl', 'localhost-cert.pem')),
  protocols: ['h2', 'http/1.1']
};

const push = (response, file) => {
  const stream = response.push(file.path, {
    request: {
      accept: '*/*'
    },
    response: {
      'content-type': 'application/javascript'
    }
  });
  stream.on('error', (error) => console.log(error));
  stream.end(file.contents);
};

const getFile = (filename) => {
  const filePath = path.join(__dirname, 'public', filename);
  return {
    name: filename,
    contents: fs.readFileSync(filePath),
    path: filePath
  }
};

const requestHandler = (request, response) => {
  const filename = request.url === '/' ? 'index.html' : request.url;
  const file = getFile(filename);

  if (filename === 'index.html' && response.push) {
    let output = file.contents;

    JS_BUNDLES.forEach((bundle) => {
      const bundleFile = getFile(bundle);
      push(response, bundleFile);
      output += `<script src="${bundleFile.path}"></script>`;
    });

    response.end(output);
  } else {
    response.writeHead(200);
    response.end(file.contents);
  }
};

const server = spdy.createServer(config, requestHandler);

server.on('error', (error) => console.error(error));
server.on('socketError', (error) => console.error(error));

server.listen(PORT, (error) => {
  if (error) {
    console.log(error);
    return -1;
  }
  console.log(`server listening on ${PORT}`);
});
