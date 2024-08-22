import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ResponseData } from '../models';
import { catchError, map } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TokenAuthService {
  constructor(private _http: HttpClient) {}

  public auth(authToken: string) {
    const URL = 'http://localhost:8080/check-token';
    const headers = new HttpHeaders({
      accept: 'application/json',
      'Content-Type': 'application/json',
    });
    const requestBody = { 'auth-token': authToken };
    return this._http.post<ResponseData>(URL, requestBody, { headers }).pipe(
      map((response) => {
        // Check if the API response indicates failure
        if (response.success === false) {
          console.error('Authentication failed:', response);
          // Handle the failure (e.g., by throwing an error or returning a specific message)
          throw new Error('Authentication failed');
        }
        return response;
      }),
      catchError((error) => {
        console.error('Error during auth:', error);
        return throwError(error);
      })
    );
  }
}
