//config.js

checkToken();

var NEW_BUTTON = 1;
var SAVE_BUTTON = 0;

var crawlerSelect = document.getElementById("crawler-select");

//data model
var crawlers = [];
var selectedCrawler = {
	name: null,
	detail: null
};

//textBoxes
var crawlerName = document.getElementById("crawler-name");
var urlPattern = document.getElementById("url-pattern");
var titleSelector = document.getElementById("title-selector");
var commentSelector = document.getElementById("comment-selector");
var imageSelector = document.getElementById("image-selector");

//buttons
var newSaveButton = document.getElementById("new-save-button");
var deleteButton = document.getElementById("delete-button");

//initialize button
newSaveButton.style.transition = "all 0.5s";
setButton(newSaveButton, SAVE_BUTTON, false);
deleteButton.addEventListener("touchend",function(){
	deleteCrawler();
},false);

var textBoxes = [crawlerName, urlPattern, titleSelector, commentSelector, imageSelector];
for (var i = 0; i < textBoxes.length; i++) {
	var textBox = textBoxes[i];
	textBox.addEventListener("input",function(){
		var crawlerNameModified = checkIfCrawlerNameModified();
		if(crawlerNameModified){
			setButton(newSaveButton, NEW_BUTTON, true);
		}else{
			var crawlerDetailModified = checkIfCrawlerDetailModified();
			if(crawlerDetailModified){
				setButton(newSaveButton, SAVE_BUTTON, true);
			}else{
				setButton(newSaveButton, SAVE_BUTTON, false);
			}
		}
	},false);
}

crawlerSelect.addEventListener("change",function(){
	displayCrawlerConfig();
},false);

getCrawlers(function(response){
	//later: get all crawlers OR get only name list and get one crawler by one selection.
	crawlers = response;
	while(crawlerSelect.hasChildNodes()){
		crawlerSelect.removeChild(crawlerSelect.firstChild);
	}
	for (var i = 0; i < response.length; i++) {
		var option = document.createElement("option");
		option.value = response[i].crawler_name;
		option.innerText = response[i].crawler_name;
		crawlerSelect.appendChild(option);
	}
	displayCrawlerConfig();
});

function setButton(button, mode, enabled){
	if(mode == NEW_BUTTON){
		button.innerText = "新建";
		button.addEventListener("touchend",function(){
			addCrawler();
		},false);
	}else if(mode == SAVE_BUTTON){
		button.innerText = "保存";
		button.addEventListener("touchend",function(){
			saveCrawler();
		},false);
	}
	if(enabled){
		button.removeAttribute("disabled");
	}else{
		button.setAttribute("disabled","disabled");
	}
}

function displayCrawlerConfig(){
	var i = crawlerSelect.selectedIndex;
	var crawler = crawlers[i];
	
	crawlerName.value = crawler.crawler_name;
	urlPattern.value = crawler.url_pattern;
	titleSelector.value = crawler.title_selector;
	commentSelector.value = crawler.comment_selector;
	imageSelector.value = crawler.image_selector;

	setSelectedCrawler(crawler);
}

function setSelectedCrawler(crawler){
	delete crawler.appkey;
	selectedCrawler = {
		name: crawler.crawler_name,
		detail: crawler
	};
	selectedCrawler = JSON.parse(JSON.stringify(selectedCrawler));
	delete selectedCrawler.detail.crawler_name;
}

function checkIfCrawlerNameModified(){
	var currentCrawlerName = crawlerName.value;
	var originalCrawlerName = selectedCrawler.name;
	return currentCrawlerName != originalCrawlerName;
}

function checkIfCrawlerDetailModified(){
	var currentCrawlerDetail = getCurrentCrawlerDetail();
	var selectedCrawlerDetail = selectedCrawler.detail;
	for (var key in currentCrawlerDetail) {
		if (currentCrawlerDetail[key] != selectedCrawlerDetail[key]) {
			return true;
		}
	}
	return false;
}

function getCurrentCrawlerDetail(){
	var userInput = {};
	userInput.url_pattern = urlPattern.value;
	userInput.title_selector = titleSelector.value;
	userInput.comment_selector = commentSelector.value;
	userInput.image_selector = imageSelector.value;
	return userInput;
}

function addCrawler(){
	
}

function saveCrawler(){
	
}

function deleteCrawler(){
	
}