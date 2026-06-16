import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TaskService } from '../../../core/services/task';
import { Task } from '../../../core/models/task.model';
import { FormsModule } from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Subject, of } from 'rxjs';
import { finalize, catchError, tap, switchMap } from 'rxjs/operators';
import { ConfirmDialog } from '../../../shared/confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule,ConfirmDialog], //ConfirmDialog ->importing the child component
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit, OnDestroy {
  user = { name: localStorage.getItem('username') || 'User' };
  tasks: Task[] = [];
  allTasks: Task[] = [];
  isLoading = true;
  today: Date = new Date();
  searchTerm: string = '';
  selectedCategory: string = 'all';
  selectedMainFilter: string = 'all';

  categoryOptions = ['Assignment', 'Exam', 'Personal', 'Project', 'Other'];

  todayTotalTasks = 0;
  todayCompletedTasks = 0;
  todayCompletionRate = 0;
  yesterdayTotalTasks = 0;
  yesterdayCompletedTasks = 0;
  yesterdayCompletionRate = 0;
  productivityDifference = 0;
  absoluteDifference = 0;
  streakCount: number = 0;

  private destroy$ = new Subject<void>();
 
  showLogoutDialog = false;
  showDeleteDialog = false;
  taskToDelete: string = '';

  constructor(
    private taskService: TaskService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadTasks();
    this.loadStreak();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTasks(): void {
    this.isLoading = true;

    this.taskService.getTasks()
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }),
        catchError((error) => {
          console.error('Error loading tasks:', error);
          this.toastr.error('Failed to load tasks');
          return of([]);
        })
      )
      .subscribe(tasks => {
        this.tasks = tasks;
        this.allTasks = [...tasks];
        this.calculateProductivity();
        this.cdr.detectChanges();
      });
  }
  
  deleteTask(id: string): void {
    this.taskToDelete = id;        
    this.showDeleteDialog = true;  
  }

  onDeleteConfirmed(): void {
    this.showDeleteDialog = false;

    this.taskService.deleteTask(this.taskToDelete).subscribe({
      next: () => {
        this.tasks = this.tasks.filter(t => t.id !== this.taskToDelete);
        this.allTasks = this.allTasks.filter(t => t.id !== this.taskToDelete);
        this.calculateProductivity();
        this.toastr.success('Task deleted successfully');
        this.cdr.detectChanges();
      },
      error: () => {
        this.toastr.error('Failed to delete task');
      }
    });
  }

  onDeleteCancelled(): void {
    this.showDeleteDialog = false;
    this.taskToDelete = '';  
  }


  toggleTaskStatus(task: Task): void {
    const updatedTask = {
      ...task,
      status: task.status === 2 ? 0 : 2
    };

    this.taskService.updateTask(task.id, updatedTask)
      .pipe(
        tap(() => {
          task.status = updatedTask.status;
          this.calculateProductivity();
          this.cdr.detectChanges();
        }),
        catchError((error) => {
          console.error('Error updating task:', error);
          this.toastr.error('Failed to update task status');
          return of(null);
        })
      )
      .subscribe();
  }

  loadStreak(): void {
    this.taskService.getStreak()
      .pipe(
        catchError((error) => {
          console.error('Error loading streak:', error);
          return of(0);
        })
      )
      .subscribe(streak => {
        this.streakCount = streak;
        this.cdr.detectChanges();
      });
  }

  loadPendingTasks(): void {
    this.selectedMainFilter = 'pending';
    this.isLoading = true;

    this.taskService.getPendingTasks()
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }),
        catchError((error) => {
          console.error('Error loading pending tasks:', error);
          this.toastr.error('Failed to load pending tasks');
          return of([]);
        })
      )
      .subscribe(tasks => {
        this.tasks = tasks;
        this.applyFilters();
        this.cdr.detectChanges();
      });
  }

  loadInProgressTasks(): void {
    this.selectedMainFilter = 'in-progress';
    this.isLoading = true;

    this.taskService.getInProgressTasks()
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }),
        catchError((error) => {
          console.error('Error loading in-progress tasks:', error);
          this.toastr.error('Failed to load in-progress tasks');
          return of([]);
        })
      )
      .subscribe(tasks => {
        this.tasks = tasks;
        this.applyFilters();
        this.cdr.detectChanges();
      });
  }

  loadCompletedTasks(): void {
    this.selectedMainFilter = 'completed';
    this.isLoading = true;

    this.taskService.getCompletedTasks()
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }),
        catchError((error) => {
          console.error('Error loading completed tasks:', error);
          this.toastr.error('Failed to load completed tasks');
          return of([]);
        })
      )
      .subscribe(tasks => {
        this.tasks = tasks;
        this.applyFilters();
        this.cdr.detectChanges();
      });
  }

  loadTasksByPriority(): void {
    this.selectedMainFilter = 'priority';
    this.isLoading = true;

    this.taskService.getTasksSortedByPriority()
      .pipe(
        finalize(() => {
          this.isLoading = false;
          this.cdr.detectChanges();
        }),
        catchError((error) => {
          console.error('Error loading priority tasks:', error);
          this.toastr.error('Failed to load priority tasks');
          return of([]);
        })
      )
      .subscribe(tasks => {
        this.tasks = tasks;
        this.applyFilters();
        this.cdr.detectChanges();
      });
  }

  // UI Navigation Methods (No RxJS needed)
  editTask(id: string): void {
    this.router.navigate(['/tasks/edit', id]);
  }

  navigateToCreateTask(): void {
    this.router.navigate(['/tasks/create']);
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

  showAllTasks(): void {
    this.selectedMainFilter = 'all';
    this.tasks = [...this.allTasks];
    this.applyFilters();
  }

  showTodayTasks(): void {
    this.selectedMainFilter = 'today';
    const today = new Date().toDateString();
    this.tasks = this.allTasks.filter(task => {
      return new Date(task.createdAt).toDateString() === today;
    });
    this.applyFilters();
  }

  applyFilters(): void {
    let filteredTasks = [...this.allTasks];

    switch (this.selectedMainFilter) {
      case 'today':
        const today = new Date().toDateString();
        filteredTasks = filteredTasks.filter(task => 
          new Date(task.createdAt).toDateString() === today
        );
        break;
      case 'pending':
        filteredTasks = filteredTasks.filter(task => task.status === 0);
        break;
      case 'in-progress':
        filteredTasks = filteredTasks.filter(task => task.status === 1);
        break;
      case 'completed':
        filteredTasks = filteredTasks.filter(task => task.status === 2);
        break;
      case 'priority':
        filteredTasks = filteredTasks.filter(task => task.priority === 2);
        break;
      case 'all':
        filteredTasks = [...this.allTasks];
        break;
    }

    if (this.selectedCategory !== 'all') {
      filteredTasks = filteredTasks.filter(t => t.category === this.selectedCategory);
    }

    this.tasks = filteredTasks;
    this.cdr.detectChanges();
  }

  filterByCategory(cat: string): void {
    this.selectedCategory = cat;
    this.applyFilters();
  }

  get filteredTasks(): Task[] {
    let result = this.tasks;

    if (this.selectedCategory !== 'all') {
      result = result.filter(t => t.category === this.selectedCategory);
    }

    if (this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase();
      result = result.filter(t =>
        t.title.toLowerCase().includes(term) ||
        (t.description && t.description.toLowerCase().includes(term))
      );
    }

    return result;
  }

  get upcomingTasks(): Task[] {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextWeekStr = nextWeek.toISOString().split('T')[0];

    return this.allTasks
      .filter(task => {
        if (task.status === 2) return false;
        if (!task.dueDate) return false;
        return task.dueDate <= nextWeekStr || this.isOverdue(task);
      })
      .sort((a, b) => {
        if (a.dueDate !== b.dueDate) {
          return a.dueDate!.localeCompare(b.dueDate!);
        }
        if (a.dueTime && b.dueTime) {
          return a.dueTime.localeCompare(b.dueTime);
        }
        return 0;
      });
  }

  getPendingCount(): number {
    return this.tasks.filter(t => t.status === 0).length;
  }

  getInProgressCount(): number {
    return this.tasks.filter(t => t.status === 1).length;
  }

  getCompletedCount(): number {
    return this.tasks.filter(t => t.status === 2).length;
  }

  getHighPriorityCount(): number {
    return this.tasks.filter(t => t.priority === 2).length;
  }

  getPriorityText(priority: number): string {
    switch (priority) {
      case 0: return 'Low';
      case 1: return 'Medium';
      case 2: return 'High';
      default: return 'Unknown';
    }
  }

  getStatusText(status: number): string {
    switch (status) {
      case 0: return 'Pending';
      case 1: return 'In Progress';
      case 2: return 'Completed';
      default: return 'Unknown';
    }
  }

  getCategoryClass(category: string | null): string {
    switch (category) {
      case 'Assignment': return 'cat-assignment';
      case 'Exam': return 'cat-exam';
      case 'Personal': return 'cat-personal';
      case 'Project': return 'cat-project';
      default: return 'cat-other';
    }
  }

  isOverdue(task: Task): boolean {
    if (!task.dueDate) return false;
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    if (task.dueDate < today) return true;
    if (task.dueDate === today && task.dueTime && task.dueTime < currentTime) return true;
    return false;
  }

  isDueToday(task: Task): boolean {
    if (!task.dueDate) return false;
    return task.dueDate === new Date().toISOString().split('T')[0];
  }

  getFormattedDueDateTime(task: Task): string {
    if (!task.dueDate) return 'No due date';
    return task.dueTime ? `${task.dueDate} at ${task.dueTime}` : task.dueDate;
  }

  getDeadlineLabel(task: Task): string {
    if (!task.dueDate) return 'No deadline';
    const today = new Date().toISOString().split('T')[0];
    if (this.isOverdue(task)) {
      return task.dueDate === today ? `Overdue (was due at ${task.dueTime})` : 'Overdue';
    }
    if (task.dueDate === today) return 'Due today';
    const diffDays = Math.ceil((new Date(task.dueDate).getTime() - new Date(today).getTime()) / 86400000);
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `In ${diffDays} days`;
    return `Due on ${task.dueDate}`;
  }

  private calculateProductivity(): void {
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const todayTasks = this.tasks.filter(task => {
      const createdDate = new Date(task.createdAt);
      return createdDate.toDateString() === today.toDateString();
    });

    const yesterdayTasks = this.tasks.filter(task => {
      const createdDate = new Date(task.createdAt);
      return createdDate.toDateString() === yesterday.toDateString();
    });

    this.todayTotalTasks = todayTasks.length;
    this.todayCompletedTasks = todayTasks.filter(t => t.status === 2).length;
    this.yesterdayTotalTasks = yesterdayTasks.length;
    this.yesterdayCompletedTasks = yesterdayTasks.filter(t => t.status === 2).length;

    this.todayCompletionRate = this.todayTotalTasks === 0 ? 0
      : Math.round((this.todayCompletedTasks / this.todayTotalTasks) * 100);

    this.yesterdayCompletionRate = this.yesterdayTotalTasks === 0 ? 0
      : Math.round((this.yesterdayCompletedTasks / this.yesterdayTotalTasks) * 100);

    this.productivityDifference = this.todayCompletionRate - this.yesterdayCompletionRate;
    this.absoluteDifference = Math.abs(this.productivityDifference);
  }
}