var http = require("http");
var https = require("https");
var url = require("url");
var request = require("request");
var SocketServer = require("ws").Server;
var Crawler = require("crawler");
var gm = require("gm");

//custom modules
var ChainCrawler = require("./chain-crawler");
var WdDatabase = require("./wd-database");

function WdServer(){};

var WD_API_HOST = "api.vdian.com";

WdServer.user = {
	appkey : "",
	token : ""
}; // this is identical to the name of current user.

var socketInstance = {};
var wss = new SocketServer({port:8081}); // later: when deploy to server, change this.
wss.on("connection",function(ws){
	socketInstance = ws;
});

WdServer.handle = function(request,callback){
	var path = url.parse(request.url,true).pathname;
	if(request.method == "GET"){
		callback("403 Forbidden");
		return ;
	}
	path = path.slice(1);
	path = path.split("/");
	request.on("data",function(chunk){
		var params = JSON.parse(chunk);
		switch(path[1]){
			case "upload": {
				switch(path[2]){
					case "image":{
						WdServer.uploadImage(params,function(response){
							callback(response);
						});
						break;
					}
					case "product":{
						WdServer.uploadProduct(params,function(response){
							callback(response);
						});
						break;
					}
				}
			}
			case "auth": {
				switch(path[2]){
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
				}
			}
			case "database": {
				WdDatabase.query(params,function(results){
					callback(results);
				});
				break;
			}
			case "crawler": {
				WdServer.crawler.handle(params,function(response){
					callback(response);
				});
				break;
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
					// save the access_token in here. save only the appkey in to database as the identifier for the users uploaded images list and saved crawler.
					WdServer.user.token = data.result.access_token;
					WdServer.user.appkey = params.appkey;
					var result = {status: 0, message: "Access token received."};
					callback(result); // don't stringify here, only when before response.write, that a stringify is needed.
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
						if(r1.length == 0){
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
		var success = {
			status: 0,
			message: "The access token is valid."
		};
		var fail = {
			status: 1,
			message: "The access token is invalid, you may need to authenticate."
		};
		if(!WdServer.user.token){
			callback(fail);
		}else{
			var options = {
				host: WD_API_HOST,
				path: "/api?access_token=" + WdServer.user.token,
				method: "GET"
			};
			var request = https.request(options,function(response){
				response.on("data",function(data){
					data = JSON.parse(data);
					if(data.status.status_code == 10013){
						callback(fail);
					}else{
						callback(success);
					}
				})
			});
			request.end();
		}	
	}
};

WdServer.uploadImage = function(params,callback){
	var imageURL = params.url;
	var uploadURL = "https://api.vdian.com/media/upload?access_token=" + WdServer.user.token;
	var r = request.post({url:uploadURL},function(err,response,body){
		if(body&&response.statusCode == 200){
			callback(body);
		}
	});
	
	// var options = {
	// 	method: "POST",
	// 	host: "api.vdian.com",
	// 	path: "/media/upload?access_token=" + WdServer.user.token
	// };

	// var r = https.request(options,function(response){
		
	// });
	var boundary = Math.random().toString(16);
	r.setHeader('Content-Type', 'multipart/form-data; boundary=' + boundary); // the header to indicate formData
	var payload = 
		'--' + boundary + '\r\n' + 
		'Content-Disposition: form-data; name="media"; filename="upload.jpg"\r\n' +  // the body to indicate Media
		'Content-Type: image/jpeg\r\n\r\n' 
	r.write(payload);

	request(imageURL).on("end",function(){
		r.write("\r\n--" + boundary + "--");
	}).pipe(r); //use chain grammer, first set the event handler, and pipe to destination. Doing it reversely will cause the uploaded image to corrupt.
	// later: try to do this without request module.
};

WdServer.crawler = {
	handle: function(params,callback){
		switch(params.action){
			case "add":{
				if(WdServer.user.appkey){
					var dbParams = {
						action: "insert",
						table: "crawler",
						data: {
							name: params.name,
							host: params.host,
							title_selector: params.title_selector,
							comment_selector:params.comment_selector,
							image_selector: params.image_selector
						},
						condition : "appkey=" + WdServer.user.appkey
					};
					wdDatabase.query(dbParams,function(result){
						callback(result);
					});
				}else{
					// notification to user that your session is not stored, crawler may not be saved.
				}
				break;
			}
			case "get":{
				if(WdServer.user.appkey){
					var dbParams = {
						action: "select",
						table: "crawler",
						condition: "appkey=" + WdServer.user.appkey
					};
					WdDatabase.query(dbParams,function(result){
						callback(result);
					});
				}
				break;
			}
			case "delete":{
				if(WdServer.user.appkey){
					var dbParams = {
						action: "delete",
						table: "crawler",
						condition: "name=" + params.name // later: learn how to use SQL join
					};
					WdDatabase.query(dbParams,function(result){
						callback(result);
					});
				}
				break;
			}
			case "run":{
				if(WdServer.user.appkey){
					var dbParams = {
						action: "select",
						table: "crawler",
						condition :"name='" + params.name + "'"
					};
					WdDatabase.query(dbParams,function(crawlerInfo){
						if(crawlerInfo){
							WdServer.crawler.run(crawlerInfo[0],params.url,function(response){
								callback(response);
							});
						}
					});
				}
				break;
			}
		}
	},
	run: function(crawlerInfo,url,callback){
		var map = WdServer.crawler.extract(crawlerInfo.pattern,url);
		if(map.length == 0){
			callback("fail");
		}
		var crawlerCallback = function(err,res,done){
			if(err){
				console.log(err);
			}else{
				var $ = res.$;
				var title = $(crawlerInfo.title_selector).text();
				var comment = $(crawlerInfo.comment_selector).text();
				var result = {
					title: title,
					comment: comment,
				};
				callback(result);
			}
			done();
		};
		var crawler = new Crawler({maxConnections:10,callback: crawlerCallback});
		crawler.queue(url);

		var cc = new ChainCrawler(crawlerInfo.image_selector,map);
		cc.run(function(response){
			WdServer.thumbnail(response,function(encoded){
				var result = {
					url: response,
					thumbnail: encoded
				};
				result = JSON.stringify(result);
				socketInstance.send(result);
			});
			//when receiving one graphic, use gm to generate a thumbnail to user. callback the blob of this to client for display. Also callback the full-scale image url to client. 
			// socketInstance.send(response);
		});
	},
	extract: function(pattern,url){
		url = url.replace(/https?:\/\//g,"").replace(/\/$/g,"");
		var bracePattern = /\{[^\{\}]+\}/g;
		var keys = pattern.match(bracePattern).map(function(element){return element.slice(1,-1)});
		var map = {};
		for (var i = 0; i < keys.length; i++) {
			map[keys[i]] = "";
		}
		var p = pattern;
		p = p.replace(bracePattern,".+").replace("\?","\\?");
		p = new RegExp(p,"g");
		if(url.match(p)){
			pattern = pattern.replace(bracePattern," ").split(" ");
			for (var i = 0; i < pattern.length; i++) {
				if(pattern[i].length > 0){
					pattern[i] = pattern[i].replace("\?","\\?");
					pattern[i] = new RegExp(pattern[i],"g");
					url = url.replace(pattern[i]," ");
				}
			}
			url = url.split(" ").filter(function(element){return element.length>0});
			var i = 0;
			for(var key in map){
				map[key] = url[i++];
			}
			return map;
		}else{
			return ;
		}
	}
};

WdServer.thumbnail = function(url,callback){
	http.get(url,function(response){
		gm(response).thumbnail(200,200).toBuffer(function(err,buffer){
			if(err) console.log(err);
			callback("data:image/jpg;base64," + buffer.toString("base64"));
		});
	});
};

/*

load templates
/login
/upload
/any invalid url -> 404

web server
/server
	/upload/image ok
	/upload/product
	/auth/token ok
	/database ok
	/crawler ok
	/websocket
*/

module.exports = WdServer;
