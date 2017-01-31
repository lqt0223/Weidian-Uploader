var Crawler = require("crawler");

function ChainCrawler(exp,map){
	this.exp = exp;
	this._interpolate(exp,map);
	this._parse();
}

ChainCrawler.prototype.run = function(callback){  // asynchronous iteration
	var cc = this;
	var start = cc._parsed.start;
	var steps = cc._parsed.steps;
	var i = 0;
	cc._crawl(0,start,function lambda(response,curIndex){
		if(response && curIndex < steps.length - 1){
			cc._crawl(curIndex + 1,response,lambda);
		}else{
			callback(response);
		}
	});
};

ChainCrawler.prototype._crawl = function(index,url,callback){
	var cc = this;
	var step = cc._parsed.steps[index];
	var selector = step.selector;
	var indexes = step.indexes;
	var target = step.filter.target;
	if(step.filter.pattern){
		var pattern = new RegExp(step.filter.pattern,"g");
	}
	var c = new Crawler({
		maxConnections:10,
		rateLimit:20000,
		callback:function(err,res,done){
			if(err) throw err;
			var $ = res.$;
			var result = $(selector);
			if(indexes){
				for (var j = 0; j < indexes.length; j++) {
					var element = result[indexes[j]];
					if(element){
						var data = (target == "text" ? $(element).text() : $(element).attr(target));
						if(pattern){
							if(data.search(pattern) != -1){
								callback(data,index);
							}
						}else{
							callback(data,index);
						}
					}
				}
			}else{
				result.each(function(){
					var data = (target == "text" ? $(this).text() : $(this).attr(target));
					if(pattern){
						if(data.search(pattern) != -1){
							callback(data,index);
						}
					}else{
						callback(data,index);
					}
				});
			}
			done();
		}
	});
	url = cc._processURL(url);
	c.queue(url);

};

ChainCrawler.prototype._processURL = function(url){
	if(url.slice(0,4) != "http"){
		if(url.charAt(0) != "/"){
			url = "/" + url;
		}
		return this._parsed.host + url;
	}else{
		return url;
	}
};

ChainCrawler.prototype._interpolate = function(exp,map){
	// console.log(map);
	var braced = exp.match(/\{[^\{\}]+\}/g);
	if(braced.length > 0){
		for (var i = 0; i < braced.length; i++) {
			var key = braced[i].slice(1,-1);
			exp = exp.replace(braced[i],map[key]);
		}
	}
	this.exp = exp;
};

ChainCrawler.prototype._parse = function(){
	var part = this.exp.split("->");
	var start = part.shift();
	var host = start.split("/");
	host.pop();
	host = host.join("/");
	var steps = [];
	for (var k = 0; k < part.length; k++) {
		var step = part[k].split("|");
		var selector, indexes;
		var a = step[0].split(":");
		var selector = a[0];
		if(a[1]){
			indexes = JSON.parse(a[1]);
		}
		var b = step[1].split(" ");
		var filter = {
			target: b[0]
		};
		if(b[1]){
			filter.pattern = b[1];
		}
		steps.push({
			selector:selector,
			indexes: indexes,
			filter:filter
		});
	}
	this._parsed = {
		start: start,
		host: host,
		steps: steps
	};
};

module.exports = ChainCrawler;

//API
/*
var cc = new ChainCrawler(exp,"K0000025431");

cc.run
*/
