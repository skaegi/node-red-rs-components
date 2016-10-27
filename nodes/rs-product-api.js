module.exports = function(RED) {
    "use strict";
    // require any external libraries we may need....
    //var foo = require("foo-library");
    var https = require('https');
    var querystring = require('querystring');

    // The main node definition - most things happen in here
    function RSComponentsApiNode(n) {
        // Create a RED node
        RED.nodes.createNode(this,n);

        // Store local copies of the node configuration (as defined in the .html)
        this.topic = n.topic;

        // copy "this" object in case we need it in context of callbacks of other functions.
        var node = this;

        // Do whatever you need to do in here - declare callbacks etc
        // Note: this sample doesn't do anything much - it will only send
        // this message once at startup...
        // Look at other real nodes for some better ideas of what to do....
        var msg = {};
        msg.topic = this.topic;
        msg.payload = "Hello world !"

        // send out the message to the rest of the workspace.
        // ... this message will get sent at startup so you may not see it in a debug node.
        this.send(msg);

        // respond to inputs....
        this.on('input', function (msg) {

          msg.payload.product = {};

          if(msg.payload.apiKey != undefined &&
             msg.payload.nodeKey != undefined &&
             msg.payload.skuNumber != undefined) {

              var endpoint = 'api.webservices-rs.com';

              var postData = querystring.stringify({
                'Sku': msg.payload.skuNumber,
                'Quantity': '',
                'ApiKey': msg.payload.apiKey,
                'Node': msg.payload.nodeKey
              });

              var options = {
                hostname: endpoint,
                port: 443,
                path: '/api/product/get',
                method: 'POST',
                headers: {
                  'Content-Type': 'application/x-www-form-urlencoded',
                  'Content-Length': Buffer.byteLength(postData)
                }
              };

              var request = https.request(options, function(resp) {
                console.log('Got response: ', res.statusCode);
                // consume response body
                resp.setEncoding('utf8');
                resp.on('data', function(chunk) {
                  //return the Product to the user
                  msg.payload.product = chunk;
                  return node.send(msg);
                });
                resp.on('end', function() {
                  console.log('end')
                })
              }).on('error', function(e) {
                console.log('Got error: ', e);
              });

              request.write(postData);
              request.end();

             }
        });

        this.on("close", function() {
            // Called when the node is shutdown - eg on redeploy.
            // Allows ports to be closed, connections dropped etc.
            // eg: node.client.disconnect();
        });
    }

    // Register the node by name. This must be called before overriding any of the
    // Node functions.
    RED.nodes.registerType("rs-product-api", RSComponentsApiNode);

}
