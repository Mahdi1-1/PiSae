import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { AdminCreateUserRequest, User } from '../models/user.model';
import { USER_API_BASE } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class UserService {
  private readonly apiUrl = `${USER_API_BASE}/users`;

  constructor(private readonly http: HttpClient) {}

  async getAllUsers(): Promise<User[]> {
    return firstValueFrom(this.http.get<User[]>(this.apiUrl));
  }

  async getUserById(id: number): Promise<User> {
    return firstValueFrom(this.http.get<User>(`${this.apiUrl}/${id}`));
  }

  async updateUser(user: User, requestingUserId: number): Promise<User> {
    return firstValueFrom(
      this.http.put<User>(this.apiUrl, user, {
        headers: { 'X-User-Id': String(requestingUserId) },
      }),
    );
  }

  async deleteUser(id: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.apiUrl}/${id}`));
  }

  async createUser(request: AdminCreateUserRequest): Promise<User> {
    return firstValueFrom(this.http.post<User>(`${this.apiUrl}/admin/create`, request));
  }

  async setPassword(id: number, password: string): Promise<void> {
    return firstValueFrom(
      this.http.post<void>(
        `${this.apiUrl}/${id}/set-password`,
        { password },
        { responseType: 'text' as 'json' },
      ),
    );
  }

  async changePassword(id: number, oldPassword: string, newPassword: string): Promise<void> {
    return firstValueFrom(
      this.http.put<void>(`${this.apiUrl}/${id}/change-password`, {
        oldPassword,
        newPassword,
      }),
    );
  }
}
