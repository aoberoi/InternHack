var JOBFAIR = (function (IN) { 
  var jf = {}; 
  //privateVariable = 1; 
     
  //function privateMethod() { 
  // ... 
  //} 
     
  //jf.moduleProperty = 1;
	
	jf.userStates = {
		LOBBY : 0,
		CHATTING : 1,
		IN_QUEUE : 2
	};
	
	jf.userTypes = {
		JOB_SEEKER : 0,
		COMPANY_REP : 1
	};
	
	jf.me = {
		type : null,
		linkedInId : null,
		state : null,
		tableId : null
	}

  /*
   *  Layout Initializations
   */
   
  function initUserChoice() {
 	  $('.lobby_button').click(function() {
 	    console.log('user choice made');
 	    // TODO: verify its one of known user types
 	    jf.me.type = $(this).data('user-type');
 	    // TODO: use dispatched events and event listeners
 	    jf.onUserSelected();
 	  })
 	}
 	
 	function initTableList() {
 	  // populate with real data
 	  
 	  // attach all event handlers
 	}
 	
 	function initChat() {
 	  jf.opentok.init(jf.me.type, jf.me.tableId);
 	  console.log('chat initialization');
	  if (jf.me.type == jf.userTypes.JOB_SEEKER) {
	  	//jf.sockets.candidateAtTable(jf.me.linkedInId, )
	  }
 	}
 	
 	/*
 	 * Helpers
 	 */
	
	function loadLayout(layoutName, callback) {		
		$('#shell').load('layout/'+layoutName+'.php', function() {
		  console.log(layoutName + ' layout loaded');
		  callback();
		});
	}
	
	/*
 	 * Handlers (Public)
 	 */
	
  jf.onLinkedInLoad = function() { 
      IN.Event.on(IN, "auth", jf.onLinkedInAuth);
  };

	jf.onLinkedInAuth = function() {
	  IN.API.Profile("me").fields('id', 'firstName', 'lastName').result(function(profiles) {
	    jf.sockets.login(profiles.values[0]);
	    jf.me.linkedInId = profiles.values[0].id;
	  })
		loadLayout('user_choice', initUserChoice);
	};
	
	jf.onUserSelected = function() {
	  switch(jf.me.type) {
	    case jf.userTypes.JOB_SEEKER:
	      jf.me.state = jf.userStates.LOBBY;
    	  loadLayout('table_list', initTableList);
	      break;
	    case jf.userTypes.COMPANY_REP:
	      IN.API.Profile("me").fields('positions:(company:(id,name))').result(function(results1) {
	        console.log(results1);
	        // company name, description, positions offered => tableInfo
	        // query for company description
	        IN.API.Raw('/companies/'+results1.values[0].positions.values[0].company.id+':(description)').result(function(results2) {
	          console.log(results2);
	          // query for positions
	          IN.API.Raw('/job-search:(jobs:(id,position:(id,title),job-poster:(id)))?company-name='+encodeURIComponent(results1.values[0].positions.values[0].company.name)+'&job-title=Test').result(function(results3) {
	            console.log(results3);
	            // filter by this poster id and company id
	            var f_positions = [];
	            //var i=0, len=myArray.length; i<len; ++i
	            for (var i=0, len=results3.jobs.values.length; i<len; ++i) {
	              if (results3.jobs.values[i].jobPoster.id == jf.me.linkedInId) {
	                f_positions.push({ id : results3.jobs.values[i].id, title : results3.jobs.values[i].position.title, companyId : results1.values[0].positions.values[0].company.id });
	              } else {
	                console.log('job poster: '+results3.jobs.values[i].jobPoster.id + ' my id: '+ jf.me.linkedInId + ' job: ' + results3.jobs.values[i]);
	              }
	            }
              tableInfo = {
                            name :        results1.values[0].positions.values[0].company.name,
                            companyId :   results1.values[0].positions.values[0].company.id,
                            description : results2.description,
                            positions :   f_positions
                          };
              jf.sockets.tableSetup(tableInfo);
	          });
	        });
	      });
	      jf.me.state = jf.userStates.CHATTING;
    	  loadLayout('chat', initChat);
	      break;
	  }
	  jf.sockets.selectType(jf.me.type);
	}
     
  return jf; 
}(IN));

JOBFAIR.sockets = (function (io) {
  var sckts = {};
  
  var socket = io.connect('http://internhack.opentok.com:8000');
  
  sckts.login = function(member) {
    socket.emit('login', {
      id : member.id,
      firstName : member.firstName,
      lastName : member.lastName
    });
  };
  
  sckts.selectType = function(userType) {
    //console.log('selecting type: '+userType);
    switch(userType) {
      case JOBFAIR.userTypes.JOB_SEEKER :
        socket.emit('job seeker');
        //console.log('job seeker emitted');
        break;
      case JOBFAIR.userTypes.COMPANY_REP :
        socket.emit('comp rep');
        //console.log('comp rep emitted');
        break;
    }
    
    sckts.tableSetup = function (tableInfo) {
      socket.emit('table setup', tableInfo);
    }
  }
  
  socket.on('new table', function(data) {
    console.log(data);
	// If person is a representative
	if(JOBFAIR.me.type == 1) {
		var company_profile = '<div class="company" id="'+data.table.companyId+'">';
		company_profile += '<div class="company_profile_name">'+data.table.name+'</div>';
		company_profile += '<div class="company_profile_description">'+data.table.description+'</div>';
		company_profile += '<div class="company_profile_positions_label">Seeking:</div>';
		company_profile += '<div class="company_profile_positions">';
		for (x = 0; x < data.table.position.length; x++) {
			company_profile += data.table.positions[x].title +", ";
		}
		company_profile += '</div>';
		company_profile += '<div class="company_queue_container"><div class="company_queue_normal_state">In Queue<div class="company_queue_number">0</div></div></div></div>';
		
		$("#list_container").append(company_profile);
	
	}
  });
  
  socket.on('session data', function(data) {
  	JOBFAIR.opentok.init(data.session, data.token);
  })
  
  return sckts;
}(io));

JOBFAIR.opentok = (function (TB) { 
  var ot = {};
   
  var apiKey = 2466921; // OpenTok sample API key. Replace with your own API key.
  var sessionId = null; // Replace with your session ID.
  var token = null; // Should not be hard-coded.
                 // Add to the page using the OpenTok server-side libraries.
  var session;
  var publisher;
  var subscribers = {};
  
  
  ot.init = function(p_sessionId, p_token) {
    // Un-comment either of the following to set automatic logging and exception handling.
    // See the exceptionHandler() method below.
    TB.setLogLevel(TB.DEBUG);
    TB.addEventListener("exception", exceptionHandler);

    if (TB.checkSystemRequirements() != TB.HAS_REQUIREMENTS) {
		alert("You don't have the minimum requirements to run this application." +
		"Please upgrade to the latest version of Flash.");
	}
	else {
		sessionId = p_sessionId;
		token = p_token;
		
		session = TB.initSession(sessionId); // Initialize session
		// Add event listeners to the session
		session.addEventListener('sessionConnected', sessionConnectedHandler);
		session.addEventListener('sessionDisconnected', sessionDisconnectedHandler);
		session.addEventListener('connectionCreated', connectionCreatedHandler);
		session.addEventListener('connectionDestroyed', connectionDestroyedHandler);
		session.addEventListener('streamCreated', streamCreatedHandler);
		session.addEventListener('streamDestroyed', streamDestroyedHandler);
		
		connect();
	}
  }

//   //--------------------------------------
//   //  LINK CLICK HANDLERS
//   //--------------------------------------
// 
//   /*
//   If testing the app from the desktop, be sure to check the Flash Player Global Security setting
//   to allow the page from communicating with SWF content loaded from the web. For more information,
//   see http://www.tokbox.com/opentok/build/tutorials/helloworld.html#localTest
//   */
   function connect() {
    session.connect(apiKey, token);
   }
// 
   function disconnect() {
    session.disconnect();
   }
// 
//   // Called when user wants to start publishing to the session
   function startPublishing() {
    if (!publisher) {
      var parentDiv = document.getElementById("my_video_container");
      var publisherDiv = document.createElement('div'); // Create a div for the publisher to replace
      publisherDiv.setAttribute('id', 'opentok_publisher');
      parentDiv.appendChild(publisherDiv);
	  var publisherProps = {
			width: 320,
			height: 240,
			publishAudio: true
		};
      publisher = session.publish(publisherDiv.id, publisherProps); // Pass the replacement div id to the publish method
    }
   }
// 
   function stopPublishing() {
    if (publisher) {
      session.unpublish(publisher);
    }
    publisher = null;
   }
// 
//   //--------------------------------------
//   //  OPENTOK EVENT HANDLERS
//   //--------------------------------------
// 
   function sessionConnectedHandler(event) {
    // Subscribe to all streams currently in the Session
    for (var i = 0; i < event.streams.length; i++) {
      addStream(event.streams[i]);
    }
	startPublishing();
   }
// 
   function streamCreatedHandler(event) {
    // Subscribe to the newly created streams
    for (var i = 0; i < event.streams.length; i++) {
      addStream(event.streams[i]);
    }
   }
 
   function streamDestroyedHandler(event) {
    // This signals that a stream was destroyed. Any Subscribers will automatically be removed.
    // This default behaviour can be prevented using event.preventDefault()
   }
 
   function sessionDisconnectedHandler(event) {
    // This signals that the user was disconnected from the Session. Any subscribers and publishers
    // will automatically be removed. This default behaviour can be prevented using event.preventDefault()
    publisher = null;
   }
 
   function connectionDestroyedHandler(event) {
    // This signals that connections were destroyed
   }
 
   function connectionCreatedHandler(event) {
    // This signals new connections have been created.
   }
 
   /*
   If you un-comment the call to TB.addEventListener("exception", exceptionHandler) above, OpenTok calls the
   exceptionHandler() method when exception events occur. You can modify this method to further process exception events.
   If you un-comment the call to TB.setLogLevel(), above, OpenTok automatically displays exception event messages.
   */
   function exceptionHandler(event) {
    alert("Exception: " + event.code + "::" + event.message);
   }
 
   //--------------------------------------
   //  HELPER METHODS
   //--------------------------------------
 
   function addStream(stream) {
    // Check if this is the stream that I am publishing, and if so do not publish.
    if (stream.connection.connectionId == session.connection.connectionId) {
      return;
    }
    var subscriberDiv = document.createElement('div'); // Create a div for the subscriber to replace
    subscriberDiv.setAttribute('id', stream.streamId); // Give the replacement div the id of the stream as its id.
    document.getElementById("other_video_container").appendChild(subscriberDiv);
	var subscriberProps = {
			width: 320,
			height: 240,
			publishAudio: true
		};
    subscribers[stream.streamId] = session.subscribe(stream, subscriberDiv.id, subscriberProps);
   }
   
   return ot;
}(TB));
