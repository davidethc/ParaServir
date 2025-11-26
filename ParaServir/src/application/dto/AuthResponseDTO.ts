export class AuthResponseDTO {
  token: string;
  role: string;
  userId: string;

  constructor({ token, role, userId }: { token: string; role: string; userId: string }) {
    this.token = token;
    this.role = role;
    this.userId = userId;
  }
}

