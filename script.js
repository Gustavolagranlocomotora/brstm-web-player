// script.js
let audioContext;
let sourceNode;
let analyser;
let canvas = document.getElementById('visualizer');
let ctx = canvas.getContext('2d');
let loopEnabled = false;

document.getElementById('fileInput').addEventListener('change', handleFile);
document.getElementById('playBtn').addEventListener('click', () => sourceNode?.start(0));
document.getElementById('pauseBtn').addEventListener('click', () => sourceNode?.stop());
document.getElementById('loopBtn').addEventListener('click', () => loopEnabled = !loopEnabled);

document.getElementById('retroTheme').addEventListener('click', () => document.body.className = 'retro');
document.getElementById('modernTheme').addEventListener('click', () => document.body.className = 'modern');

function handleFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  // Use FFmpeg WASM to convert BRSTM to WAV (pseudo-code)
  // You’ll need to integrate ffmpeg.wasm and configure it properly
  convertBRSTMtoWAV(file).then(wavBlob => {
    playAudio(wavBlob);
  });
}

function playAudio(blob) {
  audioContext = new AudioContext();
  blob.arrayBuffer().then(buffer => {
    audioContext.decodeAudioData(buffer, decoded => {
      sourceNode = audioContext.createBufferSource();
      sourceNode.buffer = decoded;
      sourceNode.loop = loopEnabled;

      analyser = audioContext.createAnalyser();
      sourceNode.connect(analyser);
      analyser.connect(audioContext.destination);

      sourceNode.start(0);
      visualize();
    });
  });
}

function visualize() {
  analyser.fftSize = 256;
  const bufferLength = analyser.frequencyBinCount;
  const dataArray = new Uint8Array(bufferLength);

  function draw() {
    requestAnimationFrame(draw);
    analyser.getByteFrequencyData(dataArray);

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const barWidth = (canvas.width / bufferLength) * 2.5;
    let x = 0;

    for (let i = 0; i < bufferLength; i++) {
      const barHeight = dataArray[i];
      ctx.fillStyle = `rgb(${barHeight + 100},50,50)`;
      ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
      x += barWidth + 1;
    }
  }

  draw();
}
