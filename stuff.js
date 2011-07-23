var defaultInfluence = 50;

var Circle = 0;
var Square = 1;
//var Triangle = 3;

function pointInSquare(x, y) {
  return x > this.x - this.size && x < this.x + this.size &&
         y > this.y - this.size && y < this.y + this.size;
}

function pointInCircle() {
  return false; //TODO
}

var collideFunc = [pointInCircle, pointInSquare];

function generateSignal() {
  for (var i = 0; i < this.inputNodes.length; i++) {
    var node = this.inputNodes[i];
    this.inputs[i] = node.generateSignal.call(node);
  }
  return this.modifySignal.call(this);
}

function Node(x, y, shape, modifySignal) {
  this.x = x;
  this.y = y;
  this.size = 10;
  this.shape = shape;
  this.pointInShape = collideFunc[shape];
  this.colour = 255;
  this.modifySignal = modifySignal;
  this.influence = defaultInfluence;
  this.inputNodes = [];
  this.inputs = [];
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
  nodeList[0].inputNodes.push(n);
}

function removeNode(i) {
  var node = nodeList[i];
  nodeList.splice(i, 1);
  var inputNodes = nodeList[0].inputNodes;
  inputNodes.splice(inputNodes.indexOf(node), 1);
}