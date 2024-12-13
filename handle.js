const universalClicker = require('./click');

function handleNavigate(request, sendResponse) {
	console.log("Received navigate action with URL:", request.URL);
	const { URL } = request;
	if (URL) {
		navigateToURL(URL);
		sendResponse({ status: "success", message: `Navigating to ${URL}` });
	} else {
		sendResponse({ status: "error", message: "URL not provided" });
	}
}

function handleSimulateTyping(request, sendResponse) {
	const { userSelector, userText, passSelector, passText } = request;

	inputCredentials(userSelector, userText, passSelector, passText)
		.then(() => sendResponse({ status: "success" }))
		.catch((error) => {
			console.error("Typing simulation failed", error);
			sendResponse({ status: "Failed", error: error.message });
		});
}

function handleClickButton(request) {
	universalClicker(request)
		.then(() => console.log('handleClickButton Success'))
		.catch((error) => {
			console.error('handleClickButton Success', error);
		});
}

function handleFindVal(request, sendResponse) {
	console.log("Received findVal action with options:", request);

	universalFindText(request)
		.then((value) => sendResponse({ status: "success", value }))
		.catch((error) => {
			console.error(`FindVal: Error finding value for ${request.slug}`, error);
			sendResponse({ status: "error", message: error.message });
		});
}

module.exports = {
	handleNavigate,
	handleSimulateTyping,
	handleClickButton,
	handleFindVal
};