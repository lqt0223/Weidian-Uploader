HTMLImageElement.prototype.makePop = function(){
	var on = false;
	var originalRect = this.getBoundingClientRect();
	var originalZIndex = this.style.zIndex;
	var newRect = {
		width: window.innerWidth / 2,
		height: (window.innerWidth / 2) * this.naturalHeight / this.naturalWidth,
		left: window.innerWidth / 4,
		top: 50
	}

	var backgroundView = document.createElement("div");
	backgroundView.style.position = "fixed";
	backgroundView.style.left = "0px";
	backgroundView.style.top = "0px"
	backgroundView.style.width = window.innerWidth + "px";
	backgroundView.style.height = window.innerHeight + "px";
	backgroundView.style.backgroundColor = "rgba(0,0,0,0.5)";
	backgroundView.style.zIndex = 99998;

	var img = document.createElement("img");
	img.src = this.src;
	img.style.position = "absolute";
	img.style.left = originalRect.left + "px";
	img.style.top = originalRect.top + "px";
	img.style.width = originalRect.width + "px";
	img.style.height = originalRect.height + "px";
	img.style.WebkitTransition = "all 0.2s ease-in-out";
	img.style.zIndex = 99999;
	document.body.appendChild(img);

	img.onclick = function(){
		switch(on){
			case false: {
				this.style.left = newRect.left + "px";
				this.style.top = newRect.top + "px";
				this.style.width = newRect.width + "px";
				this.style.height = newRect.height + "px";
				document.body.appendChild(backgroundView);
				on = true;
				break;
			}
			case true: {
				this.style.left = originalRect.left + "px";
				this.style.top = originalRect.top + "px";
				this.style.width = originalRect.width + "px";
				this.style.height = originalRect.height + "px";
				document.body.removeChild(backgroundView);
				on = false;
				break;
			}
		}
	}
}
