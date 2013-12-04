function Class( object ) {
	object.startDate = new Date( object.startDate );
	object.endDate = new Date( object.endDate );

	return object;
}

function load() {
	//gapi.client.setApiKey( 'KEY' );
	// Initialize authorization
	gapi.auth.init( function() {
		// When you click the button...
		document.getElementById('button').onclick = buttonClick;
	} );
}

function buttonClick( event ) {
	// Execute our page-side script
	chrome.tabs.executeScript( { file: "foreground.js" } );
	gapi.client.setApiKey(config.api_key);
	authorize();
}

function authorize() {
	gapi.auth.authorize( config, function (token) {
		if( !token ) {
			config.immediate = false;
			authorize();
			config.immediate = true;
		} else {
			// Get the current tab
			chrome.tabs.query( { active: true, currentWindow: true }, function(tabs ) {
				chrome.tabs.sendMessage( tabs[0].id, "classes", messageResponse );
			} );
		}
	} );
}

function messageResponse( response ) {
	var classes = JSON.parse( response );

	for( var ii = 0; ii < classes.length; ++ii )
		classes[ ii ] = new Class( classes[ ii ] );

	gapi.client.load( 'calendar', 'v3', function() {
		gapi.client.calendar.calendarList.list().execute( function (response) {
			var calendars = response.items.filter( function (item) {
				return item.accessRole == "owner" ||
					   item.accessRole == "writer";
			} );

			console.log( calendars );
            populatePopup(calendars);
		});
	} );
}

function populatePopup( calendars ) {
    console.log('calendars', calendars);
    var html = '<ul class="calendar-list">',
        i = 0;
    calendars.forEach( function ( calendar ) {
        html += '<li>';
        html += '<div class="color" style="background-color:' 
            + calendar.backgroundColor  + ';"></div>';
        html += '<button id="' + i + '">Use Calendar</button>';
        html += '<h3>' + calendar.summary + '</h3>';
        if( calendar.description )
            html += '<p>' + calendar.description + '</p>';
        html += '</li>';
    });
    html += '</ul>';
    console.log(html);
    document.querySelector('#content').innerHTML = html;
}

function addItems( calendar, classes ) {

}
