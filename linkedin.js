function onLinkedInLoad() {
     IN.Event.on(IN, "auth", onLinkedInAuth);
}

function onLinkedInAuth() {
	console.log("authorized");
}