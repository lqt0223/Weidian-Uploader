function getNode(n, v) {
	n = document.createElementNS("http://www.w3.org/2000/svg", n);
	for (var p in v){
		n.setAttributeNS(null, p.replace(/[A-Z]/g, function(m, p, o, s) { return "-" + m.toLowerCase(); }), v[p]);
	}
	return n;
}

function Checkmark(size,tint){
	this._tint = tint;
	var svg = getNode("svg",{width:size + 1,height:size+1});
	document.body.appendChild(svg);
	var circle = getNode("circle",{cx:size/2,cy:size/2,r:size/2,fill:"#F5F5F5"});
	circle.style.transition = "all 0.5s";
	circle.style.opacity = 0.5;
	svg.appendChild(circle);
	var point1 = [0.1875*size,0.5625*size];
	var point2 = [0.375*size,0.75*size];
	var point3 = [0.8125*size,0.3125*size];
	var points = [point1,point2,point3].map(function(point){return point.join(",");}).join(" ");
	var polyline = getNode("polyline",{points:points,style:"stroke-width:" + size / 8 + ";stroke:white;fill:none"});
	svg.appendChild(polyline);
	this.view = svg;
	this.selected = false;
}

Checkmark.prototype.toggle = function(){
	this.selected = !this.selected;
	this._update();
};

Checkmark.prototype._update = function(){
	var circle = this.view.firstChild;
	if(this.selected){
		circle.setAttributeNS(null,"fill",this._tint);
		circle.style.opacity = 1.0;
	}else{
		circle.setAttributeNS(null,"fill","#F5F5F5");
		circle.style.opacity = 0.5;
	}
};