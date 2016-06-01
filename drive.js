var express = require('express');
var app = express();
var cookieParser = require('cookie-parser');

var fs = require('fs');
var google = require('googleapis');
var googleAuth = require('google-auth-library');

app.use(express.static(__dirname));

app.listen(8080, function() {
	console.log('Server up on port 8080.');
});

app.use(function(req, res, next) {
  console.log(req.method, req.url);
  next();
});

app.get('/', function(req, res) {
	res.sendfile(__dirname + '/index.html');
});

app.use(cookieParser());

var credentials = JSON.parse(fs.readFileSync('client_secret.json'));
var clientSecret = credentials.web.client_secret;
var clientId = credentials.web.client_id;
var redirectUrl = credentials.web.redirect_uris[0];
var auth = new googleAuth();

var SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/drive.appdata',
  'https://www.googleapis.com/auth/drive.appfolder',
];
// var SCOPES = ['https://www.googleapis.com/auth/drive.appdata'];

app.get('/data.json', function(req, res) {

  return res.sendFile(__dirname + '/example-data.json');

  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);

  var token = req.cookies.token;

  if(token) {
    oauth2Client.credentials = JSON.parse(token);
    listFiles(oauth2Client, res);
  } else {
    var authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: SCOPES
    });
    res.json({url: authUrl});
  }

});

app.get('/oauth2callback', function(req, res) {
  var error = req.query.error;
  var code = req.query.code;

  var oauth2Client = new auth.OAuth2(clientId, clientSecret, redirectUrl);
  if(!error) {
    oauth2Client.getToken(code, function(err, token) {
      oauth2Client.credentials = token;
      var tokenJson = JSON.stringify(token);
      res.cookie('token', tokenJson, { httpOnly: true });
      res.redirect('/');
    });
  }
});

var drive = google.drive('v3');
function listFiles(auth, res) {
  drive.files.list({
    auth: auth,
    spaces: 'appDataFolder',
    pageSize: 10,
    fields: "nextPageToken, files(id, name)"
  }, function(err, response) {
    if (err) {
      console.log('The API returned an error: ' + err);
      return;
    }
    var fileId = response.files[0].id;

    var stream = drive.files.get({
      auth: auth,
      fileId: fileId,
      alt: 'media'
    });

    // stream.pipe(fs.createWriteStream('data.json'));
    stream.pipe(res);

    // streamToString(stream, callback);
    //
    // function streamToString(stream, callback) {
    //   var chunks = [];
    //   stream.on('data', function(chunk) {
    //     chunks.push(chunk);
    //   });
    //   stream.on('end', function() {
    //     var string = chunks.join('');
    //     callback(null, string);
    //   });
    // }

  });
}
