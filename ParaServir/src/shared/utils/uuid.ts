import { randomUUID } from 'crypto';
import { UUIDv4 } from '../../domain/valueObjects/UUIDv4';

export function generateUUIDv4(): UUIDv4 {
  return new UUIDv4(randomUUID());
}

// Helper to generate UUID string directly
export function generateUUIDString(): string {
  return randomUUID();
}

