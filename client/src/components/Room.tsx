import React, { useEffect, useState } from "react";
import { createRoom } from "../services/api";
import { openWebSocket } from "../services/websocket";

const Room: React.FC = () => {
  const [roomId, setRoomId] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const handleWebSocketMessage = (data: string) => {
      setMessage(data);
    };

    const createAndOpenRoom = async () => {
      const roomId = await createRoom();
      setRoomId(roomId);
      return openWebSocket(roomId, handleWebSocketMessage);
    };

    console.log("Creating and opening room...");
    createAndOpenRoom();

    return () => {
      // Clean up WebSocket connection if component unmounts
      // ...
    };
  }, []);

  return (
    <div>
      <h1>Room {roomId}</h1>
      <p>{message}</p>
    </div>
  );
};

export default Room;
