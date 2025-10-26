// useChatMessages hook
import { useMemo } from 'react';
import { Room } from 'livekit-client';
import {
  type ReceivedChatMessage,
  type TextStreamData,
  useChat,
  useRoomContext,
  useTranscriptions,
} from '@livekit/components-react';

function transcriptionToChatMessage(textStream: TextStreamData, room: Room): ReceivedChatMessage {
  console.log('Converting transcription to chat message:', textStream);
  
  return {
    id: textStream.streamInfo.id,
    timestamp: textStream.streamInfo.timestamp,
    message: textStream.text,
    from:
      textStream.participantInfo.identity === room.localParticipant.identity
        ? room.localParticipant
        : Array.from(room.remoteParticipants.values()).find(
            (p) => p.identity === textStream.participantInfo.identity
          ),
  };
}

export function useChatMessages() {
  const chat = useChat();
  const room = useRoomContext();
  const transcriptions: TextStreamData[] = useTranscriptions();
  
  console.log('useChatMessages - transcriptions:', transcriptions);
  console.log('useChatMessages - chatMessages:', chat.chatMessages);

  const mergedTranscriptions = useMemo(() => {
    const transcriptionsAsMessages = transcriptions.map((transcription) => 
      transcriptionToChatMessage(transcription, room)
    );
    
    console.log('Transcriptions as messages:', transcriptionsAsMessages);
    
    const merged: Array<ReceivedChatMessage> = [
      ...transcriptionsAsMessages,
      ...chat.chatMessages,
    ];
    
    const sorted = merged.sort((a, b) => a.timestamp - b.timestamp);
    
    console.log('Sorted merged messages:', sorted);
    
    return sorted;
  }, [transcriptions, chat.chatMessages, room]);

  return mergedTranscriptions;
}