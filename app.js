"use strict"

const express = require("express");
const bodyParser = require('body-parser');
const http = require('http');
const path = require('path');

const ip = require('ip');
const ipInt = require('ip-to-int');

const app = express();

const server = http.createServer(app);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(__dirname));

app.get("/", function(req,res){
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.render("index.jade",{ title: "Calculo de Subredes", basenet: '' });
});

app.use(express.static(path.join(__dirname,'public')));
app.set("views",__dirname + "/views");
app.set("css",__dirname + "/css");
app.set("img",__dirname + "/img");


// Create an HTTP service.
server.listen(4000);

app.post("/", function(req, res){
	var basenet = req.body.basenet;

	let result   = ip.cidrSubnet(basenet)
	let subnets  = result.subnetMaskLength
	let numhosts = result.numHosts

	res.render('index.jade', { basenet: basenet, subnets: subnets, numHosts: numhosts })
});

/**
   dotted-quad IP to integer.
*/
function dotquadToDecimal(ipString) {
  var [byte1, byte2, byte3, byte4] = ipString.split('.', 4);
  return parseFloat(byte1 * Math.pow(2, 24)) /* 2^24 */ +
    parseFloat(byte2 * Math.pow(2, 16)) /* 2^16 */ +
    parseFloat(byte3 * 256) /* 2^8  */ +
    parseFloat(byte4);
}

/**
   Integer IP to dotted-quad.
*/
function ipToDotquad(strnum) {
  var byte1 = strnum >>> 24;
  var byte2 = (strnum >>> 16) & 255;
  var byte3 = (strnum >>> 8) & 255;
  var byte4 = strnum & 255;
  return byte1 + "." + byte2 + "." + byte3 + "." + byte4;
}

/**
 * Calculates details of a CIDR subnet
 */
function getMaskRange(ipNum, cidr) {
  var prefixMask = getPrefixMask(cidr);
  var lowMask = getMask(32 - cidr);
  var ipLow = (ipNum & prefixMask) >>> 0;
  var ipHigh = (((ipNum & prefixMask) >>> 0) + lowMask) >>> 0;

  return {
    // ipLow: ipLow,
    ipLowStr: ipToDotquad(ipLow),

    // ipHigh: ipHigh,
    ipHighStr: ipToDotquad(ipHigh),

    prefixMask: prefixMask,
    prefixMaskStr: ipToDotquad(prefixMask),
    cidr: cidr,

    invertedMask: lowMask,
    invertedMaskStr: ipToDotquad(lowMask),
    invertedSize: 32 - cidr
  };
}

/**
 * Creates a bitmask with maskSize leftmost bits set to one.
 */
function getPrefixMask(cidr) {
  var mask = 0;
  for (var i = 0; i < cidr; i++) {
    mask += 1 << (32 - (i + 1)) >>> 0;
  }
  return mask;
}

/**
 * Creates a bitmask with maskSize rightmost bits set to one
 */
function getMask(maskSize) {
  var mask = 0;
  for (var i = 0; i < maskSize; i++) {
    mask += 1 << i >>> 0;
  }
  return mask;
}