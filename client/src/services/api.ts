export async function createRoom(): Promise<string> {
  const response = await fetch("http://localhost:3000/rooms", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username: "Thomas" }),
  });

  if (!response.ok) {
    throw new Error("Failed to create room");
  }

  const { roomId } = await response.json();
  return roomId;
}
