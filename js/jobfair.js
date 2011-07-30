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