import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TaskService } from '../../../core/services/task';
import { RouterModule, Router } from '@angular/router';
import { Task } from '../../../core/models/task.model';
@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css'
})
export class Calendar implements OnInit {

  allTasks: Task[] = []; // store all tasks from API
  selectedDate: string | null = null;  //stores the currently clicked date in YYYY-MM-DD format or null if nothing selected
  selectedDateTasks: Task[] = []; //tasks for the clicked date - side panel 
  calendarCells: any[] = []; //array of objects for each calendar cell with {day, dateStr, dots, isToday, isSelected} where dots is array of colors for task statuses

  dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']; // header for the calendar grid

  private currentYear = new Date().getFullYear(); // current year 
  private currentMonth = new Date().getMonth(); // current month (0-11)

  constructor(
    private taskService: TaskService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void { // load tasks and build calendar on init
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
      const dayTasks = this.getTasksForDate(dateStr); // tasks array for this date

      const dots = dayTasks.map(t => this.getDotColor(t)); //converts each task to a color string

      cells.push({
        day: d,
        dateStr,
        dots,
        isToday: today.getFullYear() === this.currentYear &&  //same year
                 today.getMonth() === this.currentMonth &&    //same month
                 today.getDate() === d,                       //same day
        isSelected: this.selectedDate === dateStr             //is this currently selected date?
      });
    }

    this.calendarCells = cells;
  }

  selectDate(cell: any): void {  //called when user clicks a date cell
    this.selectedDate = cell.dateStr; 
    this.selectedDateTasks = this.getTasksForDate(cell.dateStr);
    this.buildCalendar(); 
    this.cdr.detectChanges();
  }

  getTasksForDate(dateStr: string): Task[] {
    return this.allTasks.filter(t => {
      if (!t.dueDate) return false; // ignore tasks without due date
      return new Date(t.dueDate).toISOString().split('T')[0] === dateStr; //compare dates
    });
  }
  
  toDateStr(year: number, month: number, day: number): string {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  }

  prevMonth(): void {
    if (this.currentMonth === 0) { //Jan
      this.currentMonth = 11;      //Dec
      this.currentYear--;          //go back one year
    } else {
      this.currentMonth--;         //go back one month
    }
    this.selectedDate = null;
    this.selectedDateTasks = [];
    this.buildCalendar();
  }

  nextMonth(): void {
    if (this.currentMonth === 11) { //Dec
      this.currentMonth = 0;        //Jan
      this.currentYear++;           //go forward one year
    } else {
      this.currentMonth++;          //go forward one month
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
  isOverdue(task: Task): boolean {
    if (task.status === 2) return false; // Completed tasks are not overdue
    if (!task.dueDate) return false;
    
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    
    // If due date is in the past
    if (task.dueDate < today) return true;
    
    // If due date is today AND due time has passed
    if (task.dueDate === today && task.dueTime && task.dueTime < currentTime) return true;
    
    return false;
  }

  getDotColor(task: Task): string {
    if (this.isOverdue(task)) return '#ef4444';
    if (task.status === 2) return '#10b981';
    if (task.status === 1) return '#f59e0b';
    return '#6c63ff';
  }

  getTaskCardClass(task: any): string { //card background color
    if (this.isOverdue(task)) return 'card-overdue';
    if (task.status === 2) return 'card-completed';
    if (task.status === 1) return 'card-progress';
    return 'card-pending';
  }

  getMonthTasks(): any[] {
  return this.allTasks.filter(t => {
    if (!t.dueDate) return false;    //task without a duedate cannot belong to a month
    const d = new Date(t.dueDate); 
    return d.getFullYear() === this.currentYear &&
           d.getMonth() === this.currentMonth;
  });
} 

  getOverdueCount(): number {
    return this.getMonthTasks().filter(t =>
      this.isOverdue(t)
    ).length;
  }

  getCompletedCount(): number {
    return this.getMonthTasks().filter(t => t.status === 2).length;
  }

  getPendingCount(): number {
    return this.getMonthTasks().filter(t => t.status === 0).length;
  }
  
  getStatusText(status: number): string {  //status label
    switch(status) {
      case 0: return 'Pending';
      case 1: return 'In Progress';
      case 2: return 'Completed';
      default: return 'Unknown';
    }
  }

  getStatusClass(status: number): string {  //status text color
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