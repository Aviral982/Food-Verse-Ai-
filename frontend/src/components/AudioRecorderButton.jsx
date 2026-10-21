import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Trash2, Volume2 } from 'lucide-react';
import { AudioRecorder } from '../utils/audioRecorder';

export default function AudioRecorderButton({ onAudioCaptured, onAudioCleared, disabled }) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordSeconds, setRecordSeconds] = useState(0);
  const [recordedAudio, setRecordedAudio] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  const recorderRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (recorderRef.current) {
        recorderRef.current.cancel();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  const handleStart = async () => {
    setErrorMessage('');
    try {
      const recorder = new AudioRecorder();
      recorderRef.current = recorder;
      await recorder.start();
      setIsRecording(true);
      setRecordSeconds(0);
      
      timerRef.current = setInterval(() => {
        setRecordSeconds((s) => s + 1);
      }, 1000);
    } catch (err) {
      setErrorMessage(err.message || 'Could not start microphone recording.');
      setIsRecording(false);
    }
  };

  const handleStop = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (!recorderRef.current) return;

    try {
      const result = await recorderRef.current.stop();
      setIsRecording(false);
      if (result) {
        setRecordedAudio(result);
        if (onAudioCaptured) {
          onAudioCaptured(result.file);
        }
      }
    } catch (err) {
      setErrorMessage('Failed to finalize audio recording.');
      setIsRecording(false);
    }
  };

  const handleClear = () => {
    if (recordedAudio?.url) {
      URL.revokeObjectURL(recordedAudio.url);
    }
    setRecordedAudio(null);
    setRecordSeconds(0);
    setErrorMessage('');
    if (onAudioCleared) {
      onAudioCleared();
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        {!isRecording && !recordedAudio && (
          <button
            type="button"
            disabled={disabled}
            onClick={handleStart}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-emerald-500/40 transition-colors disabled:opacity-50"
          >
            <Mic className="w-4 h-4 text-emerald-400" />
            <span>Add Voice Context</span>
          </button>
        )}

        {isRecording && (
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-xl bg-rose-500/10 border border-rose-500/40 text-rose-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span className="text-xs font-mono font-medium">Recording {formatTime(recordSeconds)}</span>
            <button
              type="button"
              onClick={handleStop}
              className="p-1 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 transition-colors"
              title="Stop Recording"
            >
              <Square className="w-3.5 h-3.5 fill-current" />
            </button>
          </div>
        )}

        {recordedAudio && (
          <div className="inline-flex items-center gap-3 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
            <Volume2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <audio src={recordedAudio.url} controls className="h-7 w-48 max-w-[200px]" />
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
              title="Remove voice note"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {errorMessage && (
        <p className="text-xs text-rose-400">{errorMessage}</p>
      )}
    </div>
  );
}

