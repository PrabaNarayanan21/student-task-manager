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
isOverdue(dueDate: any): boolean {

  if (!dueDate) {
    return false;
  }

  return new Date(dueDate) < new Date();
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


get upcomingTasks(): Task[] {
  const now = new Date();
  const in7 = new Date();
  in7.setDate(now.getDate() + 7);

  return this.allTasks
    .filter(t => t.status !== 2 && t.dueDate && new Date(t.dueDate as any) <= in7)
    .sort((a, b) => new Date(a.dueDate as any).getTime() - new Date(b.dueDate as any).getTime());
}

isDueToday(dueDate: any): boolean {
  if (!dueDate) return false;
  return new Date(dueDate as any).toDateString() === new Date().toDateString();
}

getDeadlineLabel(task: Task): string {
  const now = new Date();
  const due = new Date(task.dueDate as any);
  const diff = Math.ceil((due.getTime() - now.getTime()) / 86400000);

  if (due < now) return 'Overdue';
  if (this.isDueToday(task.dueDate)) return 'Today';
  if (diff === 1) return 'Tomorrow';
  return `In ${diff} days`;
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
