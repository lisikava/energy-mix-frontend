import { Component, inject, signal, viewChildren, ElementRef, afterRenderEffect} from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AverageMix, EnergyService, OptimalWindowResponse } from '../energy-service';
import { Chart, registerables } from 'chart.js';

import {MatCardModule} from '@angular/material/card';
import {MatButtonModule} from '@angular/material/button';
import {MatInputModule} from '@angular/material/input';
import {MatFormFieldModule} from '@angular/material/form-field';

Chart.register(...registerables);

@Component({
  selector: 'app-dashboard',
  imports: [DecimalPipe, DatePipe, MatCardModule, FormsModule, MatButtonModule, MatInputModule, MatFormFieldModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard {
  private energyService = inject(EnergyService);
  dailyData = signal<AverageMix[]>([]);
  errorMessage = signal<string | null>(null);
  canvasRefs = viewChildren<ElementRef<HTMLCanvasElement>>('chartCanvas');
  private chartInstances: Chart[] = [];

  chargingHours = signal<number>(3);
  optimalWindow = signal<OptimalWindowResponse | null>(null);

  constructor() {
    this.energyService.getDailyAverages().subscribe({
      next: (data) => this.dailyData.set(data)
    });

    afterRenderEffect({
      mixedReadWrite: () => {
        const data = this.dailyData();
        const canvases = this.canvasRefs();
        if (data.length > 0 && canvases.length > 0) {
          this.renderCharts(data, canvases);
        }
      }
    });
  }

  calculateBestWindow(): void {
    this.errorMessage.set(null);
    this.energyService.getChargingWindow(this.chargingHours()).subscribe({
      next: (res) => this.optimalWindow.set(res),
      error: (err) => this.errorMessage.set(err.error?.message || 'Calculation error.')
    });
  }
  

  private renderCharts(data: AverageMix[], canvases: ReadonlyArray<ElementRef<HTMLCanvasElement>>): void {
    this.chartInstances.forEach(chart => chart.destroy());
    this.chartInstances = [];

    data.forEach((day, index) => {
      const ctx = canvases[index].nativeElement.getContext('2d');
      if (!ctx) return;

      const labels = Object.keys(day.average);
      const values = Object.values(day.average);

      const chart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            data: values,
            backgroundColor: ['#7be27e', '#147bcf', '#FFEB3B', '#f3a125', '#9C27B0', '#540d11', '#607D8B', '#E91E63', '#00BCD4']
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { position: 'bottom' } }
        }
      });
      this.chartInstances.push(chart);
    });
  }

}
