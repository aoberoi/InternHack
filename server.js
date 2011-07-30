function Tables() {
  // company
  // description
  // positions
  // queue
  // url
}

Tables.prototype = new process.EventEmitter();

Tables.prototype.addTable = function(id, details) {
  this[id] = details;
  this.emit('table added', {id: id, details: details});
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
      lastName : data.lastName,
      headline : data.headline,
      pictureUrl : data.pictureUrl
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
    })
    console.log('comp rep arrived: '+data);
    socket.get('id', function(err, id) {
      tables.addTable(id);
      console.log('addTable called');
    });
  });

  socket.on('disconnect', function() {
    socket.get('id', function(err, id) {
      if (err) { console.log(err); return;}
      if (users[id].type == 1) { tables.removeTable(id); }
      delete users[id];
      //console.log(users);
    });
  });
});
    
