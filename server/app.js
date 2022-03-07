let express = require('express');
let createError = require('http-errors');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');

let app = express()
let expressWs = require('express-ws')(app);

let indexRouter = require('./routes/index');
let imageRouter = require('./routes/image');
// setup es
// const { Client } = require('@elastic/elasticsearch')
//
// const client = new Client({
//   node: "https://admin:MEG19@LKeng80@log.osinfra.cn:9200",
//   auth: {
//     username: "admin",
//     password: "MEG19@LKeng80",
//   },
//   ssl: {
//     rejectUnauthorized: false,
//   },
// })
//
// client.info().then(console.log, console.error)

// client.search({
//   index: 'logstash-2022.03.05',
//   body: {
//     query: {
//       match: {
//         "kubernetes.pod_name": "omni-worker-1234"
//       },
//     },
//     _source: ["log"],
//     //sort: { "@timestamp": { order: "desc" } },
//     size: 10000,
//   }
// }, (err, result) => {
//   if (err) {
//     console.log(err)
//   } else {
//     //console.log(result.body.hits.hits)
//     //console.log(result.body)
//     for (var i=0;i<result.body.hits.hits.length;i++)
//     {
//       console.log(i+":"+result.body.hits.hits[i]._source.log)
//     }
//   }
// })

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/images', imageRouter)

// cors
const cors = require('cors');
app.use(cors())
//app.options('*', cors())
// app.use(cors({
//   origin:['http://localhost:8080'],
//   methods:['GET','POST'],
// }));

app.all('*',function (req, res, next) {
  res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.header('Access-Control-Allow-Headers', 'Content-Type');
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS');
  next();
});

//catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
