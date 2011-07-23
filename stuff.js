var bufSize = 8192;
var sampleRate = 44100.0;

var output = new Audio();

var audioWriter = function(s) {
  output.mozWriteAudio(s);
}

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

function Node(x, y, shape, modifySignal) {
  this.x = x;
  this.y = y;
  this.size = 10;
  this.shape = shape;
  this.pointInShape = collideFunc[shape];
  this.colour = 255;
  this.modifySignal = modifySignal;
  this.influence = defaultInfluence;
}

Node.prototype = {
};

function make_osc(x, y, freq, harmonic) {
  var osc = new Node(x, y, Square, null);
  osc.dsp = new Oscillator(Oscillator.sine, freq*harmonic, 1/harmonic, bufSize, sampleRate);
  return osc;
}

function make_random_osc(x, y) {
  var harmonic = Math.floor(Math.random()*40);
  return make_osc(x, y, 344.53, harmonic);
}

var bpm = 120;

var home = {
};
//var osc = make_osc(344.53);

var nodeList = [];