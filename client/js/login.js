document.getElementById("appkey").value = "673196";
document.getElementById("secret").value = "7641180cda5f45b68601790ec1a6d763";
// document.getElementById("item_url").value = "http://kakaku.com/item/K0000752291/";


var accessToken = "";
document.getElementById("auth").onclick = function(){
	var appkey = document.getElementById("appkey").value;
	var secret = document.getElementById("secret").value;
	var params = {
		appkey: appkey,
		secret: secret,
		action: "getToken"
	};

	var url = "http://127.0.0.1:8888/server/auth/token";
	ajaxPOST(url,true,params,function(response){
		response = JSON.parse(response);
		console.log(response);
		if(response.status == 0){
			window.location = "/upload";
		}else{
			console.log("Your appkey or secret is not correct");
		}
	});
};

function authSuccess(response){
	accessToken = response;
	document.getElementById("authForm").style.display = "none";
	document.getElementById("uploadForm").style.display = "block";
}

// setTimeout(function(){
// 	checkToken();
// },1000);

//test
var test = document.getElementById("test");
test.onclick = function(){
	var url = "/server/database";
	var params = {
		table: "User",
		action: "delete",
		condition: "type=3",
		data: {
			graduation: "Shanghai FUDAN University"
		}
	};

	ajaxPOST(url,true,params,function(response){
		console.log(response);
	});
};

