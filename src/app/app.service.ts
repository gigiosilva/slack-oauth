import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AppService {

  constructor(private http: HttpClient) {}

  url: string = 'https://slack.com/api';
  
  generateToken(code: string): any {
    return this.http.get(`${this.url}/openid.connect.token`, {
      params: {
        client_id: 'add-client-id-here',
        client_secret: 'add-client-secret-here',
        code: code,
        grant_type: 'authorization_code'
      }
    });
  }

  getUserInfo(token: string) {
    return this.http.post(`${this.url}/users.identity`, {}, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'text/plain'
      }
    });
  }
}
