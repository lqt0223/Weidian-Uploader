//page-transition.js

/*
PT: Fullscreen Page transition effect for front-end routing.

PT is a tiny library that enable fullscreen page transition effect for frond-end routing(using hash "#" to change web content.)

How to use:
1. Initialize PT. the parameter is the CSS selector string to your content wrapper div.
PT.init(#wrapper);
2. Call the following function to enable transition effect on specified hashes.
The second parameter is a custom Style instance, that describes the transition. You can create new style by yourself like this:

var zoomInFade = new Style({
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
	duration: "0.5s"
});

//after customizing the transition style...
PT.enable(["#login","#welcome","#dashboard"],zoomInFade);

3. If you need to playback the transition animation in a specified direction on a hash (such as "#home"), use this function:
PT.customDirection("#home",1); // 1 for back, and 0 for forth.

4. Put this line of code after the code where your front-end router change the innerHTML of the #wrapper
PT.run();

*/

var DIRECTION_FORTH = 0;
var DIRECTION_BACK = 1;

function PT(){};

PT.init = function(querySelector){
	PT._selector = querySelector;
	PT._parentNode = document.querySelector(querySelector).parentNode;
	PT._hashArray = [];
	PT._customDirections = [];
};

PT._getCurrentDOMCopy = function(){
	return document.querySelector(PT._selector).cloneNode(true);
};

PT._recordDOM = function(){
	// when there is no previous DOM, use a blank div.
	PT._prevDOM = PT._curDOM ? PT._curDOM : document.createElement("div") ;
	PT._curDOM = PT._getCurrentDOMCopy();
};

PT._recordHash = function(hash){
	PT._hashArray.push(hash);
};

PT.run = function(){
	var currentHash = window.location.hash;
	PT._recordDOM();
	PT._recordHash(currentHash);
	if(PT._enabledHashes.some(function(hash){
		return hash == currentHash;
	})){
		PT._direction = PT._getCustomDirection(currentHash) || PT._autoDirection();
		PT._makeTransition(
			PT._prevDOM,
			PT._curDOM,
			PT._style,
			PT._direction
		);		
	}
};

PT._autoDirection = function(){
	var hashArray = PT._hashArray;
	var last = hashArray[hashArray.length - 1];
	for (var i = 0; i < hashArray.length - 1; i++) {
		if(hashArray[i] == last){
			hashArray.splice(i + 1);
			return DIRECTION_BACK;
		}
	}
	return DIRECTION_FORTH;
}

PT._getCustomDirection = function(hash){
	for (var i = 0; i < PT._customDirections.length; i++) {
		if(hash == PT._customDirections[i].hash){
			return PT._customDirections[i].direction;
		}
	}
};

PT.enable = function(hashes, style){
	PT._enabledHashes = hashes;
	PT._style = style;
};

PT.customDirection = function(hash, direction){
	PT._customDirections.push({
		hash: hash,
		direction: direction
	});
};

PT._makeTransition = function(prevDOM, cur, style, direction){
	var curDOM = document.querySelector(PT._selector);
	// draw the div using prevDOMContent and cover the updated content	
	PT._parentNode.appendChild(prevDOM);

	prevDOM.style.position = "absolute";
	prevDOM.style.left = "0px";
	prevDOM.style.top = "0px";

	curDOM.style.position = "absolute";
	curDOM.style.left = "0px";
	curDOM.style.top = "0px";

	document.addEventListener("animationend",function(){
		if(prevDOM.parentNode == PT._parentNode){
			PT._parentNode.removeChild(prevDOM);
			prevDOM.style.animation = undefined;
			curDOM.style.animation = undefined;
		}
	},false);

	var style = PT._style;
	if(direction == DIRECTION_FORTH){
		prevDOM.style.animation = style.outForth + " " + style.duration; 
		curDOM.style.animation = style.inForth + " " + style.duration;
	}else{
		prevDOM.style.animation = style.inBack + " " + style.duration;
		curDOM.style.animation = style.outBack + " " + style.duration;
	}
};

function Style(data){
	// generate 2 pairs of random key for the naming of animation
	this._inForth = "a" + Math.random().toString(16).slice(-4);
	this._inBack = "a" + Math.random().toString(16).slice(-4);
	this._outForth = "a" + Math.random().toString(16).slice(-4);
	this._outBack = "a" + Math.random().toString(16).slice(-4);
	this._data = data;
	this._init();
	return {
		inForth: this._inForth,
		inBack: this._inBack,
		outForth: this._outForth,
		outBack: this._outBack,
		duration: this._data.duration
	};
};

Style.prototype._init = function(){
	var style = document.createElement("style");
	style.type = "text/css";
	style.innerHTML = this._getKeyframesString();
	document.getElementsByTagName('head')[0].appendChild(style);
};

Style.prototype._getKeyframesString = function(){
	var inForthString = "@keyframes " + this._inForth + "{";
	inForthString += "\nfrom{" + this._concatCssString(this._data.in.from) + "}";
	inForthString += "\nto{" + this._concatCssString(this._data.in.to) + "}";
	inForthString += "\n}";

	var inBackString = "@keyframes " + this._inBack + "{";
	inBackString += "\nfrom{" + this._concatCssString(this._data.in.to) + "}";
	inBackString += "\nto{" + this._concatCssString(this._data.in.from) + "}";
	inBackString += "\n}";

	var outForthString = "@keyframes " + this._outForth + "{";
	outForthString += "\nfrom{" + this._concatCssString(this._data.out.from) + "}";
	outForthString += "\nto{" + this._concatCssString(this._data.out.to) + "}";
	outForthString += "\n}";

	var outBackString = "@keyframes " + this._outBack + "{";
	outBackString += "\nfrom{" + this._concatCssString(this._data.out.to) + "}";
	outBackString += "\nto{" + this._concatCssString(this._data.out.from) + "}";
	outBackString += "\n}";

	var string = inForthString + "\n" + inBackString + "\n" + outForthString + "\n" + outBackString;
	return string;
};

Style.prototype._concatCssString = function(cssObject){
	var string = "";
	for(var key in cssObject){
		string += key + ":" + cssObject[key] + ";"
	}
	return string;
};
