function ajaxGET(url,params,callback){
	var xhr = new XMLHttpRequest();
	url += "?";
	for(var param in params){
		var key = param;
		var value = params[key];
		url += key + "=" + value + "&"; 
	}
	url = url.slice(0,url.length - 1);
	xhr.onreadystatechange = function(){
		if(xhr.readyState == 4 && xhr.status == 200){
			callback(xhr.responseText);
		}
	};
	xhr.open("GET",url,true);
	xhr.send();

	// return xhr.responseText;
}

function ajaxPOST(url,async,dataObject,callback){
	var xhr = new XMLHttpRequest();
	dataObject = JSON.stringify(dataObject);
	xhr.onreadystatechange = function(){
		var response = {};
		if(xhr.readyState == 4 && xhr.status == 200){
			response = JSON.parse(xhr.responseText);
			callback(response);
		}
	};
	xhr.open("POST",url,async);
	xhr.send(dataObject);
	if(async == false){
		return response;
	}
}

function connect(url,message,messageCallback,closeCallback){
	var webSocket = new WebSocket(url);
	webSocket.onopen = function(){
		webSocket.send(message);
	};
	webSocket.onmessage = function(event){
		messageCallback(event.data);
	};
	webSocket.onclose = function(){
		closeCallback();
	};
}

function checkToken(){
	var url = "/server/auth/token";
	var params = {
		action: "checkToken"
	};
	ajaxPOST(url,true,params,function(response){
		if(response.status == 0){ //success
			document.getElementById("navbar-text").innerText = "欢迎" + window.sessionStorage.getItem("appkey");
			if(window.location.hash == "#/login" || window.location.hash == ""){
				window.location = "#/upload";
			}
		}else if(response.status == 1){
			console.log(window.location.hash);
			document.getElementById("navbar-text").innerText = "WdUploader";
			window.sessionStorage.removeItem("appkey");
			if(window.location.hash == "#/upload" || window.location.hash == "#/config"){
				window.location = "#/login";
			}
		}
	});
}

function getCrawlers(callback){
	var url = "/server/crawler";
	var params = {action: "get"};
	ajaxPOST(url,true,params,function(response){
		callback(response)
	});
}

function navbarMessage(message, timeout){
	// var 
}