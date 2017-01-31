window.onload = function(){
	checkToken();

	var welcome = document.getElementById("welcome");
	welcome.innerText = welcome.innerText.replace("_",window.sessionStorage.getItem("appkey"));
};