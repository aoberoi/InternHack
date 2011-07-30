var JOBFAIR = (function (IN) { 
  var jf = {}; 
  //privateVariable = 1; 
     
  //function privateMethod() { 
  // ... 
  //} 
     
  //jf.moduleProperty = 1;
	
	var userStates = {
		LOBBY : 0,
		CHATTING : 1,
		IN_QUEUE : 2
	};
	
	var userTypes = {
		JOB_SEEKER : 0,
		COMPANY_REP : 1
	};
	
	var me = {
		type : null,
		linkedInId : null,
		state: null
	}

  /*
   *  Layout Initializations
   */
   
  function initUserChoice() {
 	  $('.lobby_button').click(function() {
 	    console.log('user choice made');
 	    // TODO: verify its one of known user types
 	    me.type = $(this).data('userType');
 	    // TODO: use dispatched events and event listeners
 	    jf.onUserSelected();
 	  })
 	}
 	
 	function initTableList() {
 	  // populate with real data
 	  
 	  // attach all event handlers
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
		loadLayout('user_choice', initUserChoice);
	};
	
	jf.onUserSelected = function() {
	  loadLayout('table_list', initTableList);
	}
     
  return jf; 
}(IN));

// var JOBFAIR.opentok = (function (IN, TB) { 
//   var ot = {};
//   
//   var apiKey = 2466921; // OpenTok sample API key. Replace with your own API key.
//   var sessionId = null; // Replace with your session ID.
//   var token = null; // Should not be hard-coded.
//                  // Add to the page using the OpenTok server-side libraries.
//   var session;
//   var publisher;
//   var subscribers = {};
//   
//   
//   ot.init = function() {
//     // Un-comment either of the following to set automatic logging and exception handling.
//     // See the exceptionHandler() method below.
//     TB.setLogLevel(TB.DEBUG);
//     TB.addEventListener("exception", exceptionHandler);
// 
//     if (TB.checkSystemRequirements() != TB.HAS_REQUIREMENTS) {
//      alert("You don't have the minimum requirements to run this application."
//          + "Please upgrade to the latest version of Flash.");
//     } else {
//      session = TB.initSession(sessionId);  // Initialize session
// 
//      // Add event listeners to the session
//      session.addEventListener('sessionConnected', sessionConnectedHandler);
//      session.addEventListener('sessionDisconnected', sessionDisconnectedHandler);
//      session.addEventListener('connectionCreated', connectionCreatedHandler);
//      session.addEventListener('connectionDestroyed', connectionDestroyedHandler);
//      session.addEventListener('streamCreated', streamCreatedHandler);
//      session.addEventListener('streamDestroyed', streamDestroyedHandler);
//     }
//   }
// 
//   //--------------------------------------
//   //  LINK CLICK HANDLERS
//   //--------------------------------------
// 
//   /*
//   If testing the app from the desktop, be sure to check the Flash Player Global Security setting
//   to allow the page from communicating with SWF content loaded from the web. For more information,
//   see http://www.tokbox.com/opentok/build/tutorials/helloworld.html#localTest
//   */
//   function connect() {
//    session.connect(apiKey, token);
//   }
// 
//   function disconnect() {
//    session.disconnect();
//   }
// 
//   // Called when user wants to start publishing to the session
//   function startPublishing() {
//    if (!publisher) {
//      var parentDiv = document.getElementById("myCamera");
//      var publisherDiv = document.createElement('div'); // Create a div for the publisher to replace
//      publisherDiv.setAttribute('id', 'opentok_publisher');
//      parentDiv.appendChild(publisherDiv);
//      publisher = session.publish(publisherDiv.id); // Pass the replacement div id to the publish method
//    }
//   }
// 
//   function stopPublishing() {
//    if (publisher) {
//      session.unpublish(publisher);
//    }
//    publisher = null;
//   }
// 
//   //--------------------------------------
//   //  OPENTOK EVENT HANDLERS
//   //--------------------------------------
// 
//   function sessionConnectedHandler(event) {
//    // Subscribe to all streams currently in the Session
//    for (var i = 0; i < event.streams.length; i++) {
//      addStream(event.streams[i]);
//    }
//   }
// 
//   function streamCreatedHandler(event) {
//    // Subscribe to the newly created streams
//    for (var i = 0; i < event.streams.length; i++) {
//      addStream(event.streams[i]);
//    }
//   }
// 
//   function streamDestroyedHandler(event) {
//    // This signals that a stream was destroyed. Any Subscribers will automatically be removed.
//    // This default behaviour can be prevented using event.preventDefault()
//   }
// 
//   function sessionDisconnectedHandler(event) {
//    // This signals that the user was disconnected from the Session. Any subscribers and publishers
//    // will automatically be removed. This default behaviour can be prevented using event.preventDefault()
//    publisher = null;
//   }
// 
//   function connectionDestroyedHandler(event) {
//    // This signals that connections were destroyed
//   }
// 
//   function connectionCreatedHandler(event) {
//    // This signals new connections have been created.
//   }
// 
//   /*
//   If you un-comment the call to TB.addEventListener("exception", exceptionHandler) above, OpenTok calls the
//   exceptionHandler() method when exception events occur. You can modify this method to further process exception events.
//   If you un-comment the call to TB.setLogLevel(), above, OpenTok automatically displays exception event messages.
//   */
//   function exceptionHandler(event) {
//    alert("Exception: " + event.code + "::" + event.message);
//   }
// 
//   //--------------------------------------
//   //  HELPER METHODS
//   //--------------------------------------
// 
//   function addStream(stream) {
//    // Check if this is the stream that I am publishing, and if so do not publish.
//    if (stream.connection.connectionId == session.connection.connectionId) {
//      return;
//    }
//    var subscriberDiv = document.createElement('div'); // Create a div for the subscriber to replace
//    subscriberDiv.setAttribute('id', stream.streamId); // Give the replacement div the id of the stream as its id.
//    document.getElementById("subscribers").appendChild(subscriberDiv);
//    subscribers[stream.streamId] = session.subscribe(stream, subscriberDiv.id);
//   }
//   
//   return ot;
// }(IN, TB));