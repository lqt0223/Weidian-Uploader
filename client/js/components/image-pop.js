HTMLImageElement.prototype.pop = function(parent){
	var instance = this;
	var realsrc = this.getAttribute("realsrc");
	var img = document.createElement("img");
	img.src = this.src;
	var on = false;
	var originalRect = {};
	this.loading = {};
	var newRect = {
		width: window.innerWidth,
		height: window.innerWidth * this.naturalHeight / this.naturalWidth,
		left: 0,
		top: (window.innerHeight - window.innerWidth * this.naturalHeight / this.naturalWidth)/2
	};
	img.style.position = "absolute";
	img.style.opacity = 0.0;
	img.style.transition = "all 0.3s ease-in-out";

	img.addEventListener("touchend",function(){ // dismiss
		on = false;
		img.style.opacity = 0.0;
		img.style.left = originalRect.left + "px";
		img.style.top = originalRect.top + "px";
		img.style.width = originalRect.width + "px";
		img.style.height = originalRect.height + "px";
		backgroundView.style.opacity = 0.0;
		if(instance.loading){
			document.body.removeChild(instance.loading);
			delete instance.loading;
		}
	},false);

	var backgroundView = document.createElement("div");
	backgroundView.style.position = "fixed";
	backgroundView.style.left = "0px";
	backgroundView.style.top = "0px"
	backgroundView.style.width = window.innerWidth + "px";
	backgroundView.style.height = window.innerHeight + "px";
	backgroundView.style.backgroundColor = "black";
	backgroundView.style.opacity = 0.0;
	backgroundView.style.transition = "all 0.3s ease-in-out";
	backgroundView.addEventListener("transitionend",function(){
		if(on == false){
			backgroundView.removeChild(img);
			document.body.removeChild(backgroundView);
		}
	},false);

	var buttonBar = new ButtonBar(window.innerWidth,window.innerHeight / 20);
	this.buttonBar = buttonBar;
	backgroundView.appendChild(buttonBar.view);
	buttonBar.view.style.position = "relative";
	buttonBar.view.style.top = newRect.top + newRect.height + window.innerHeight / 80 + "px";
	if(parseInt(buttonBar.view.style.top) > window.innerHeight * 9 / 10){
		buttonBar.view.style.top = window.innerHeight * 9 / 10 + "px";
		buttonBar.view.style.zIndex = 99999;
		buttonBar.useBlackColor();
	}

	this.addEventListener("touchend",function(){ // popup
		on = true;
		parent._popped = img;

		originalRect = instance.getBoundingClientRect();
		img.style.width = originalRect.width + "px";
		img.style.height = originalRect.height + "px";
		img.style.left = originalRect.left + "px";
		img.style.top = originalRect.top + "px";
		if(realsrc && !instance.loaded){
			img.style.filter = "brightness(50%)";
			instance.loading = document.createElement("div");
			instance.loading.className = "uil-ring-css";
			instance.loading.style.display = "inline-block";
			instance.loading.style.position = "fixed";
			instance.loading.style.left = (window.innerWidth - 100) / 2 + "px";
			instance.loading.style.top = (window.innerHeight - 100) / 2 + "px";
			instance.loading.style.width = "100px";
			instance.loading.style.height = "100px";
			instance.loading.style.zIndex = 99999;
			document.body.appendChild(instance.loading);
			instance.loading.appendChild(document.createElement("div"));
			var tempImg = document.createElement("img");
			tempImg.src = realsrc;
			tempImg.onload = function(){
				delete tempImg;
				img.style.filter = "";
				img.src = realsrc;
				if(instance.loading){
					document.body.removeChild(instance.loading);
					delete instance.loading;
				}
				instance.loaded = true;

			};
		}else{
			img.src = realsrc;
		}

		document.body.appendChild(backgroundView);
		backgroundView.appendChild(img);
		setTimeout(function(){
			img.style.opacity = 1.0;
			img.style.left = newRect.left + "px";
			img.style.top = newRect.top + "px";
			img.style.width = newRect.width + "px";
			img.style.height = newRect.height + "px";
			backgroundView.style.zIndex = 99997;
			backgroundView.style.opacity = 1.0;
		},1);		
	},false);
}

HTMLImageElement.prototype.addPopButton = function(title,callback){
	this.buttonBar.add(title,function(){
		callback();
	});
};

function ButtonBar(width,height){
	this.width = width;
	this.height = height;
	this._textColor = "white"; //default
	this._cells = [];
	this._init();
};

function ButtonBarCell(title,height,textColor,callback){
	this.title = title;
	this.height = height;
	this.callback = callback;
	this._textColor = textColor;
	this._init();
}

ButtonBar.prototype._init = function(){
	var instance = this;
	var wrapper = document.createElement("div");
	wrapper.style.width = this.width + "px";
	wrapper.style.height = this.height + "px";
	this.view = wrapper;
};

ButtonBar.prototype.add = function(title,callback){
	this._cells.push(new ButtonBarCell(title,this.height,this._textColor,callback));
	this._update();
};

ButtonBar.prototype.useBlackColor = function(){
	this._textColor = "black";
};

ButtonBar.prototype._update = function(){
	var numberOfCells = this._cells.length;
	var wrapperWidth = this.width / numberOfCells;
	while(this.view.hasChildNodes()){
		this.view.removeChild(this.view.firstChild);
	}
	for (var i = 0; i < numberOfCells; i++) {
		this.view.appendChild(this._cells[i]._wrapper);
		this._cells[i]._wrapper.style.width = wrapperWidth + "px";
		this._cells[i]._button.style.width = wrapperWidth + "px";
	}
};

ButtonBarCell.prototype._init = function(){
	var instance = this;
	var cellWrapper = document.createElement("div");
	cellWrapper.style.display = "inline-block";
	cellWrapper.style.height = this.height + "px";
	var button = document.createElement("button");
	button.style.backgroundColor = "transparent";
	button.style.margin = "0 auto";
	button.style.color = this._textColor;
	button.style.height = this.height + "px";
	button.style.fontSize = this.height / 3 + "px";
	button.style.display = "table-cell";
	button.style.verticalAlign = "middle";
	button.style.textAlign = "center";
	button.style.borderStyle = "none";
	button.innerText = this.title;
	button.addEventListener("touchend",function(){
		instance.callback();
	},false);
	cellWrapper.appendChild(button);
	this._wrapper = cellWrapper;
	this._button = button;
};