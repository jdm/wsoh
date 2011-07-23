/* -*- tab-width: 8; indent-tabs-mode: nil; c-basic-offset: 2 -*- */

var bufSize = /*1024*/8192;
var sampleRate = 44100;
var bufferTime = Math.floor(1000 / (sampleRate / bufSize));

var output = new Audio();

if ( typeof output.mozSetup === 'function' ) {
  output.mozSetup(1, sampleRate, 1);
}

var silence = new Float32Array(bufSize);

var audioWriter = function(s) {
  output.mozWriteAudio([]);
  if (s != null)
    output.mozWriteAudio(s);
  else
    output.mozWriteAudio(silence);
}

//////////////////////////

function mixInputs() {
  if (!this.inputs.length) {
    return null;
  }

  this.mixedSignal = new Float32Array(this.inputs[0].length);
  for (var i = 0; i < this.inputs.length; i++) {
    this.mixedSignal = DSP.mixSampleBuffers(this.mixedSignal, this.inputs[i], 2%i === 0, this.inputs.length);
  }
  return this.mixedSignal;
}

var HomeNode = new Node(0, 0, Circle, mixInputs, {acceptMultipleInputs: true});

nodeList.push(HomeNode);

/////////////

function generateAudio() {
  //console.log("---");
  var homeNode = nodeList[0];
  audioWriter(homeNode.generateSignal.call(homeNode));
}

///////////

function makeSimpleOsc(x, y, type, freq, harmonic) {
  var osc = new Node(x, y, Square, function() {return this.signal;}, {acceptInput: false});
  osc.dsp = new Oscillator(type, freq*harmonic, 1/harmonic, bufSize, sampleRate);
  osc.signal = osc.dsp.generate();
  return osc;
}

function makeSineOsc(x, y, freq, harmonic) {
  return makeSimpleOsc(x, y, DSP.SINE, freq, harmonic);
}

function makeSawOsc(x, y, freq, harmonic) {
  return makeSimplOsc(x, y, DSP.SAW, freq, harmonic);
}

function makeSquareOsc(x, y, freq, harmonic) {
  return makeSimplOsc(x, y, DSP.SQUARE, freq, harmonic);
}

function makeTriangleOsc(x, y, freq, harmonic) {
  return makeSimplOsc(x, y, DSP.TRIANGLE, freq, harmonic);
}

///////////

function makeSquareWave(x, y, freq) {
  var sq = new Node(x, y, Square, function() {return this.signal;}, {acceptInput: false});
  sq.dsp = new Oscillator(DSP.SINCE, freq, 1, bufSize, sampleRate);
  for (var i = 1; i <= 5; i++) {
    var h = new Oscillator(DSP.SINE, freq*(i*2), 1/(i*2), bufSize, sampleRate);
    h.generate();
    sq.dsp.add(h);
  }
  sq.signal = sq.dsp.signal;
  return sq;
}

//////////

function gateSignal() {
  if (this.inputs[0] && Math.floor(Math.random() * 100) > this.percent)
    return this.inputs[0];
  return silence;
}

function makeGate(x, y, percent) {
  var n = new Node(x, y, Circle, gateSignal);
  n.percent = percent;
  return n;
}
