import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { TaskService } from '../../../core/services/task';
import { RouterModule, Router } from '@angular/router';
import { Task } from '../../../core/models/task.model';
import { ToastrService } from 'ngx-toastr';       //  toastr for errors
import { Subject, of } from 'rxjs';               
import { takeUntil, catchError } from 'rxjs/operators'; 
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, RouterModule,ConfirmDialog],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css'
})
export class Calendar implements OnInit, OnDestroy { 

  allTasks: Task[] = [];
  selectedDate: string | null = null;
  selectedDateTasks: Task[] = [];
  calendarCells: any[] = [];

  dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  private currentYear = new Date().getFullYear();
  private currentMonth = new Date().getMonth();

  private destroy$ = new Subject<void>();

  showLogoutDialog = false;


  constructor(
    private taskService: TaskService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService 
  ) {}

  ngOnInit(): void {
    this.loadTasks(); 
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTasks(): void {
    this.taskService.getTasks().pipe(
      catchError(err => {
        this.toastr.error(err.message);
        return of([]);
      }),
      takeUntil(this.destroy$) 
    ).subscribe(tasks => {
      this.allTasks = tasks;
      this.buildCalendar();
      this.cdr.detectChanges();
    });
  }


  buildCalendar(): void {
    const today = new Date();
    const firstDay = new Date(this.currentYear, this.currentMonth, 1).getDay();
    const daysInMonth = new Date(this.currentYear, this.currentMonth + 1, 0).getDate();

    const cells: any[] = [];

    for (let i = 0; i < firstDay; i++) {
      cells.push({ day: null });
    }

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

  getTasksForDate(dateStr: string): Task[] {
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
    if (this.currentMonth === 0) { this.currentMonth = 11; this.currentYear--; }
    else { this.currentMonth--; }
    this.selectedDate = null;
    this.selectedDateTasks = [];
    this.buildCalendar();
  }

  nextMonth(): void {
    if (this.currentMonth === 11) { this.currentMonth = 0; this.currentYear++; }
    else { this.currentMonth++; }
    this.selectedDate = null;
    this.selectedDateTasks = [];
    this.buildCalendar();
  }

  getMonthTitle(): string {
    const months = ['January','February','March','April','May','June',
                    'July','August','September','October','November','December'];
    return `${months[this.currentMonth]} ${this.currentYear}`;
  }

  isOverdue(task: Task): boolean {
    if (task.status === 2) return false;
    if (!task.dueDate) return false;
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    if (task.dueDate < today) return true;
    if (task.dueDate === today && task.dueTime && task.dueTime < currentTime) return true;
    return false;
  }

  getDotColor(task: Task): string {
    if (this.isOverdue(task)) return '#ef4444';
    if (task.status === 2) return '#10b981';
    if (task.status === 1) return '#f59e0b';
    return '#6c63ff';
  }

  getTaskCardClass(task: any): string {
    if (this.isOverdue(task)) return 'card-overdue';
    if (task.status === 2) return 'card-completed';
    if (task.status === 1) return 'card-progress';
    return 'card-pending';
  }

  getMonthTasks(): Task[] {
    return this.allTasks.filter(t => {
      if (!t.dueDate) return false;
      const d = new Date(t.dueDate);
      return d.getFullYear() === this.currentYear && d.getMonth() === this.currentMonth;
    });
  }

  getOverdueCount(): number { return this.getMonthTasks().filter(t => this.isOverdue(t)).length; }
  getCompletedCount(): number { return this.getMonthTasks().filter(t => t.status === 2).length; }
  getPendingCount(): number { return this.getMonthTasks().filter(t => t.status === 0).length; }

  getStatusText(status: number): string {
    switch (status) {
      case 0: return 'Pending';
      case 1: return 'In Progress';
      case 2: return 'Completed';
      default: return 'Unknown';
    }
  }

  getStatusClass(status: number): string {
    switch (status) {
      case 0: return 'pending-status';
      case 1: return 'progress-status';
      case 2: return 'completed-status';
      default: return '';
    }
  }

  addTask(): void {
  this.router.navigate(
    ['/tasks/create'],
    { queryParams: { date: this.selectedDate } }
  );
}

 isPastDate(dateStr: string): boolean {
  const today = new Date().toISOString().split('T')[0];
  return dateStr < today;
}

toggleTaskStatus(task: Task): void {
  const updatedTask = {
    ...task,
    status: task.status === 2 ? 0 : 2
  };

  this.taskService.updateTask(task.id, updatedTask).subscribe({
    next: () => {
      task.status = updatedTask.status;
      this.buildCalendar(); 
      this.cdr.detectChanges();
      this.toastr.success(
        task.status === 2
          ? 'Task marked as completed!'
          : 'Task marked as pending!'
      );
    },
    error: () => {
      this.toastr.error('Failed to update task status');
    }
  });
}
logout(): void {
    this.showLogoutDialog = true;  
  }

  onLogoutConfirmed(): void {
    this.showLogoutDialog = false; 
    localStorage.removeItem('token');
    this.toastr.info('Logged out successfully');
    this.router.navigate(['/login']);
  }

  onLogoutCancelled(): void {
    this.showLogoutDialog = false;  
  }
  
}