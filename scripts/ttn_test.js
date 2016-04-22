/*
 * ttn_test.js -- Receives Packets from LoRaWAN Nodes via TheThingsNetwork
 * Author: Chris Merck
 * April 2016
 *
 * NOTE: This is running on TTN's demonstration architecture,
 *  with an external MQTT->REST adaptor. This will need to be modified
 *  for TTN release V1.0 in Summer 2016.
 */

/* 
   First we define some utility functions for converting between Base64 and Hex
   Thanks to @coder hacker on StackOverflow
   http://stackoverflow.com/a/23190164/1908146
 */
var tableStr = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
var table = tableStr.split("");
atob = function (base64) {
  if (/(=[^=]+|={3,})$/.test(base64)) throw new Error("String contains an invalid character");
  base64 = base64.replace(/=/g, "");
  var n = base64.length & 3;
  if (n === 1) throw new Error("String contains an invalid character");
  for (var i = 0, j = 0, len = base64.length / 4, bin = []; i < len; ++i) {
    var a = tableStr.indexOf(base64[j++] || "A"), b = tableStr.indexOf(base64[j++] || "A");
    var c = tableStr.indexOf(base64[j++] || "A"), d = tableStr.indexOf(base64[j++] || "A");
    if ((a | b | c | d) < 0) throw new Error("String contains an invalid character");
    bin[bin.length] = ((a << 2) | (b >> 4)) & 255;
    bin[bin.length] = ((b << 4) | (c >> 2)) & 255;
    bin[bin.length] = ((c << 6) | d) & 255;
  };
  return String.fromCharCode.apply(null, bin).substr(0, bin.length + n - 4);
};
btoa = function (bin) {
  for (var i = 0, j = 0, len = bin.length / 3, base64 = []; i < len; ++i) {
    var a = bin.charCodeAt(j++), b = bin.charCodeAt(j++), c = bin.charCodeAt(j++);
    if ((a | b | c) > 255) throw new Error("String contains an invalid character");
    base64[base64.length] = table[a >> 2] + table[((a << 4) & 63) | (b >> 4)] +
      (isNaN(b) ? "=" : table[((b << 2) & 63) | (c >> 6)]) +
      (isNaN(b + c) ? "=" : table[c & 63]);
  }
  return base64.join("");
};
function hexToBase64(str) {
  return btoa(String.fromCharCode.apply(null,
    str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" "))
  );
}
function base64ToHex(str) {
  for (var i = 0, bin = atob(str.replace(/[ \r\n]+$/, "")), hex = []; i < bin.length; ++i) {
    var tmp = bin.charCodeAt(i).toString(16);
    if (tmp.length === 1) tmp = "0" + tmp;
    hex[hex.length] = tmp;
  }
  return hex.join(" ");
}


/*
   Next we handle the incomming packet from TheThingsNetwork,
*/


// Parse MQTT packet from TheThingsNetwork
mqtt_pkt = JSON.parse(request.rawBody);
mqtt_pkt.message = JSON.parse(mqtt_pkt.message);

topic_toks = mqtt_pkt.topic.split("/");
if (topic_toks[0] == 'gateways') {
  // got gateway status packet
} else if (topic_toks[0] == 'nodes') {
  // got node data packet
  // decode the base64 data field
  mqtt_pkt.message.data_ascii = base64ToHex(mqtt_pkt.message.data);
  
  /*
   Now you do whatever you want with the packet from your node.
   For now we just return the packet data structure.
  */
  
} else {
  // error: unrecognized MQTT topic
}

return mqtt_pkt;
