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
		if(xhr.readyState == 4 && xhr.status == 200){
			callback(xhr.responseText);
		}
	};
	xhr.open("POST",url,async);
	xhr.send(dataObject);
	if(async == false){
		return xhr.responseText;
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
		if(response == true && window.location == "/login"){
			window.location = "/upload";
		}else if(response == false && window.location == "/upload"){
			window.location = "/login";
		}
	});
}