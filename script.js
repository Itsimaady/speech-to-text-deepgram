let mediaRecorder;
let audioStream;
let socket;

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');
const output = document.getElementById('output');

startBtn.onclick = async () => {
  startBtn.disabled = true;
  stopBtn.disabled = false;

  audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  mediaRecorder = new MediaRecorder(audioStream);

  socket = new WebSocket('wss://api.deepgram.com/v1/listen', ['token', 'YOUR_DEEPGRAM_API_KEY_HERE']);
  
  socket.onopen = () => {
    mediaRecorder.start(250);
    mediaRecorder.ondataavailable = (e) => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(e.data);
      }
    };
  };

  socket.onmessage = (message) => {
    const data = JSON.parse(message.data);
    const transcript = data.channel?.alternatives[0]?.transcript;
    if (transcript) {
      output.value += transcript + ' ';
    }
  };
};

stopBtn.onclick = () => {
  stopBtn.disabled = true;
  startBtn.disabled = false;

  mediaRecorder.stop();
  audioStream.getTracks().forEach(track => track.stop());
  socket.close();
};
