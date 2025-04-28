'use client';

import { useState, useRef } from 'react';
import { Mic, Square } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';


export default function SalesRolePlayPage() {
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptions, setTranscriptions] = useState<string[]>([]);
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
          const response = await fetch('/api/agent/sales-role-play', {
            method: 'POST',
            body: formData,
          });
          const text = await response.json();
          setTranscriptions(prev => [...prev, text]);
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
    <div className="flex flex-col h-[calc(100vh-96px)]">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-gray-800">
          営業ロープレエージェント
        </h1>
        <p className="text-gray-600 mt-2">
          AIエージェントとの会話で営業スキルを磨きましょう
        </p>
      </div>

      <div className="flex flex-col h-full">
        <Card className="flex-grow overflow-hidden flex flex-col gap-0 p-0">
          <CardContent className="p-4 flex-grow overflow-y-auto space-y-3">
            {transcriptions.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Mic className="h-12 w-12 mb-2 stroke-1" />
              <p>「話しかける」ボタンをクリックして会話をはじめましょう！</p>
            </div>
            ) : (
              transcriptions.map((message, index) => (
                <div
                  key={index}
                  className='flex items-start gap-3 justify-start'
                >
                  <div
                    className='rounded-lg p-4 max-w-[80%] bg-secondary text-secondary-foreground'
                  >
                    <p className="text-md whitespace-pre-wrap">{message}</p>
                  </div>
                </div>
              ))
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
              <span>話しかける</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
