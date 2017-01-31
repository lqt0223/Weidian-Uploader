HTMLParagraphElement.prototype.message = function(content,timeout,repeat){
	var instance = this;
	if(!instance.originalText){
		instance.originalText = instance.innerText;
	}
	instance.stopMessage();
	instance._setInnerText(content);
	if(!repeat){
		instance.timer = window.setTimeout(function() {
			instance._setInnerText(instance.originalText);
		}, timeout);	
	}else{
		instance.timer = window.setInterval(function(){
			instance._setInnerText(content);
		},timeout);	
	}
};

HTMLParagraphElement.prototype.stopMessage = function(){
	clearTimeout(this.timer);
	clearInterval(this.timer);
};

HTMLParagraphElement.prototype._setInnerText = function(content){
	var instance = this;
	if(!instance.style.transition){
		instance.style.transition = "all 0.1s";
	}
	instance.addEventListener("transitionend",function lambda(){
		if(instance.phase == 0){
			instance.phase = 1;
			instance.style.opacity = 1.0;
			instance.innerText = content;
			instance.removeEventListener("transitionend",lambda);
		}
	},false);
	instance.style.opacity = 0.0;
	instance.phase = 0;
};

HTMLAnchorElement.prototype.message = HTMLParagraphElement.prototype.message;
HTMLAnchorElement.prototype.stopMessage = HTMLParagraphElement.prototype.stopMessage;
HTMLAnchorElement.prototype._setInnerText = HTMLParagraphElement.prototype._setInnerText;