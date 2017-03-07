//image-grid.js

function ImageGrid(option){
	this.option = option;
	this._popButtons = [];
	this._init();
};

function ImageCell(url,thumbnail,length,tint){
	this.length = length;
	this.tint = tint;
	this.url = url;
	this.thumbnail = thumbnail;
	this._init();
};

function ButtonCell(title,color,position,callback){
	this.title = title;
	this.color = color;
	this.position = position;
	this.callback = callback;
	this._init();
}

ImageGrid.prototype._init = function(){
	var overalLength = 0;
	this._cells = [];
	// default values
	if(!this.option.direction){
		this.option.direction = "vertical";
	}
	if(!this.option.tint){
		this.option.tint = "#000000";
	}
	if(!this.option.spacing){
		this.option.spacing = "10px";
	}
	switch(this.option.direction){
		case "horizontal": {
			overalLength = parseInt(this.option.height);
			break;
		}
		case "vertical": {
			overalLength = parseInt(this.option.width);
			break;
		}
		default :{
			throw "The 'direction' parameter is invalid";
			break;
		}
	}

	this.cellLength = overalLength / this.option.division;
	var wrapper = document.createElement("div");
	wrapper.style.overflow = "scroll";
	wrapper.style.WebkitOverflowScrolling = 'touch';
	wrapper.style.width = this.option.width;
	wrapper.style.height = this.option.height;
	wrapper.style.boxShadow = "inset 0 0 0px 1px" + this.option.tint;
	this.view = wrapper;
	if(this.option.direction == "horizontal"){
		this.view.style.overflowY = "hidden";
	}
	if(this.option.button){
		var title = this.option.button.title;
		var position = this.option.button.position;
		var callback = this.option.button.callback;
		var buttonCell = new ButtonCell(title,this.option.tint,position,callback);
		this._buttonCell = buttonCell;
		if(this.option.button.position == "start"){
			this._buttonPosition = 0;
		}else if(this.option.button.position == "end"){
			this._buttonPosition = 1;
		}else{
			throw "The parameter for button position is invalid."
		}
		this._cells.push(this._buttonCell);
		this._update();
	}
};

ImageGrid.prototype.add = function(url,thumbnail){
	this._cells.push(new ImageCell(url,thumbnail,this.cellLength,this.option.tint));
	if(this.option.button){
		this._updateButton();
	}
	this._update();
};

ImageGrid.prototype._updateButton = function(){
	var index = this._cells.indexOf(this._buttonCell);
	if(index == -1){
		this._buttonPosition == 0 ? this._cells.unshift(this._buttonCell) : this._cells.push(this._buttonCell);
	}else{
		this._cells.splice(index,1);
		this._buttonPosition == 0 ? this._cells.unshift(this._buttonCell) : this._cells.push(this._buttonCell);
	}
}

ImageGrid.prototype.remove = function(i){
	this._cells.splice(i,1);
	this._update();
};

ImageGrid.prototype.clear = function(){
	this._cells = [this._buttonCell];
	this._update();
}

ImageGrid.prototype._update = function(){
	var instance = this;
	while(this.view.hasChildNodes()){
		this.view.removeChild(this.view.firstChild);
	}
	for (var i = 0; i < this._cells.length; i++) {
		var className = this._cells[i].constructor.name;
		if(className == "ImageCell"){
			var imageCell = this._cells[i]._cellWrapper;
			imageCell.style.width = this.cellLength + "px";
			imageCell.style.height = this.cellLength + "px";
			imageCell.style.position = "relative";
			imageCell.style.display = "inline-block";
			//in horizontal mode, the cellWrapper have to be rearranged;
			if(this.option.direction == "horizontal"){
				imageCell.style.display = "block";
				var column = Math.floor(i / this.option.division);
				var row = i % this.option.division;
				imageCell.style.left = this.cellLength * (column) + "px";
				imageCell.style.top = this.cellLength * (row - i) + "px";
			}
			imageCell._img.style.position = "absolute";
			imageCell._img.style.width = (this.cellLength - parseInt(this.option.spacing)) + "px";
			imageCell._img.style.height = (this.cellLength - parseInt(this.option.spacing))  + "px";
			imageCell._img.style.left = parseInt(this.option.spacing) / 2 + "px";
			imageCell._img.style.top = parseInt(this.option.spacing) / 2 + "px";
			this.view.appendChild(imageCell);
			// console.log("here");
			var checkmark = imageCell.children[1];
			checkmark.style.left = this.cellLength / 10 + "px";
			checkmark.style.top = this.cellLength / 1.35 + "px";
			if(this._popButtons.length > 0){
				if(!imageCell._img.set){
					imageCell._img.set = true;
					imageCell._img.addEventListener("load",function(){
						imageCell._img.pop(instance);
						for (var i = 0; i < instance._popButtons.length; i++) {
							var popButton = instance._popButtons[i];
							imageCell._img.addPopButton(popButton.title,popButton.callback);
						}
					},false);
				}
			}
		}else{
			// buttonCell
			this.view.appendChild(this._cells[i]._cellWrapper);
			var buttonCell = this._cells[i]._cellWrapper;

			var box = buttonCell.firstChild;
			var title = box.firstChild;
			buttonCell.style.width = this.cellLength + "px";
			buttonCell.style.height = this.cellLength + "px";
			if(this.option.direction == "horizontal"){
				var column = Math.floor(i / this.option.division);
				var row = i % this.option.division;
				buttonCell.style.left = this.cellLength * (column) + "px";
				buttonCell.style.top = this.cellLength * (row - i) + "px";
			}
			box.style.width = (this.cellLength - parseInt(this.option.spacing)) + "px";
			box.style.height = (this.cellLength - parseInt(this.option.spacing)) + "px";
			box.style.left = parseInt(this.option.spacing) / 2 + "px";
			box.style.top = parseInt(this.option.spacing) / 2 + "px";
			title.style.width = (this.cellLength - parseInt(this.option.spacing)) + "px";
			title.style.height = (this.cellLength - parseInt(this.option.spacing)) + "px";
			title.style.display = "table-cell";
			title.style.textAlign = "center";
			title.style.verticalAlign = "middle";
			title.style.fontSize = this.cellLength / 6 + "px";
		}
	}
};

ImageGrid.prototype.getSelected = function(){
	var cells = this._cells.filter(function(cell){
		return cell.selected == true;
	});
	return cells;
};

ImageGrid.prototype.addPopButton = function(title,callback){
	this._popButtons.push({title:title,callback:callback});
};

ImageGrid.prototype.getPopped = function(){
	return this._popped;
};

ImageGrid.prototype.dismissPopup = function(){
	var e = new TouchEvent("touchend");
	// e.initTouchEvent();
	this._popped.dispatchEvent(e);

};

ImageCell.prototype._init = function(){
	var moved = false;
	var imageCell = this;
	this.selected = false;
	var wrapper = document.createElement("div");
	wrapper.className = "grid-cell-wrapper";
	wrapper.style.transition = "all 0.5s";
	var img = document.createElement("img");
	if(this.thumbnail){
		img.src = this.thumbnail;
		img.setAttribute("realsrc",this.url);
	}else{
		img.src = this.url;
	}
	img.style.position = "relative";
	img.style.objectFit = "cover";
	wrapper.style.transform = "translate3d(0,0,0)";
	wrapper.appendChild(img);

	var checkmark = new Checkmark(this.length / 6,this.tint);
	checkmark.view.style.position = "relative";
	checkmark.view.style.display = "block";
	wrapper.appendChild(checkmark.view);

	this._cellWrapper = wrapper;
	this._cellWrapper._img = img;
	this.className = "image-cell";

	checkmark.view.addEventListener("touchstart",function(){
		moved = false;
	},false);
	checkmark.view.addEventListener("touchmove",function(){
		moved = true;
	},false);
	checkmark.view.addEventListener("touchend",function(){
		if(!moved){
			imageCell.selected = !imageCell.selected;
			imageCell.toggle();
			checkmark.toggle();
		}
	},false);
};

ImageCell.prototype.toggle = function(){
	var image = this._cellWrapper.firstChild;
	image.style.opacity = (this.selected ? 0.5 : 1);
};

ButtonCell.prototype._init = function(){
	var moved = false;
	var view = document.createElement("div");
	var box = document.createElement("div");
	var title = document.createElement("p");
	view.style.display = "inline-block";
	view.style.position = "relative";
	box.style.display = "inline-block";
	box.style.position = "absolute";
	title.position = "relative";
	box.style.boxShadow = "inset 0 0 0px 1px" + this.color;
	box.style.transition = "all 0.5s";
	view.appendChild(box);
	box.appendChild(title);

	var callback = this.callback;
	var color = this.color;
	title.innerText = this.title;
	title.style.color = color;
	title.style.fontFamily = "Helvetica";
	title.style.fontWeight = "900";
	title.style.WebkitUserSelect = "none";
	title.style.transition = "all 0.5s";
	view.addEventListener("touchstart",function(){
		title.style.color = "white";
		box.style.backgroundColor = color;
		moved = false;
	},false);
	view.addEventListener("touchmove",function(){
		moved = true;
	},false);
	view.addEventListener("touchend",function(){
		if(!moved){
			callback();
		}
		title.style.color = color;
		box.style.backgroundColor = "white";
	},false);
	this._cellWrapper = view;
	this.className = "button-cell";
};