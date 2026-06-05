import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TaskService } from '../../../core/services/task';
import { Router } from '@angular/router';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css'
})
export class Calendar implements OnInit {

  allTasks: any[] = [];
  selectedDate: string | null = null;
  selectedDateTasks: any[] = [];
  calendarCells: any[] = [];

  dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  private currentYear = new Date().getFullYear();
  private currentMonth = new Date().getMonth();

  constructor(
    private taskService: TaskService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadTasks();
  }

  loadTasks(): void {
    this.taskService.getTasks().subscribe({
      next: (response: any) => {
        this.allTasks = response.data || [];
        this.buildCalendar();
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error(err)
    });
  }

  buildCalendar(): void {
    const today = new Date();
    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();

    const cells: any[] = [];

    // Empty cells before first day
    for (let i = 0; i < firstDay; i++) {
      cells.push({ day: null });
    }

    // Day cells
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = this.toDateStr(this.currentYear, this.currentMonth, d);
      const dayTasks = this.getTasksForDate(dateStr);

      const dots = dayTasks.map(t => this.getDotColor(t));

      cells.push({
        day: d,
        dateStr,
        dots,
        isToday: today.getFullYear() === this.currentYear &&
                 today.getMonth() === this.currentMonth &&
                 today.getDate() === d,
        isSelected: this.selectedDate === dateStr
      });
    }

    this.calendarCells = cells;
  }

  selectDate(cell: any): void {
    this.selectedDate = cell.dateStr;
    this.selectedDateTasks = this.getTasksForDate(cell.dateStr);
    this.buildCalendar();
    this.cdr.detectChanges();
  }

  getTasksForDate(dateStr: string): any[] {
    return this.allTasks.filter(t => {
      if (!t.dueDate) return false;
      return new Date(t.dueDate).toISOString().split('T')[0] === dateStr;
    });
  }

  toDateStr(year: number, month: number, day: number): string {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  }

  prevMonth(): void {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.selectedDate = null;
    this.selectedDateTasks = [];
    this.buildCalendar();
  }

  nextMonth(): void {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.selectedDate = null;
    this.selectedDateTasks = [];
    this.buildCalendar();
  }

  getMonthTitle(): string {
    const months = ['January','February','March','April','May','June',
                    'July','August','September','October','November','December'];
    return `${months[this.currentMonth]} ${this.currentYear}`;
  }

  getDotColor(task: any): string {
    if (task.status !== 2 && task.dueDate && new Date(task.dueDate) < new Date()) return '#ef4444';
    if (task.status === 2) return '#10b981';
    if (task.status === 1) return '#f59e0b';
    return '#6c63ff';
  }

  getTaskCardClass(task: any): string {
    if (task.status !== 2 && task.dueDate && new Date(task.dueDate) < new Date()) return 'card-overdue';
    if (task.status === 2) return 'card-completed';
    if (task.status === 1) return 'card-progress';
    return 'card-pending';
  }

  // ✅ New — filters by currently viewed month
getMonthTasks(): any[] {
  return this.allTasks.filter(t => {
    if (!t.dueDate) return false;
    const d = new Date(t.dueDate);
    return d.getFullYear() === this.currentYear &&
           d.getMonth() === this.currentMonth;
  });
}

  getOverdueCount(): number {
    return this.getMonthTasks().filter(t =>
      t.status !== 2 && new Date(t.dueDate) < new Date()
    ).length;
  }

  getCompletedCount(): number {
    return this.getMonthTasks().filter(t => t.status === 2).length;
  }

  getPendingCount(): number {
    return this.getMonthTasks().filter(t => t.status === 0).length;
  }
  
  getStatusText(status: number): string {
    switch(status) {
      case 0: return 'Pending';
      case 1: return 'In Progress';
      case 2: return 'Completed';
      default: return 'Unknown';
    }
  }

  getStatusClass(status: number): string {
    switch(status) {
      case 0: return 'pending-status';
      case 1: return 'progress-status';
      case 2: return 'completed-status';
      default: return '';
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    this.router.navigate(['/login']);
  }
}