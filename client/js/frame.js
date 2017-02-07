var contentContainer = document.getElementById("content-container");
window.onhashchange = function(){
	var hash = window.location.hash || "#/login";
	if(hash == "#/"){
		window.location.hash = "#/login";
	}
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function(){
		if(xhr.readyState == 4 && xhr.status == 200){
			var responseType = xhr.getResponseHeader("Content-Type").split("/")[1];
			if(responseType == "html"){
				contentContainer.innerHTML = xhr.responseText;
			}

			var scripts = contentContainer.getElementsByTagName("script");
			for(var i = 0;i<scripts.length;i++){
				runJS(scripts[i].src);
				contentContainer.removeChild(scripts[i]);
				i--;
			}
		}
	};
	xhr.open("GET",hash.slice(1),true);
	xhr.send();
};

window.onload = window.onhashchange;

function runJS(path){
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function(){
		if(xhr.readyState == 4 && xhr.status == 200){
			var script = document.createElement("script");
			script.setAttribute("type","text/javascript");
			script.innerHTML = xhr.responseText;
			document.body.appendChild(script);
		}
	};
	xhr.open("GET",path,true);
	xhr.send();
}

var navbarOptions = document.querySelectorAll("ul.navbar-nav li");
for(var i = 0; i < navbarOptions.length; i++){
	navbarOptions[i].addEventListener("touchstart",function(){
		document.getElementById("navbar-toggle-button").click();
	},false); 
}

// PageTransition.init();
// PageTransition.enable(["#/config","#/login","#/upload"],"zoom-in-fade");
