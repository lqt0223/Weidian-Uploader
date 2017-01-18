
document.getElementById("crawl").onclick = function(){
	var imgsWrapper = document.getElementById("imgsWrapper");
	while(imgsWrapper.hasChildNodes()){
		imgsWrapper.removeChild(imgsWrapper.firstChild);
	}
	var userImgsWrapper = document.getElementById("userImgsWrapper");
	while(userImgsWrapper.hasChildNodes()){
		userImgsWrapper.removeChild(userImgsWrapper.firstChild);
	}	
	var itemURL = document.getElementById("item_url").value;
	var params = {
		url: itemURL
	};
	var url = "http://127.0.0.1:8888/crawl";


	ajaxGet(url,params,function(response){
		// console.log(response);
		var result = JSON.parse(response);
		document.getElementById("item_name").value = result.itemName;
		document.getElementById("item_comment").value = result.itemComment;

		var img = document.createElement("img");
		img.src = result.imgSrc;
		img.style.width = "300px";
		img.style.height = 300 * this.naturalHeight / this.naturalWidth + "px";
		// img.height = 500;
		imgsWrapper.appendChild(img);
		img.makePop();

	});
	connect("ws://127.0.0.1:8889/", "crawl", function(response){
		var img = new Image;
		img.src = response;
		img.onclick = function(){
			var confirm = window.confirm("是否需要上传此图片?");
			if(confirm == true){
				var url = "http://127.0.0.1:8888/upload";
				var params = {
					type: "image",
					url: img.src,
				};
				ajaxGet(url,params,function(response){
					response = JSON.parse(response);
					//todo: handle exception when the upload is not success;
					if(response["status"]["status_code"] == 0){
						var id = new Date().getTime();
						img.id = id; // give the img element a unique id;
						uploadedImages.push({id: id, url: response.result});
						console.log("Uploaded to : " + response.result);
						console.log(uploadedImages);
						console.log(img);
					}else{
						console.log("Error");
					}
				});
			}
		}
		img.style.width = "200px";
		userImgsWrapper.appendChild(img);
	},function(){

	});
}

setTimeout(function(){
	checkToken();
},1000);
