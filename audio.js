var bufSize = 8192;
var sampleRate = 44100.0;

var output = new Audio();

if ( typeof output.mozSetup === 'function' ) {
  output.mozSetup(1, sampleRate, 1);
}

var audioWriter = function(s) {
  if (s != null)
    output.mozWriteAudio(s);
}

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

var HomeNode = new Node(0, 0, Circle, mixInputs);

function generateAudio() {
  var homeNode = nodeList[0];
  audioWriter(homeNode.generateSignal.call(homeNode));
}

///////////

function makeOsc(x, y, freq, harmonic) {
  var osc = new Node(x, y, Square, function() {return this.signal; });
  osc.dsp = new Oscillator(Oscillator.sine, freq*harmonic, 1/harmonic, bufSize, sampleRate);
  osc.signal = osc.dsp.generate();
  return osc;
}

nodeList.push(HomeNode);