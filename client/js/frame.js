//frame.js
var contentContainer = document.getElementById("content-container");

var style = new Style({
	in: {
		from:{
			opacity: 0.0,
			transform: "scale(0.8)"
		},
		to:{
			opacity: 1.0,
			transform: "scale(1.0)"
		}
	},
	out: {
		from:{
			opacity: 1.0,
			transform: "scale(1.0)"
		},
		to:{
			opacity: 0.0,
			transform: "scale(1.2)"
		}		
	},
	duration: "0.3s"
});

PT.init("#content-container");
PT.enable(["#/config","#/login","#/upload","#/demo"],style);
PT.customDirection("#/upload",1);

function handler(){
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
				PT.run();
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
}

window.addEventListener("hashchange",handler,false);
window.addEventListener("load",handler,false);

function runJS(path){
	var xhr = new XMLHttpRequest();
	xhr.onreadystatechange = function(){
		if(xhr.readyState == 4 && xhr.status == 200){
			var script = document.createElement("script");
			script.setAttribute("type","text/javascript");
			script.innerHTML = xhr.responseText;
			contentContainer.appendChild(script);
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

