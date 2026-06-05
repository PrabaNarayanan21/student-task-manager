import {
  Component,
  OnInit,
  ChangeDetectorRef
} from '@angular/core';

import { CommonModule } from '@angular/common';

import { RouterModule, Router }
from '@angular/router';

import { TaskService }
from '../../../core/services/task';

import { Task }
from '../../../core/models/task.model';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule,FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
user = {
  name: localStorage.getItem('username') || 'User'
};
  tasks: Task[] = [];
  allTasks: Task[] = [];
  isLoading = true;
  today: Date = new Date();
  searchTerm: string = '';
  selectedCategory: string = 'all';

  categoryOptions = [
    'Assignment',
    'Exam',
    'Personal',
    'Project',
    'Other'
  ];
  todayTotalTasks = 0;
  todayCompletedTasks = 0;
  todayCompletionRate = 0;

  yesterdayTotalTasks = 0;
  yesterdayCompletedTasks = 0;
  yesterdayCompletionRate = 0;

  productivityDifference = 0;
  absoluteDifference = 0;

  streakCount: number = 0;


  constructor(
    private taskService: TaskService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {

    this.loadTasks();
    this.loadStreak();
  }

  loadTasks(): void {

    this.isLoading = true;

    this.taskService.getTasks()
      .subscribe({

        next: (response: any) => {

          this.tasks = response.data || [];
          this.allTasks = [...this.tasks];

          this.calculateProductivity();

          this.isLoading = false;

          this.cdr.detectChanges();
        },

        error: (error: any) => {

          console.error(error);

          this.isLoading = false;

          this.cdr.detectChanges();
        }
      });
  }

  deleteTask(id: string): void {

  const confirmDelete =
    confirm('Are you sure you want to delete this task?');

  if (!confirmDelete) {
    return;
  }

  this.taskService
    .deleteTask(id)
    .subscribe({

      next: () => {

        this.tasks =
          this.tasks.filter(
            task => task.id !== id
          );

        this.calculateProductivity();

        alert('Task deleted successfully');
      },

      error: (error: any) => {

        console.error(error);

        alert('Failed to delete task');
      }
    });
}
editTask(id: string): void {

  this.router.navigate(
    ['/tasks/edit', id]
  );
}
  navigateToCreateTask(): void {

    this.router.navigate(['/tasks/create']);
  }

  getPendingCount(): number {

    return this.tasks.filter(
      t => t.status === 0
    ).length;
  }

  getInProgressCount(): number {

    return this.tasks.filter(
      t => t.status === 1
    ).length;
  }

  getCompletedCount(): number {

    return this.tasks.filter(
      t => t.status === 2
    ).length;
  }

  getHighPriorityCount(): number {

    return this.tasks.filter(
      t => t.priority === 2
    ).length;
  }

  getPriorityText(priority: number): string {

    switch(priority) {

      case 0:
        return 'Low';

      case 1:
        return 'Medium';

      case 2:
        return 'High';

      default:
        return 'Unknown';
    }
  }

  getStatusText(status: number): string {

    switch(status) {

      case 0:
        return 'Pending';

      case 1:
        return 'In Progress';

      case 2:
        return 'Completed';

      default:
        return 'Unknown';
    }
  }

  logout(): void {

  localStorage.removeItem('token');

  this.router.navigate(['/login']);
}

  loadPendingTasks(): void {

  this.taskService.getPendingTasks()
    .subscribe({

      next: (response: any) => {

        this.tasks = [...response.data];
        this.cdr.detectChanges();
      },

      error: (error: any) => {

        console.error(error);
      }
    });
}

loadInProgressTasks(): void {

  this.taskService.getInProgressTasks()
    .subscribe({

      next: (response: any) => {

        this.tasks = [...response.data];
        this.cdr.detectChanges();
      },

      error: (error: any) => {

        console.error(error);
      }
    });
}

loadCompletedTasks(): void {

  this.taskService.getCompletedTasks()
    .subscribe({

      next: (response: any) => {

        this.tasks = [...response.data];
        this.cdr.detectChanges();
      },

      error: (error: any) => {

        console.error(error);
      }
    });
}

loadTasksByPriority(): void {

  this.taskService.getTasksSortedByPriority()
    .subscribe({

      next: (response: any) => {

        this.tasks = [...response.data];
        this.cdr.detectChanges(); 
      },

      error: (error: any) => {

        console.error(error);
      }
    });
}

showAllTasks(): void {

  this.tasks = [...this.allTasks];
}
showTodayTasks(): void {

  const today =
    new Date().toDateString();

  this.tasks =
    this.allTasks.filter(task => {

      return (
        new Date(task.createdAt)
          .toDateString()
        ===
        today
      );
    });
    
}

isOverdue(task: Task): boolean {
  if (!task.dueDate) return false;
  
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  // If due date is in the past
  if (task.dueDate < today) return true;
  
  // If due date is today and has time that's passed
  if (task.dueDate === today && task.dueTime && task.dueTime < currentTime) return true;
  
  return false;
}

isDueToday(task: Task): boolean {
  if (!task.dueDate) return false;
  const today = new Date().toISOString().split('T')[0];
  return task.dueDate === today;
}


get filteredTasks(): Task[] {
  let result = this.tasks;

  // category filter
  if (this.selectedCategory !== 'all') {
    result = result.filter(t => t.category === this.selectedCategory);
  }

  // search filter
  if (this.searchTerm.trim()) {
    const term = this.searchTerm.toLowerCase();
    result = result.filter(t =>
      t.title.toLowerCase().includes(term) ||
      (t.description && t.description.toLowerCase().includes(term))
    );
  }

  return result;
}

filterByCategory(cat: string): void {
  this.selectedCategory = cat;
  this.cdr.detectChanges();
}

getCategoryClass(category: string | null): string {
  switch(category) {
    case 'Assignment': return 'cat-assignment';
    case 'Exam':       return 'cat-exam';
    case 'Personal':   return 'cat-personal';
    case 'Project':    return 'cat-project';
    case 'Other':      return 'cat-other';
    default:           return 'cat-other';
  }
}

private calculateProductivity(): void {

  const today = new Date();

  const yesterday = new Date();

  yesterday.setDate(
    yesterday.getDate() - 1
  );

  const todayTasks =
    this.tasks.filter(task => {

      const createdDate =
        new Date(task.createdAt);

      return (
        createdDate.toDateString() ===
        today.toDateString()
      );
    });

  const yesterdayTasks =
    this.tasks.filter(task => {

      const createdDate =
        new Date(task.createdAt);

      return (
        createdDate.toDateString() ===
        yesterday.toDateString()
      );
    });

  this.todayTotalTasks =
    todayTasks.length;

  this.todayCompletedTasks =
    todayTasks.filter(
      t => t.status === 2
    ).length;

  this.yesterdayTotalTasks =
    yesterdayTasks.length;

  this.yesterdayCompletedTasks =
    yesterdayTasks.filter(
      t => t.status === 2
    ).length;

  this.todayCompletionRate =
    this.todayTotalTasks === 0
      ? 0
      : Math.round(
          (
            this.todayCompletedTasks /
            this.todayTotalTasks
          ) * 100
        );

  this.yesterdayCompletionRate =
    this.yesterdayTotalTasks === 0
      ? 0
      : Math.round(
          (
            this.yesterdayCompletedTasks /
            this.yesterdayTotalTasks
          ) * 100
        );

  this.productivityDifference =
    this.todayCompletionRate -
    this.yesterdayCompletionRate;

  this.absoluteDifference =
    Math.abs(
      this.productivityDifference
    );
}
toggleTaskStatus(task: Task): void {

  const updatedTask = {

    ...task,

    status:
      task.status === 2
        ? 0
        : 2
  };

  this.taskService
    .updateTask(task.id, updatedTask)
    .subscribe({

      next: () => {

        task.status =
          updatedTask.status;

        this.calculateProductivity();

        this.cdr.detectChanges();
      },

      error: (error) => {

        console.error(error);

        alert(
          'Failed to update task status'
        );
      }
    });
}

getFormattedDueDateTime(task: Task): string {
  if (!task.dueDate) return 'No due date';
  
  if (task.dueTime) {
    return `${task.dueDate} at ${task.dueTime}`;
  }
  return task.dueDate;
}
getDeadlineLabel(task: Task): string {
  if (!task.dueDate) return 'No deadline';
  
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
  
  if (this.isOverdue(task)) {
    if (task.dueDate === today) {
      return `Overdue (was due at ${task.dueTime})`;
    }
    return 'Overdue';
  }
  
  if (task.dueDate === today) {
    if (task.dueTime) {
      return `Due today at ${task.dueTime}`;
    }
    return 'Due today';
  }
  
  // Calculate days difference
  const dueDate = new Date(task.dueDate);
  const todayDate = new Date(today);
  const diffDays = Math.ceil((dueDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays <= 7) return `In ${diffDays} days`;
  
  return `Due on ${task.dueDate}`;
}

get upcomingTasks(): Task[] {
  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const nextWeek = new Date();
  nextWeek.setDate(nextWeek.getDate() + 7);
  const nextWeekStr = nextWeek.toISOString().split('T')[0];
  
  return this.allTasks
    .filter(task => {
      if (task.status === 2) return false; // Skip completed
      if (!task.dueDate) return false;
      return task.dueDate <= nextWeekStr || this.isOverdue(task);
    })
    .sort((a, b) => {
      // Sort by due date first, then by time
      if (a.dueDate !== b.dueDate) {
        return a.dueDate!.localeCompare(b.dueDate!);
      }
      if (a.dueTime && b.dueTime) {
        return a.dueTime.localeCompare(b.dueTime);
      }
      return 0;
    });
}





loadStreak(): void {
  this.taskService.getStreak().subscribe({
    next: (response: any) => {
      this.streakCount = response.data;
      this.cdr.detectChanges();
    },
    error: (error: any) => {
      console.error(error);
    }
  });
}

}
