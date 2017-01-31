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
	/crawler?action=add(name,host,title_selector,comment_selector,image_selector),get,delete(name),run(name,url)
	/websocket
*/

//test
//image-grid;
// var imageGridWrapper = document.getElementById("image-grid");

var option = {
	// direction: "horizontal", //default "vertical"
	tint: "#428bca", // The bootstrap primary color.
	width: "310px",
	height: "300px",
	division: 3,
	// spacing: "15px", //default "10px"
	button: {
		title: "已上传",
		position: "end",
		callback: function(){
			console.log("here");
			//todo: jump to uploaded page
		}
	}
};

var imageGrid = new ImageGrid(option);
imageGrid.addPopButton("Upload Image",function(){
	if(window.confirm("你确认要上传此图片吗？")){
		imageGrid.dismissPopup();
		var params = {url:imageGrid.getPopped().src};
		var navbarText = document.getElementById("navbar-text");
		ajaxPOST("/server/upload/image",true, params,function(response){
			response = JSON.parse(response);
			if(response["status"]["status_code"] == 0){
				var uploadedURL = response.result;
				navbarText.stopMessage();
				navbarText.message('上传成功，可在"已上传"中查看',3000);
				var appkey = window.sessionStorage.getItem("appkey");
				var src = uploadedURL;
				var original_src = params.url;
				var data = {
					appkey: appkey,
					src: src,
					original_src: original_src
				};
				var saveToDBParam = {
					table: "uploaded_images",
					action: "insert",
					data: data
				};
				console.log(saveToDBParam);
				ajaxPOST("/server/database",true,saveToDBParam,function(res){
					console.log("Response from DB: " + res);
				});
			}
		});
		navbarText.message("上传中",500,true);
	}
});

var imgPanel = document.getElementsByClassName("panel-body")[1];

imgPanel.insertBefore(imageGrid.view,imgPanel.childNodes[2]);

document.getElementById("item_src").value = "http://kakaku.com/item/K0000752291/"; //debug

document.getElementById("config").onclick = function(e){
	e.preventDefault();
	window.location = "./config";
};

document.getElementById("crawl").onclick = function(e){
	e.preventDefault();
	imageGrid.clear();
	// var imageWrapper = document.getElementById("image_wrapper");
	// while(imageWrapper.hasChildNodes()){
	// 	imageWrapper.removeChild(imageWrapper.firstChild);
	// }
	var itemSRC = document.getElementById("item_src").value;
	var i = document.getElementById("config_selector").selectedIndex
	var configName = window.sessionStorage.getItem("configs");
	configName = JSON.parse(configName)[0].name;
	var params = {
		name: configName,
		url: itemSRC,
		action: "run"
	};
	var ws = new WebSocket("ws://127.0.0.1:8081"); //later: when deploy to server change this.
	ws.addEventListener("message",function(event){
		var result = JSON.parse(event.data);
		// console.log(result);

		// var url = event.data.url;
		// var thumbnail = event.data.thumbnail;
		// console.log(thumbnail);
		// var src = URL.createObjectURL(thumbnail);
		imageGrid.add(result.url,result.thumbnail);
		// data:contentType;base64, encoded
	});
	ajaxPOST("/server/crawler",true,params,function(response){
		document.getElementById("item_name").value = response.title;
		document.getElementById("item_comment").value = response.comment;
		//caution: this is not relying on image selector
		// var id = itemSRC.match(/K\d{10}/g)[0];
		// var src = "http://img1.kakaku.k-img.com/images/productimage/fullscale/" + id + ".jpg";
		// // img.height = 500;
		// imageGrid.add(src);
		// img.style.width = "300px";
		// img.onload = function(){
		// 	img.style.height = 300 * this.naturalHeight / this.naturalWidth + "px";
		// 	img.makePop();
		// };
	});
	// connect("ws://127.0.0.1:8889/", "crawl", function(response){
	// 	var img = new Image;
	// 	img.src = response;
	// 	img.onclick = function(){
	// 		var confirm = window.confirm("是否需要上传此图片?");
	// 		if(confirm == true){
	// 			var url = "http://127.0.0.1:8888/upload";
	// 			var params = {
	// 				type: "image",
	// 				url: img.src,
	// 			};
	// 			ajaxGet(url,params,function(response){
	// 				response = JSON.parse(response);
	// 				//later: handle exception when the upload is not success;
	// 				if(response["status"]["status_code"] == 0){
	// 					var id = new Date().getTime();
	// 					img.id = id; // give the img element a unique id;
	// 					uploadedImages.push({id: id, url: response.result});
	// 					console.log("Uploaded to : " + response.result);
	// 					console.log(uploadedImages);
	// 					console.log(img);
	// 				}else{
	// 					console.log("Error");
	// 				}
	// 			});
	// 		}
	// 	}
	// 	img.style.width = "200px";
	// 	userimageWrapper.appendChild(img);
	// },function(){

	// });
}

// var uploaded = document.getElementById("uploaded");
// uploaded.style.padding = "100px";
// uploaded.style.border = "0.5px solid gray";
// uploaded.style.backgroundColor = "white";
// uploaded.style.fontSize = "30px";

// uploaded.style.border = "1px solid gray";
// uploaded.style.marginRight = "px";

window.onload = function(){
	checkToken();
	getConfig(function(response){
		window.sessionStorage.setItem("configs",JSON.stringify(response));
		var configSelector = document.getElementById("config_selector");
		while(configSelector.hasChildNodes()){
			configSelector.removeChild(configSelector.firstChild);
		}
		for (var i = 0; i < response.length; i++) {
			var option = document.createElement("option");
			option.value = response[i].name;
			option.innerText = response[i].name;
			configSelector.appendChild(option);
		}

	});
	var navbarText = document.getElementById("navbar-text");
	navbarText.innerText = navbarText.innerText.replace("_",window.sessionStorage.getItem("appkey"));
	// console.log(welcomeText);
	// document.getElementById("welcome").innerText.replace("_",window.sessionStorage.getItem("appkey"));
};