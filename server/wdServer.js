var http = require("http");
var https = require("https");
var url = require("url");
var WdDatabase = require("./wdDatabase");

function WdServer(){};

var WD_API_HOST = "api.vdian.com";

WdServer.handle = function(request,callback){
	var path = url.parse(request.url,true).pathname;
	path = path.slice(1);
	path = path.split("/");
	request.on("data",function(chunk){
		var params = JSON.parse(chunk);
		switch(path[1]){
			case "upload": {
				switch(path[2]){
					case "image":{
						WdServer.uploadImage(params,function(response){

						});
					}
					case "product":{
						WdServer.uploadProduct(params,function(response){

						});
					}
				}
			}
			case "auth": {
				switch(path[2]){
					case "login":{
						WdServer.handleLogin(params,function(response){
							callback(response);
						});
						break;
					}
					case "token":{
						if(params.action == "getToken"){
							WdServer.token.get(params,function(response){
								callback(response);
							});
						}else if(params.action == "checkToken"){
							WdServer.token.check(function(response){
								callback(response);
							});
						}
						break;
					}
					case "session":{
						WdServer.handleSession(params,function(response){
							callback(response);
						});
						break;
					}
				}
			}
			case "database": {
				WdDatabase.query(params,function(results){
					callback(results);
				});
				break;
			}
			case "crawler": {

			}
		}
	});
	
}

WdServer.handleLogin = function(params,callback){
	switch(params.action){
		case "login": {
			WdServer.token.get(params,function(response){
				callback(response);
			});
			break;
		}
		case "logout":{

		}
	}
};

WdServer.token = {
	get: function(params,callback){
		var options = {
			host: WD_API_HOST,
			path: "/token?grant_type=client_credential&appkey=" + params.appkey + "&secret=" + params.secret,
			method: "GET"
		};
		var request = https.request(options,function(response){
			response.on("data",function(data){
				data = JSON.parse(data);
				if(data.status.status_code == 0){
					// save the access_token in here. save only the appkey in to database as the identifier for the users uploaded images list.
					WdServer.token.saved = data.result.access_token;
					var result = {status: 0, message: "Access token received."};
					callback(result); // dont to stringify here, only when before response.write, that a stringify is needed.
					var findParams = {
						table: "user",
						action : "select",
						condition : "appkey=" + params.appkey
					};
					var insertParams = {
						table: "user",
						action: "insert",
						data: {
							appkey: params.appkey
						}
					};
					WdDatabase.query(findParams,function(r1){
						if(!r1){
							WdDatabase.query(insertParams,function(r2){
								console.log("(from database) adding appkey: " + r2);
							});
						}
					});
				}
			});
		});
		request.end();
	},
	check: function(callback){
		if(!WdServer.token.saved){
			callback(false);
		}else{
			//TODO: callback it this brace will lead to corruption ,why.
			var options = {
				host: WD_API_HOST,
				path: "api?access_token=" + WdServer.token.saved,
				method: "GET"
			};
			var request = https.request(options,function(response){
				response.on("data",function(data){
					data = JSON.parse(data);
					if(data.status.status_code == 10013){
						console.log("false");
						callback(false);
					}else{
						console.log("true");
						callback(true);
					}
				})
			});
			request.end();
		}	
	}
};

/*

load resources
/login
/upload
/404

web server
/server
	/upload/image
	/upload/product
	/auth/login
	/auth/token ok
	/auth/session
	/database
	/crawler
*/

module.exports = WdServer;
