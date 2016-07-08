

function Charter() {
}

Charter.chart = function(params,startDate,endDate,callback){
	//var params = req.query.q.split(",");
	//var startDate = req.query.start;
	//var endDate = req.query.end;
	//console.log (JSON.stringify(params));
	
	console.log ("charting...");
	
	var dateFormat = require('dateformat');
	var now = new Date();
	var https    = require('https');
	var Canvas = require('canvas');
	var Chart = require('nchart');
	var canvas = new Canvas(800, 800);
	var ctx = canvas.getContext('2d');
	
	var rgbColorsFill = new Array(
								"rgba(000,000,255,0.2)",
								"rgba(255,000,000,0.2)",
								"rgba(000,255,000,0.2)",
								"rgba(000,000,043,0.2)",
								"rgba(255,026,184,0.2)",
								"rgba(255,211,000,0.2)");

	var rgbColorsStroke = new Array(
									"rgba(000,000,255,1)",
									"rgba(255,000,000,1)",
									"rgba(000,255,000,1)",
									"rgba(000,000,043,1)",
									"rgba(255,026,184,1)",
									"rgba(255,211,000,1)");

	function dataset(label, values, fillColor, strokeColor){
		this.label = label;
		this.fillColor = fillColor;
		this.strokeColor = strokeColor;
		this.pointColor = strokeColor;
		this.pointStrokeColor = "#fff";
		this.pointHighlightFill = "#fff";
		this.pointHighlightStroke = strokeColor;
		this.data = values;			
	}

	var paramSet = [];
	for (var i = 0; i < params.length; i++) {
	  //add security checks on params[i]
	  paramSet[i] = "%22" + params[i] + "%22";
	}
	
	if (endDate.toLowerCase() == "now") endDate =  dateFormat(now, "yyyy-mm-dd");
	
	var stockQuery = "select%20*%20from%20yahoo.finance.historicaldata%20where%20symbol%20in%20("+paramSet.join("%2c")+")%20and%20startDate%20%3D%20%22"+ startDate +"%22%20and%20endDate%20%3D%20%22"+ endDate+"%22";


	// Make a REST call
	var host = "query.yahooapis.com";
	var path = '/v1/public/yql?q='+stockQuery+'&format=json&diagnostics=true&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=';

	var options = {
	  "host": host,
	  "path": path,
	  "port": 443,
	  "dataType": 'json',
	  method: "GET"
	};

	var resp = "";
	
	console.log ("Calling yahoo APIs");
	https.request(options, (function(res) {
	  res.setEncoding("utf8");
	  
	  res.on("data", (function (chunk) {
		resp += chunk;
	  }).bind(this))
	  .on('end', function(){ 
			
			console.log("REQUEST:");
			console.log(JSON.stringify(options));
			console.log("RESPONSE:");
			console.log(resp);
			
			var arrayQuote = JSON.parse(resp).query.results.quote;
			
			var quotesOpenArray = [];
			var date = [];

			arrayQuote.forEach( function (arrayItem){
				var quoteOpen = arrayItem.Open;
				var stockName = arrayItem.Symbol;
				if (  typeof quotesOpenArray[stockName] == 'undefined'){
					//is undefined
					quotesOpenArray[stockName] = [];
				}
				quotesOpenArray[stockName].push(quoteOpen);

				//save date value if item not already exist
				if (date.indexOf(arrayItem.Date) == -1) {
					date.push(arrayItem.Date);
				}

			},this);
			
			date.reverse();
			
			for (var i=1;i<date.length-1; i++){
				date[i] = "";
			}
			var labelSize = 0;
			
			var datasetsArray = [];
			params.forEach( function (param, index){
				if(!quotesOpenArray[param]) quotesOpenArray[param]=[]; 
				//If for any reason the quotesOpenArray are not of the same size, the max size is used for labels
				if (quotesOpenArray[param].length > labelSize) labelSize = quotesOpenArray[param].length;
				//Each quotesOpenArray is a new dataset using param as label
				datasetsArray.push(new dataset(param, quotesOpenArray[param].reverse(), rgbColorsFill[index], rgbColorsStroke[index]));
			},this);

			var data = {
				labels: date,
				datasets: datasetsArray
			};

			var myLineChart = new Chart(ctx).Line(data);
			
			canvas.toBuffer(function (err, buf) {
			  if (err) {
				  //TODO add an error handler as parameter after callback and use that function
				callback(err);
			  }

			  callback(buf.toString('base64'));
			  
			});
			
	  });

	}).bind(this)).end();
}

module.exports = Charter;
