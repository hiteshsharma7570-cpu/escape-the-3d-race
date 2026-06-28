const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // omit confusing I/O/0/1

export function generateRoomCode(): string {
  let code = "";
  const cryptoObj = (globalThis as any).crypto;
  if (cryptoObj?.getRandomValues) {
    const bytes = new Uint8Array(6);
    cryptoObj.getRandomValues(bytes);
    for (let i = 0; i < 6; i++) code += ALPHABET[bytes[i] % ALPHABET.length];
  } else {
    for (let i = 0; i < 6; i++) code += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  }
  return code;
}

export function normalizeRoomCode(input: string): string {
  return input.trim().toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 6);
}

const KEY = (roomCode: string) => `etrr:friendsRoom:${roomCode}`;

export interface LocalRoomIdentity {
  sessionId: string;
  playerId: string;
  playerName: string;
  isHost: boolean;
}

export function saveLocalIdentity(roomCode: string, identity: LocalRoomIdentity) {
  try {
    sessionStorage.setItem(KEY(roomCode), JSON.stringify(identity));
  } catch {
    /* ignore */
  }
}

export function loadLocalIdentity(roomCode: string): LocalRoomIdentity | null {
  try {
    const raw = sessionStorage.getItem(KEY(roomCode));
    return raw ? (JSON.parse(raw) as LocalRoomIdentity) : null;
  } catch {
    return null;
  }
}

export function clearLocalIdentity(roomCode: string) {
  try {
    sessionStorage.removeItem(KEY(roomCode));
  } catch {
    /* ignore */
  }
}