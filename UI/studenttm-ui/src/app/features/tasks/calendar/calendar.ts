import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { TaskService } from '../../../core/services/task';
import { Router } from '@angular/router';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, RouterModule, FullCalendarModule],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css'
})
export class Calendar implements OnInit {

  calendarOptions: CalendarOptions = {
    plugins: [dayGridPlugin, interactionPlugin],
    initialView: 'dayGridMonth',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: ''
    },
    events: [],
    dateClick: (info) => this.onDateClick(info),
    eventClick: (info) => this.onEventClick(info),
    height: 'auto',
    eventDisplay: 'block',
    dayMaxEvents: 3
  };

  selectedDateTasks: any[] = [];
  selectedDate: string = '';
  allTasks: any[] = [];

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

        const events = this.allTasks
          .filter(task => task.dueDate)
          .map(task => ({
            id: task.id,
            title: task.title,
            date: new Date(task.dueDate).toISOString().split('T')[0],
            backgroundColor: this.getPriorityColor(task.priority),
            borderColor: this.getPriorityColor(task.priority),
            extendedProps: { task }
          }));

        this.calendarOptions = {
          ...this.calendarOptions,
          events
        };

        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error(error);
      }
    });
  }

  onDateClick(info: any): void {
    this.selectedDate = info.dateStr;
    this.selectedDateTasks = this.allTasks.filter(task => {
      if (!task.dueDate) return false;
      return new Date(task.dueDate).toISOString().split('T')[0] === info.dateStr;
    });
    this.cdr.detectChanges();
  }

  onEventClick(info: any): void {
    const task = info.event.extendedProps.task;
    this.selectedDate = new Date(task.dueDate).toISOString().split('T')[0];
    this.selectedDateTasks = this.allTasks.filter(t => {
      if (!t.dueDate) return false;
      return new Date(t.dueDate).toISOString().split('T')[0] === this.selectedDate;
    });
    this.cdr.detectChanges();
  }

  getPriorityColor(priority: number): string {
    switch(priority) {
      case 2: return '#ef4444'; // high - red
      case 1: return '#f59e0b'; // medium - amber
      case 0: return '#10b981'; // low - green
      default: return '#6c63ff';
    }
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