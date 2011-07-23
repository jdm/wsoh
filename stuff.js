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

function dist(x1,y1, x2,y2) {
    return Math.sqrt(Math.pow(x2-x1,2)+Math.pow(y2-y1,2));
}

function pointInCircle(x, y) {
    return dist(x,y, this.x,this.y)<this.size;
}

// right now only bounding circles, because multiple shapes are dumb
// useful for figuring out influences
function intersectCircles(node) {
    return dist(this.x,this.y,node.x,node.y)<(node.influence+this.influence);
}

var collideFunc = [pointInCircle, pointInSquare];

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
    this.inputNodes = [];
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