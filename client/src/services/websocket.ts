export function openWebSocket(
  roomId: string,
  onMessage: (message: string) => void
) {
  const socket = new WebSocket(`ws://localhost:3000/rooms/${roomId}`);

  socket.onopen = () => {
    console.log("WebSocket connection opened");
  };

  socket.onmessage = (event) => {
    const message = event.data;
    onMessage(message);
  };

  socket.onclose = () => {
    console.log("WebSocket connection closed");
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
  };

  return socket;
}
