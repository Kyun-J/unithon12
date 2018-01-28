const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const util = require('./route/util');
const bodyParser = require('body-parser');
const request = require('request');
const mysql = require('mysql');
const session = require('express-session');
const  MySQLStore = require('express-mysql-session')(session);

app.use(bodyParser.urlencoded({
  extended: false
}))
app.use(bodyParser.json())

app.use(session({
  // key: 'sid',
  secret: 'sdafdsav',
  resave: false,
  saveUninitialized: true,
  store:  new  MySQLStore({
    host: 'localhost',
       user: 'root',
    password: 'unithon',
    database: 'unithon',
    checkExpirationInterval: 600 * 1000 //1분
  }),
  cookie: {
    maxAge: 600 * 1000
  } //1분
}))

http.listen(8010,function() {
  util.log("서버 시작")
})

const db = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'unithon',
  database: 'unithon'
})

const issession = function(req, res, next) {
  if (req.session.auth) return next()
  else res.sendStatus(400)
}

//-------------------web_naver--------------------------------------
var path = require('path');
var ejs = require('ejs');
var key = require('./key.json');
var express = require('express');
app.use(express.static(path.join(__dirname, '/public')));

app.set('view engine', 'ejs');
app.set('views', 'views');

var client_id = key.client_id;
var client_secret = key.client_secret;
var state = key.state;
var baseUrl = key.baseUrl;
var redirectURI = encodeURI(baseUrl + "/web_callback");
var api_url = "";

app.get('/naverlogin', function (req, res) {
   api_url = 'https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=' + client_id + '&redirect_uri=' + redirectURI + '&state=' + state;
   res.render('naverlogin', {api_url : api_url});
 });

 app.get('/web_callback', function (req, res, next) {
    code = req.query.code;
    state = req.query.state;
    api_url = 'https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id='
     + client_id + '&client_secret=' + client_secret + '&redirect_uri=' + redirectURI + '&code=' + code + '&state=' + state;
    var options = {
        url: api_url,
        headers: {'X-Naver-Client-Id':client_id, 'X-Naver-Client-Secret': client_secret}
     };
    request.get(options, function (error, response, body) {
      if (!error && response.statusCode == 200) {
        var json = JSON.parse(body);
        var token = json.access_token;
        var header = "Bearer " + token; // Bearer 다음에 공백 추가
        var api_url = 'https://openapi.naver.com/v1/nid/me';
        var request = require('request');
        var options = {
            url: api_url,
            headers: {'Authorization': header}
         };
        request.get(options, function (error, response, body) {
          if (!error && response.statusCode == 200) {
            json = JSON.parse(body);
            var email = json.response.email;
            req.session.auth = email;
            req.session.save(function(){
      				res.redirect('/list');
      			});
          } else {
            console.log('error');
            if(response != null) {
              res.status(response.statusCode).end();
              console.log('error = ' + response.statusCode);
            }
          }
        });
      } else {
        res.status(400);
      }
    });
  });

  app.get('/list', issession, function(req, res){
    var email = req.session.auth;
    db.getConnection(function(err, connection) {
          if (!err) {
            connection.query('select id, title, content from script where email = ?', [email], function(err,rows) {
              if(!err) {
                for(let i = 0; i < rows.length; i++){
                  rows[i].content = rows[i].content.substr(0, 30);
                };
                connection.release();
                res.render('web_list', {result : rows});
              } else {
                connection.release();
                res.redirect('/naverlogin');
              }
          });
        }
    });
  });

  app.get('/list/:id', issession, function(req, res){
    var id = req.params.id;
    var email = req.session.auth;
      db.getConnection(function(err, connection) {
        if (!err) {
          connection.query('select title, content from script where id = ? && email = ?', [id, email], function(err,rows) {
            if(!err && rows.length > 0) {
              console.log('here3');
              connection.release();
              res.render('content', {result : rows});
            } else {
              connection.release();
              res.status(400);
            }
        });
      } else {
          res.status(400);
      }
  });
});
// 
// io.on('connection', function(socket){
//
//     socket.on('join', function(email){
//       console.log(socket.id + '가 ' + email + '에 입장!');
//       socket.join(email); //room 입장
//     });
//
//     socket.on('disconnect', function(){
//       console.log('user disconnected: ', socket.id);
//     });
//
//     socket.on('voice', function(email, voice){
//       var voice2 = voice;
//       io.to(email).emit('voice', voice2);
//     });
//   });

app.all('*', function(req, res) {
  res.sendStatus(404)
})
