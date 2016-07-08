var charter  = require('./charter');

function HelloService(rawLog, logger) {

    var clientProg = "/blackbox/client/clientApp";
    var server = undefined;

    /**
     * Starts the server.
     *
     * @param app express app
     */
    this.start = function start(app) {
        var self = this;
        server = app.listen(app.get('port'), function() {
            var host = server.address().address;
            var port = server.address().port;
            logger.info('[start] listening at http://%s:%s', host, port);
        });
    }

    /**
     * req.body = { main: String, code: String, name: String }
     */
    this.initCode = function initCode(req, res) {
        if (status === Status.ready) {
            try {
                var body = req.body || {};
                var message = body.value || {};
                logger.info('[initCode]', body);

                // Not expected zip which would come from message.lib
                if (message.main && message.code && typeof message.main === 'string' && typeof message.code === 'string') {
                    // .... app-specific initialization ...
                    res.status(200).send();
                }
            } catch (e) {
                logger.error('[initCode]', 'excception', e);
                res.status(500).send();
            }
        } else res.status(409).send();
    }

    /**
     * req.body = { value: Object, meta { activationId : int } }
     */
    this.runCode = function runCode(req, res) {
        var meta = (req.body || {}).meta;
        var value = (req.body || {}).value;
        /*
		var payload = value.payload; // we expect this to be a string
        if (typeof payload != 'string')
            payload = JSON.stringify(payload);
		*/
		console.log(value);
		
		var hostname = value.hostname; //e.g. "stockcompare.mybluemix.net"
		var quotes = value.quotes || [];
		var startDate = value.startDate;
		var endDate = value.endDate;
		
		console.log("quotes = "+quotes);
		console.log("startDate = "+startDate);
		console.log("endDate = "+endDate);
		console.log("hostname = "+hostname);
		
		charter.chart(quotes,startDate,endDate,function(payload){
			console.log("chart callback started");
			var result = { 'result' : { 'msg' : 'result is '+payload } };
				
			// Make a REST call
			var http = require('http');
			
			var postData = JSON.stringify({
			  imageName : quotes.join("-"),
			  imageData : payload
			});
			
			var options = {
			  host: hostname,
			  path: "/saveImage",
			  port: 80,
			  method: "POST",
			  headers: {
				'Content-Type': 'application/json'
			  }
			};
			
			var resp = "";
			
			console.log("doing http request");
			console.log(options);
			var request = http.request(options, (function(nodeResponse) {
				nodeResponse.setEncoding("utf8");
				  
				nodeResponse.on("data", (function (chunk) {
					console.log("DEBUG: chunking");
					resp += chunk;
				}).bind(this))
				.on('end', (function(){
					console.log("end");
					
					res.status(200).json(result);
				}).bind(this));

			}).bind(this));
			
			request.on("error",function(err){
				console.log("Error: "+err);
			});
			request.write(postData);
			request.end();
			
		});
		
    }

}

HelloService.getService = function(rawLog, logger) {
    return new HelloService(rawLog, logger);
}

module.exports = HelloService;

