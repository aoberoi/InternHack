var opentok = require('opentok');
var OPENTOK_API_KEY = '2466921';
var OPENTOK_API_SECRET = '7a9c44bd9bfe8b8b67f6c446b9e96b392489e5b1';
var ot = new opentok.OpenTokSDK(OPENTOK_API_KEY,OPENTOK_API_SECRET);
ot.setEnvironment("staging.tokbox.com");


function Tables() {
}

Tables.prototype = new process.EventEmitter();

Tables.prototype.setupTable = function(id, tableInfo) {
  //this[id] = {};
  this[id].table = tableInfo;
  this.emit('table added', {id: id, data: this[id] });
}

Tables.prototype.removeTable = function(id) {
  delete this['id'];
  this.emit('table removed', {id: id });
}

var tables = new Tables();
var users = new Object();

var io = require('socket.io').listen(8000);

io.sockets.on('connection', function (socket) {
  //io.sockets.emit('this', { will: 'be received by everyone'});

  socket.on('login', function (data) {
    users[data.id] = {
      firstName : data.firstName,
      lastName : data.lastName
    };
    socket.set('id', data.id);
    console.log(users);
  });
  
  socket.on('job seeker', function() {
    // say you are interested in table changes and table queue changes
    //console.log('job seeker arrived:' + data);
    socket.get('id', function(err, id) {
      users[id].type = 0;
    })
    tables.on('table added', function(data) {
      // var returnData = data;
      // returnData.tableId = 
      socket.emit('new table', data);
      console.log('sending job seeker new table');
    });
    tables.on('table removed', function(data) {
      socket.emit('destroy table', data);
    });
  });
  
  socket.on('comp rep', function() {
    socket.get('id', function(err, id) {
      users[id].type = 1;
      tables[id] = {};
      socket.join(id);
      console.log('starting new table '+id);
      console.log(tables[id]);
      ot.createSession('localhost', {}, function(session) {
        tables[id].otSession = session["sessionId"];
        users[id].otToken = ot.generateToken({
          'connection_data': "userid_" + new Date().getTime(),
          'role': "moderator"
        });
        socket.emit('session data', {session: tables[id].otSession, token: users[id].otToken});
        socket.emit('table info', {});
      });
    });
  });
  
  socket.on('table setup', function(tableInfo) {
    socket.get('id', function(err, id) {
      // TODO: error checking
      tables.setupTable(id, tableInfo);
    })
  });

  socket.on('disconnect', function() {
    socket.get('id', function(err, id) {
      if (err) { console.log(err); return;}
      if (users[id].type == 1) { tables.removeTable(id); }
      delete users[id];
      //console.log(users);
    });
  });
  
  socket.on('candidate arrived', function(data) {
    console.log('candidate connecting to table '+data.table);
  	sessionId = tables[data.table].otSession;
	  users[data.candidateId].otToken = ot.generateToken({
	    'connection_data': "userid_" + new Date().getTime(),
      'role': "moderator"
    });
    socket.join(data.table);
	  socket.emit('session data', {session: sessionId, token: users[data.candidateId].otToken});
	  io.sockets.in(data.table).emit('candidate info', {id : data.candidateId});
  });
});
    
