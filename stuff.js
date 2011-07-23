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

function pointInCircle(x, y) {
    return dist(x,y, this.x,this.y)<this.size;
}

// right now only bounding circles, because multiple shapes are dumb
// useful for figuring out influences
function intersectCircles(node) {
    return dist(this.x,this.y,node.x,node.y)<(this.influence+node.size);
}

var collideFunc = [pointInCircle, pointInSquare];

function generateSignal() {
  for (var i = 0; i < this.inputNodes.length; i++) {
    var node = this.inputNodes[i];
    this.inputs[i] = node.generateSignal.call(node);
  }
  return this.modifySignal.call(this);
}

function Node(x, y, shape, modifySignal, opts) {
    if(opts == undefined) {
        opts = {};
    }
    this.x = x;
    this.y = y;
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
    // input signals
    this.inputs = [];
    // input nodes
    this.inputNodes = [];
    this.generateSignal = generateSignal;
}

Node.prototype = {
};

var freqIdx = 0;
var freqs = [344.53, 465.1155, 1033.59, 689.06];
function make_random_osc(x, y) {
  var harmonic = Math.floor(Math.random()*5) + 1;
  return makeOsc(x, y, freqs[freqIdx++ % freqs.length], /*harmonic*/ 1);
}

var bpm = 120;

var nodeList = [];

function addNode(n) {
  nodeList.push(n);
  return n;
}

function removeNode(i) {
  var node = nodeList[i];
  nodeList.splice(i, 1);
}
