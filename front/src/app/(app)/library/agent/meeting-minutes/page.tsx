'use client';

import { useState, useRef } from 'react';
import { Mic, Square } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';


export default function MeetingMinutesPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [text, setText] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = e => {
        chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('audio', audioBlob);

        try {
          const response = await fetch('/api/agent/meeting-minutes', {
            method: 'POST',
            body: formData,
          });
          const text = await response.json();
          setText(text);
        } catch (error) {
          console.error('Error sending audio:', error);
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-800">
          議事録作成エージェント
        </h1>
        <p className="text-gray-600 mt-2">
          会議を録音し、議事録を作成します。
        </p>
      </div>

      <div className="flex flex-col h-[62vh]">
        <Card className="flex-grow overflow-hidden flex flex-col gap-0 p-0">
          <CardContent className="p-8 flex-grow overflow-y-auto space-y-3">
            {text === null ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Mic className="h-12 w-12 mb-2 stroke-1" />
              <p>「録音開始」ボタンをクリックして会議をはじめましょう！</p>
            </div>
            ) : (
              <p className="text-md whitespace-pre-wrap">{text}</p>
            )}
          </CardContent>
        </Card>
      </div>
      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={isRecording ? stopRecording : startRecording}
          className={`flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 rounded-full font-medium transition-all ${
            isRecording
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {isRecording ? (
            <>
              <Square className="h-5 w-5" />
              <span>録音終了</span>
            </>
          ) : (
            <>
              <Mic className="h-5 w-5" />
              <span>録音開始</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
