var DIRECTION_FORTH = 0;
var DIRECTION_BACK = 1;

function PageTransition(){

};

PageTransition.init = function(){

	// implement the ability to record previous and current HTML content; 
	// and determine the animation direction based on previous and current hash.
	PageTransition._prevContent = null;
	PageTransition._curContent = document.body.innerHTML;

	PageTransition._hashArray = [];
	PageTransition._forceDirections = [];

	window.addEventListener("hashchange",function(){
		// record the content
		PageTransition._prevContent = PageTransition._curContent;
		PageTransition._curContent = document.body.innerHTML;

		PageTransition._hashArray.push(window.location.hash);

		// imply the animation direction
		PageTransition._direction = PageTransition._implyDirection();

		// if there is a forced direction, override with it
		for (var i = 0; i < PageTransition._forceDirections.length; i++) {
			if(PageTransition._forceDirections[i].hash == window.location.hash){
				PageTransition._direction = PageTransition._forceDirections[i].direction;
				PageTransition._hashArray = [window.location.hash];
			}
		}

	},false);
};

// PageTransition._pushHash = function(hash){
// 	PageTransition._hashQueue.shift();
// 	PageTransition._hashQueue.push(hash);
// };

PageTransition._implyDirection = function(){
	var hashArray = PageTransition._hashArray;
	var last = hashArray[hashArray.length - 1];
	for (var i = 0; i < hashArray.length - 1; i++) {
		if(hashArray[i] == last){
			hashArray.splice(i + 1);
			return DIRECTION_BACK;
		}
	}
	return DIRECTION_FORTH;
}

PageTransition.enable = function(hashes, style){
	for (var i = 0; i < hashes.length; i++) {
		PageTransition._enable(hashes[i], style);
	}
};

PageTransition._enable = function(hash, style){
	// when the destination hash is the hash, animate; 
	// when the destination is the previous hash, animate in reverse.
	window.addEventListener("hashchange",function(){
		if(window.location.hash == hash){
			if (PageTransition._direction == DIRECTION_FORTH) {
				PageTransition.makeTransition(PageTransition._prevContent, PageTransition._curContent, style, false);
			}else{
				PageTransition.makeTransition(PageTransition._prevContent, PageTransition._curContent, style, true);
			}
		}
	},false);
};

PageTransition.forceDirection = function(hash, direction){
	PageTransition._forceDirections.push({
		hash: hash,
		direction: direction
	});
};

PageTransition.makeTransition = function(prev, cur, style, reverse){
	document.body.innerHTML = null;
	var prev = document.createElement("div");
	var cur = document.createElement("div");

	prev.innerHTML = PageTransition._prevContent;
	cur.innerHTML = PageTransition._curContent;

	prev.style.position = "absolute";
	cur.style.position = "absolute";
	prev.style.transition = "all 0.3s ease-in-out";
	cur.style.transition = "all 0.3s ease-in-out";

	document.addEventListener("transitionend",function(){
		if(prev.parentNode == document.body){
			document.body.removeChild(prev);
		}
		// prev.style.position = "static";
		cur.style.position = "static";
	},false);

	document.body.appendChild(prev);
	document.body.appendChild(cur);

	PageTransition._changeStyle(style, prev, cur, reverse);
	// setTimeout(function(){
	// },1);
	// if(style == "fade-in-out"){
	// 	setTimeout(function(){
	// 		prev.style.opacity = 0.0;
	// 		cur.style.opacity = 1.0;
	// 	},1);
	// 	cur.style.opacity = 0.0;
	// }
	// }else if(style == "slide-left-in"){
	// 	setTimeout()
	// }
	// console.log(arguments);
};

PageTransition._changeStyle = function(style, prev, cur, reverse){
	setTimeout(function(){
		if(style == "fade-in-out"){
			prev.style.opacity = 0.0;
			cur.style.opacity = 1.0;
		}else if(style == "slide-left-in"){
			prev.style.left = "200px";
			cur.style.left = "0px";
		}else if(style == "zoom-in-fade"){
			prev.style.opacity = 0.0;
			cur.style.opacity = 1.0;
			if(!reverse){
				prev.style.transform = "scale(1.2)";
				cur.style.transform = "scale(1.0)";				
			}else{
				prev.style.transform = "scale(0.83333333)";
				cur.style.transform = "scale(1.0)";	
			}
		}
	},1);
	if(style == "fade-in-out"){
		prev.style.opacity = 1.0;
		cur.style.opacity = 0.0;
	}else if(style == "slide-left-in"){
		prev.style.left = "0px";
		cur.style.left = "-200px";
	}else if(style == "zoom-in-fade"){
		prev.style.opacity = 1.0;
		cur.style.opacity = 0.0;
		if(!reverse){
			prev.style.transform = "scale(1.0)";
			cur.style.transform = "scale(0.83333333)";		
		}else{
			prev.style.transform = "scale(1.0)";
			cur.style.transform = "scale(1.2)";
		}

	}
};


//How to use:
// This is a library to enable transition effect on frond-end routing using hash "#" to jump between pages.
// Use PageTransition.enable(hashes,style) to enable transition effect on specific hashes 
// and set the style of transition effect.
// The animation direction is automatically handled.
// Use PageTransition.forceDirection(hash, directionValue) to determine the animation direction on some hash by yourself.
//API
// PageTransition.init();
// PageTransition.enable(["#first","#second","#third","#home","#huge"],"zoom-in-fade");
// PageTransition.forceDirection("", DIRECTION_BACK);