export interface Room {
  id: string;
}

export interface User {
  id: string;
  name: string;
}

export async function getRoom(
  roomId: string
): Promise<{ room: Room; users: User[] }> {
  const response = await fetch(`http://localhost:3000/rooms/${roomId}`);

  if (!response.ok) {
    throw new Error("Failed to get room");
  }

  return response.json();
}

export async function createRoom(username: string) {
  const response = await fetch("http://localhost:3000/rooms", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ username }),
  });

  if (!response.ok) {
    throw new Error("Failed to create room");
  }

  return await response.json();
}

export async function updateUsername(
  roomId: string,
  userId: string,
  name: string
) {
  const response = await fetch(
    `http://localhost:3000/rooms/${roomId}/users/${userId}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name }),
    }
  );

  if (!response.ok) {
    throw new Error("Failed to update username");
  }
}
