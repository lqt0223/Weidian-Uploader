var mysql = require("mysql");

function WdDatabase(){};

WdDatabase.connect = function(callback){
	var connection = mysql.createConnection({
		host: "localhost",
		database: "wduploader",
		user: "root",
		password: "liang4229850"
	});

	connection.connect(function(err){
		if(err){
			callback(err);
			return;
		}
		WdDatabase.connection = connection;
		callback("Connected as id" + connection.threadId);
	});
};

WdDatabase.query = function(params,callback){
	if(!WdDatabase.connection){
		WdDatabase.connect(function(response){
			if(typeof response != "string"){ // error
				callback(response);
			}else{
				WdDatabase.query(params,callback);
			}
		});
	}else{
		var table = params.table;
		var action = params.action;
		var data = params.data; // object containing column: value
		var condition = params.condition; // SQL string
		switch(action){
			case "select":{
				var query = "SELECT * FROM " + table; // the mysql.escape should not be used;
				if(condition){
					query +=  " WHERE " + condition;
				}
				WdDatabase.connection.query(query,function(error,results,fields){
					if(error) throw error;
					callback(results);
				});
				break;
			}
			case "insert": {
				var query = "INSERT INTO " + table + " SET ?";
				WdDatabase.connection.query(query, data,function(error,results,fields){
					if(error) throw error;
					callback(results);
				});
				break;
			}
			case "update":{
				var query = "UPDATE " + table + " SET ?" + " WHERE " + condition;
				WdDatabase.connection.query(query,data,function(error,results,fields){
					if(error) throw error;
					callback(results);
				});
				break;
			}
			case "delete":{
				var query = "DELETE FROM " + table + " WHERE " + condition;
				WdDatabase.connection.query(query,function(error,results,fields){
					if(error) throw error;
					callback(results);
				});
				break;
			}
		}
	}
}

module.exports = WdDatabase;
