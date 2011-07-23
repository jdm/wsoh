/* -*- tab-width: 8; indent-tabs-mode: nil; c-basic-offset: 4 -*- */

var defaultInfluence = 50;

var Circle = 0;
var Square = 1;
//var Triangle = 3;

function pointInSquare(x, y) {
  return x > this.x - this.size && x < this.x + this.size &&
         y > this.y - this.size && y < this.y + this.size;
}

function dist(x1,y1, x2,y2) {
    return Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2));
}

function nodedist(n1, n2) {
    return dist(n1.x, n1.y, n2.x, n2.y);
}

function pointInCircle(x, y) {
    return dist(x,y, this.x,this.y)<this.size;
}

// right now only bounding circles, because multiple shapes are dumb
// useful for figuring out influences
function intersectCircles(node) {
    var d = dist(this.x,this.y,node.x,node.y);
    return d< (this.influence+node.size) || d < (node.influence+this.size);
}

var collideFunc = [pointInCircle, pointInSquare];

function generateSignal() {
  //console.log("gen " + this.id + " " + this.inputNodes.length); 
  for (var i = 0; i < this.inputNodes.length; i++) {
    var node = this.inputNodes[i];
    //console.log("subgen " + node.id);
    this.inputs[i] = node.generateSignal.call(node);
  }
  var sig = this.modifySignal.call(this);
  this.playing = sig !== silence;
  return sig;
}

var lastId = 0;

function generateIntersections(newNode) {
    var intersecting = [];
    for (var i = 0; i < nodeList.length; i++) {
        var node = nodeList[i];
        if (node.id == newNode.id)
          continue;
        if (node.intersect.call(node, newNode)) {
            intersecting.push(node);
        }
    }
    return intersecting;
}

function reconnectNode(intersecting, newNode) {
    if (intersecting.length == 0) {
      newNode.disconnect();
      return;
    }
  
    intersecting = intersecting.sort(function(a, b) {
                                      var d1 = nodedist(a, newNode);
                                      var d2 = nodedist(b, newNode);
                                      if (d1 < d2) return -1;
                                      if (d1 == d2) return 0;
                                      return 1;
                                     });
  
    var accepting = intersecting.filter(function(elem) {
                                          return elem.acceptInput;
                                        });
    var nonaccepting = intersecting.filter(function(elem) {
                                             return !elem.acceptInput;
                                           });
  
    var interesting = accepting.filter(function(elem) {
                                         return !elem.hasInConnection();
                                       });
    if (interesting.length > 0 && !newNode.hasOutConnection() &&
        !newNode.connectedTo(interesting[0])) {
      newNode.connectOutputTo(interesting[0]);
    }
    
    interesting = intersecting.filter(function(elem) {
                                        return elem.hasOutConnection();
                                      });
    if (interesting.length > 0 && !newNode.hasInConnection() &&
        !newNode.connectedTo(interesting[0]) && newNode.acceptInput) {
        interesting[0].connectOutputTo(newNode);
    }
  
    if (!newNode.hasInConnection() && newNode.acceptInput && nonaccepting.length > 0 &&
        !newNode.connectedTo(nonaccepting[0])) {
        nonaccepting[0].connectOutputTo(newNode);
    }
    if (accepting.length > 0 && !newNode.connectedTo(accepting[0]) && !newNode.hasOutConnection()) {
        newNode.connectOutputTo(accepting[0]);
    }  
}

function Node(x, y, shape, modifySignal, opts) {
    if(opts == undefined) {
        opts = {};
    }
    this.id = lastId++;
    this.x = x;
    this.y = y;
    this.playing = false;
    this.size = opts.size ?  opts.size : 10;
    this.shape = shape;
    this.pointInShape = collideFunc[shape];
    this.colour = 255;
    this.modifySignal = modifySignal;
    this.influence = opts.influence ? opts.influence : defaultInfluence;
    // bool
    this.mouseOver = false;
    // intersect fn
    this.intersect = opts.intersect ? opts.intersect : intersectCircles;
    // bool
    this.acceptInput = opts.acceptInput !== undefined ? opts.acceptInput : true;
    // bool
    this.acceptMultipleInputs = opts.acceptMultipleInputs !== undefined ? opts.acceptMultipleInputs : false;
    // input signals
    this.inputs = [];
    // input nodes
    this.inputNodes = [];
    // output node
    this.outputNode = null;
    this.generateSignal = generateSignal;

    this.connectOutputTo = function(node) {
        console.log(node ? node.id : null);
        console.log(this.outputNode ? this.outputNode.id : null);
        console.log(this.id);
        this.disconnectFrom(this.outputNode);
        this.outputNode = node;
        if (!node.acceptMultipleInputs) {
            for (var i = 0; i < node.inputNodes.length; i++) {
                node.inputNodes[i].disconnectFrom(node);
                node.inputNodes[i].outputNode = this;
            }
            node.inputNodes = [this];
        } else {
            node.inputNodes.push(this);
        }
    };
    this.disconnectFrom = function(node) {
        if (this.outputNode && this.outputNode.id == node.id) {
            var idx = this.outputNode.inputNodes.indexOf(this);
            this.outputNode.inputNodes.splice(idx, 1);
            this.outputNode.inputs.splice(idx, 1);
        }
    };
    this.disconnect = function() {
        this.disconnectFrom(this.outputNode);
        for (var i = 0; i < this.inputNodes.length; i++) {
            this.inputNodes[i].outputNode = null;
        }
        var output = this.outputNode;
        this.outputNode = null;
        if (output) {  
            var intersecting = generateIntersections(output);
            reconnectNode(intersecting, output);
        }
    };
    this.connectedTo = function(node) {
        return (this.inputNodes.indexOf(node) != -1 && node.outputNode == this) ||
               (this.outputNode == node && node.inputNodes.indexOf(this) != -1);
    };
    this.hasOutConnection = function() {
        return this.outputNode != null && this.id != nodeList[0].id;
    };
    this.hasInConnection = function() {
        return this.inputNodes.length != 0;
    };
  
    this.update = function(args) {
        //do nothing by default
    };
    this.serialize = function() {
        return {amp:this.amp};
    };
}

Node.prototype = {
};

var freqIdx = 0;
var freqs = [344.53, 465.1155, 1033.59, 689.06];
function make_random_osc(x, y) {
  var harmonic = Math.floor(Math.random()*5) + 1;
  var freq = freqs[freqIdx++ % freqs.length];
  return makeTriangleOsc(x, y, freq, /*harmonic*/ 1);
  //return makeSquareWave(x, y, freq);
}

var bpm = 120;

var nodeList = [];

function addNode(n) {
  nodeList.push(n);
  return n;
}

function removeNode(i) {
  nodeList.splice(i, 1);
}
