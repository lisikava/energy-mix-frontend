import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EnergyService {
  constructor(private http: HttpClient) {}
  private baseUrl = 'https://energy-mix-backend-97o6.onrender.com/api/energy';

  private getUserTimezone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  getDailyAverages(): Observable<AverageMix[]> {
    return this.http.get<AverageMix[]>(`${this.baseUrl}/mix`, {
      params: { timezone: this.getUserTimezone() }
    });
  }

  getChargingWindow(hours: number): Observable<OptimalWindowResponse> {
    return this.http.get<OptimalWindowResponse>(`${this.baseUrl}/charging-window`, {
      params: { hours: hours.toString(), timezone: this.getUserTimezone() }
    });
  }

  
}

export interface AverageMix {
  date: string;
  average: Record<string, number>;
  cleanEnergyPercentage: number;
}

export interface OptimalWindowResponse {
  from: string;
  to: string;
  percentage: number;
}