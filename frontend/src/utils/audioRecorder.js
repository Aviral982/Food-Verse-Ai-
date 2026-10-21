/**
 * Web Audio Recorder Utility for FoodVerse AI Voice Context
 */
export class AudioRecorder {
  constructor() {
    this.mediaRecorder = null;
    this.audioChunks = [];
    this.stream = null;
    this.isRecording = false;
  }

  /**
   * Check if audio recording is supported by current browser
   */
  static isSupported() {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia && window.MediaRecorder);
  }

  /**
   * Start recording audio from microphone
   */
  async start() {
    if (!AudioRecorder.isSupported()) {
      throw new Error('Microphone audio recording is not supported in this browser.');
    }

    this.audioChunks = [];
    try {
      this.stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        throw new Error('Microphone access was denied. Please allow microphone permissions to record voice notes.');
      }
      throw new Error(`Microphone initialization failed: ${err.message}`);
    }

    // Determine supported mime type
    let mimeType = 'audio/webm';
    if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
      mimeType = 'audio/webm;codecs=opus';
    } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
      mimeType = 'audio/mp4';
    } else if (MediaRecorder.isTypeSupported('audio/ogg')) {
      mimeType = 'audio/ogg';
    }

    try {
      this.mediaRecorder = new MediaRecorder(this.stream, { mimeType });
    } catch (e) {
      this.mediaRecorder = new MediaRecorder(this.stream);
    }

    this.mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        this.audioChunks.push(event.data);
      }
    };

    this.mediaRecorder.start(250); // Slice every 250ms
    this.isRecording = true;
  }

  /**
   * Stop recording and return Audio File or Blob
   */
  async stop() {
    return new Promise((resolve, reject) => {
      if (!this.mediaRecorder || !this.isRecording) {
        resolve(null);
        return;
      }

      this.mediaRecorder.onstop = () => {
        try {
          const mimeType = this.mediaRecorder.mimeType || 'audio/webm';
          const extension = mimeType.includes('mp4') ? 'mp4' : mimeType.includes('ogg') ? 'ogg' : 'webm';
          const audioBlob = new Blob(this.audioChunks, { type: mimeType });
          const audioFile = new File([audioBlob], `voice_input_${Date.now()}.${extension}`, {
            type: mimeType,
          });

          // Stop all audio tracks to release microphone
          if (this.stream) {
            this.stream.getTracks().forEach((track) => track.stop());
            this.stream = null;
          }
          this.isRecording = false;
          resolve({ blob: audioBlob, file: audioFile, url: URL.createObjectURL(audioBlob) });
        } catch (err) {
          reject(err);
        }
      };

      this.mediaRecorder.onerror = (event) => {
        reject(new Error(`Recording error: ${event.error?.name || 'Unknown'}`));
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Cancel recording without saving
   */
  cancel() {
    if (this.mediaRecorder && this.isRecording) {
      try {
        this.mediaRecorder.stop();
      } catch (e) {}
    }
    if (this.stream) {
      this.stream.getTracks().forEach((track) => track.stop());
      this.stream = null;
    }
    this.audioChunks = [];
    this.isRecording = false;
  }
}

