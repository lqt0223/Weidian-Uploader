var http = require('http');
var fs = require('fs');
var url = require('url');
var WdServer = require('./server/wd-server');

var VALID_URLS = ["/server","/login","/upload","/config"];

function loadFile(filePath,response){
	if(filePath[0] != "."){
		filePath = "." + filePath;
	}
	var extname = "." + filePath.slice(2).split(".")[1];
	if(extname){
		extname = extname.toLowerCase();
	}
	var contentType = 'text/html';
	var mimeTypes = {
		'.html': 'text/html',
		'.js': 'text/javascript',
		'.css': 'text/css',
		'.json': 'application/json',
		'.png': 'image/png',
		'.jpg': 'image/jpg',
		'.gif': 'image/gif',
		'.wav': 'audio/wav',
		'.mp4': 'video/mp4',
		'.woff': 'application/font-woff',   
		'.ttf': 'application/font-ttf',
		'.eot': 'application/vnd.ms-fontobject',
		'.otf': 'application/font-otf',
		'.svg': 'application/image/svg+xml'
	};
	
	contentType = mimeTypes[extname] || 'application/octect-stream';
	if(extname != ".undefined"){
		fs.readFile(filePath, function(err,content){
			if(err){
				if(err.code == "ENOENT"){
					loadFile("./client/templates/404.html",response);
				}else{
					response.writeHead(500);
					response.end('Sorry, check with the site admin for error: '+ err.code +' ..\n');
					response.end();
				}
			}else{
				response.writeHead(200, { 'Content-Type': contentType });
				response.end(content, 'utf-8');
			}
		});
	}else{
		var firstPath = "/" + filePath.split("/")[1];
		var result = VALID_URLS.some(function(element){
			return element == firstPath;
		});
		if(!result){
			loadFile("./client/templates/404.html",response);
		}
	}
}

var server = http.createServer(function(request, response) {
	var accessPath = request.url.split("?")[0];
	if("/" + accessPath.split("/")[1] == VALID_URLS[0]){
		WdServer.handle(request,function(w_response){
			// w_response = w_response ? JSON.stringify(w_response) : "403 Forbidden";
			response.write(JSON.stringify(w_response));
			response.end();
		});		
	}else if(accessPath == "/" || accessPath == VALID_URLS[1]){
		loadFile("./client/templates/login.html",response);
	}else if(accessPath == VALID_URLS[2]){
		loadFile("./client/templates/upload.html",response);
	}else if(accessPath == VALID_URLS[3]){
		loadFile("./client/templates/config.html",response);
	}else if(accessPath == "/demo"){
		loadFile("./client/templates/index.html",response);
	}else{
		loadFile(accessPath, response);
	}

}).listen(8888);
console.log('Server running at http://127.0.0.1:8888/');

//API
// SessionServer.init(server);

// function login(params){
// 	return (params.username == "lqt0223" && params.password == "liang4229850") ? true: false;
// }
// var Crawler = require("crawler");
// var WebSocketServer = require("ws").Server;
// var request = require("request");

// var webSocketServer = new WebSocketServer({
// 	host:"127.0.0.1",
// 	port:8889
// });

// var socketInstance = {};
// webSocketServer.on("connection",function(socket){
// 	socketInstance = socket;
// });

// var accessToken = "";

// http.createServer(function(request,response){
// 	response.setHeader("Access-Control-Allow-Origin", "*");
// 	response.writeHead(200,{"Content-type":"text/plain"});
// 	var params = url.parse(request.url,true).query;
// 	var pathname = url.parse(request.url,true).pathname;
// 	switch(pathname){
// 		case "/token" : {
// 			getAccessToken(params.appkey,params.secret,function(accessToken){
// 				response.write(accessToken);
// 				response.end();
// 			});
// 			break;
// 		}
// 		case "/crawl" : {
// 			crawl(params,
// 				function(text){
// 					response.write(JSON.stringify(text));
// 					response.end();
// 				});
// 			break;
// 		}
// 		case "/upload": {
// 			if(params.type == "image"){
// 				uploadPipedImage(accessToken,params.url,function(body){
// 					response.write(body);
// 					response.end();
// 				});
// 			}
// 			break;
// 		}
// 	}

// }).listen(8888);

// function getAccessToken(appkey,secret,callback){
// 	if(accessToken){
// 		callback(accessToken);
// 	}else{
// 		var options = {
// 			host: "api.vdian.com",
// 			path: "/token?grant_type=client_credential&appkey=" + appkey + "&secret=" + secret,
// 			method: "GET"
// 		};
// 		var request = https.request(options,function(response){
// 			response.on("data",function(data){
// 				accessToken = JSON.parse(data).result.access_token;
// 				callback(accessToken);
// 			});
// 		});
// 		request.end();
// 	}
// }

// function crawl(params, textCallback){
// 	var pattern = /K\d{10}/g;
// 	var itemNo = params.url.match(pattern)[0];
// 	var imgSrc = "http://img1.kakaku.k-img.com/images/productimage/fullscale/" + itemNo + ".jpg";
// 	var crawler = new Crawler({
// 		maxConnections : 10,
// 		callback: function(error,response,done){
// 			if(error){
// 				console.log(error);
// 			}else{
// 				var $ = response.$;
// 				var itemName = $(".boxL h2").text();
// 				var itemComment = $("#titleBox p").text();
// 				var results = {itemName: itemName,itemComment: itemComment, imgSrc: imgSrc};
// 				textCallback(results);
// 			}
// 			done();
// 		}
// 	});
// 	crawler.queue(params.url);

// 	var userImgLinkCrawler = new Crawler({
// 		maxConnections : 10,
// 		callback: function(error,response,done){
// 			if(error){
// 				console.log(error);
// 			}else{
// 				var $ = response.$;
// 				var imgLinks = $(".imgList a");
// 				for (var i = 0; i < 10; i++) { //later: pagination if there is more than 10 pages;
// 					var userImgUrl = imgLinks[i].attribs.href;
// 					userImgCrawler.queue(userImgUrl);
// 				}
// 			}
// 			done();
// 		}
// 	});

// 	userImgLinkCrawler.queue("http://kakaku.com/item/" + itemNo + "/picture/");

// 	// var userImgSrcs = [];
// 	var userImgCrawler = new Crawler({
// 		maxConnections : 10,
// 		callback : function(error,response,done){
// 			if(error){
// 				console.log(error);
// 			}else{
// 				var $ = response.$;
// 				var imgSrc = $(".imageArea img")[0];
// 				if(imgSrc){
// 					imgSrc = imgSrc.attribs.src;
// 					// userImgSrcs.push(imgSrc);
// 					socketInstance.send(imgSrc);
// 				}
// 			}
// 			done();
// 		}
// 	});
// 	userImgCrawler.on("drain",function(){
// 		socketInstance.close();
// 	});
// }

// function uploadPipedImage(token,imageURL,callback){
// 	var uploadURL = "https://api.vdian.com/media/upload?access_token=" + token;
// 	var r = request.post({url:uploadURL},function(err,response,body){
// 		if(body&&response.statusCode == 200){
// 			callback(body);
// 		}
// 	});

// 	var boundary = Math.random().toString(16);
// 	r.setHeader('Content-Type', 'multipart/form-data; boundary=' + boundary); // the header to indicate formData
// 	var payload = 
// 		'--' + boundary + '\r\n' + 
// 		'Content-Disposition: form-data; name="media"; filename="upload.jpg"\r\n' +  // the body to indicate Media
// 		'Content-Type: image/jpeg\r\n\r\n' 
// 	r.write(payload);

// 	// request(imageURL)

// 	request(imageURL).on("end",function(){
// 		r.write("\r\n--" + boundary + "--");
// 	}).pipe(r); //use chain grammer, first set the event handler, and pipe to destination. Doing it reversely will cause the uploaded image to corrupt.
// }

