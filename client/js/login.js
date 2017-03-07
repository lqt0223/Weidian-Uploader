//login.js

document.getElementById("appkey").value = "673196";
document.getElementById("secret").value = "7641180cda5f45b68601790ec1a6d763";
// document.getElementById("item_url").value = "http://kakaku.com/item/K0000752291/";

document.getElementById("auth").onclick = function(){
	var appkey = document.getElementById("appkey").value;
	var secret = document.getElementById("secret").value;
	var params = {
		appkey: appkey,
		secret: secret,
		action: "getToken"
	};

	var url = "http://127.0.0.1:8000/server/auth/token";
	ajaxPOST(url,true,params,function(response){
		if(response.status == 0){
			console.log(response);
			window.location = "#/upload";
			window.sessionStorage.setItem("appkey",appkey);
		}else{
			console.log("Your appkey or secret is not correct");
		}
	});
};

checkToken();
