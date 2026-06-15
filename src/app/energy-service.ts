import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class EnergyService {
  constructor(private http: HttpClient) {}
  private baseUrl = 'http://localhost:8080/api/energy';

  private getUserTimezone(): string {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  }

  getDailyAverages(): Observable<AverageMix[]> {
    return this.http.get<AverageMix[]>(`${this.baseUrl}/mix`, {
      params: { timezone: this.getUserTimezone() }
    });
  }

  
}

export interface AverageMix {
  date: string;
  average: Record<string, number>;
  cleanEnergyPercentage: number;
}