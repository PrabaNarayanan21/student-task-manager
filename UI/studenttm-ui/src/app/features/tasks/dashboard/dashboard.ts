import { Component,OnInit,ChangeDetectorRef } from '@angular/core';

import { CommonModule } from '@angular/common';

import { RouterModule, Router } from '@angular/router';

import { TaskService } from '../../../core/services/task';

import { Task } from '../../../core/models/task.model';

import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule,FormsModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css']
})
export class Dashboard implements OnInit {
  user = { name: localStorage.getItem('username') || 'User'};
  tasks: Task[] = []; //currently displayed tasks - change when filters applied
  allTasks: Task[] = []; //a permanent copy of all tasks from API - never filtered, used to reset filters and apply new ones
  isLoading = true; //starts as true to show loading spinner until API response is received
  today: Date = new Date(); //current date - used for overdue and due today calculations
  searchTerm: string = ''; //bound to search input via [(ngModel)]
  selectedCategory: string = 'all'; //default to show all categories

  categoryOptions = [
    'Assignment',
    'Exam',
    'Personal',
    'Project',
    'Other'
  ]; //for filter dropdown - can be expanded in the future

  // Productivity tracking variables
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
    private taskService: TaskService,  //injecting the TaskService to make API calls
    private cdr: ChangeDetectorRef,    //injecting ChangeDetectorRef to manually trigger change detection 
    private router: Router             //navigate btwn pages
  ) {}

  ngOnInit(): void {
    this.loadTasks(); 
    this.loadStreak();
  }

loadTasks(): void {
  this.isLoading = true;

  this.taskService.getTasks().subscribe({
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
  const confirmDelete = confirm('Are you sure you want to delete this task?');

  if (!confirmDelete) return;

  this.taskService.deleteTask(id).subscribe({
    next: () => {
      this.tasks = this.tasks.filter(task => task.id !== id);
      this.calculateProductivity();
      alert('Task deleted successfully');
    },
    error: (error: any) => {
      console.error(error);
      alert('Failed to delete task');
    }
  });
}
// ui navigation methods
editTask(id: string): void {
  this.router.navigate(['/tasks/edit', id]);  // http://localhost:4200/tasks becomes http://localhost:4200/tasks/edit/123 when id=123

}
navigateToCreateTask(): void {
this.router.navigate(['/tasks/create']);      // http://localhost:4200/tasks becomes http://localhost:4200/tasks/create
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

//Filter Methods

loadPendingTasks(): void {
  this.taskService.getPendingTasks().subscribe({
    next: (response: any) => {
      this.tasks = [...response.data];
      this.cdr.detectChanges();
    },
    error: (error: any) => { console.error(error); }
  });
}

loadInProgressTasks(): void {
 this.taskService.getInProgressTasks().subscribe({
    next: (response: any) => {
      this.tasks = [...response.data];
      this.cdr.detectChanges();
    },
    error: (error: any) => { console.error(error); }
  });
}

loadCompletedTasks(): void {
 this.taskService.getCompletedTasks().subscribe({
    next: (response: any) => {
      this.tasks = [...response.data];
      this.cdr.detectChanges();
    },
    error: (error: any) => { console.error(error); }
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
  this.tasks = [...this.allTasks];   //restores tasks from allTasks which is never filtered, so it always has the complete list of tasks from the API
}

showTodayTasks(): void {
  const today = new Date().toDateString();
  this.tasks = this.allTasks.filter(task => {
    return new Date(task.createdAt).toDateString() === today;
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

//Getter -auto recalculates when tasks, searchTerm, or selectedCategory changes and returns the filtered list of tasks to display 
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
  yesterday.setDate(yesterday.getDate() - 1);

  const todayTasks =this.tasks.filter(task => {
    const createdDate =new Date(task.createdAt);
    return (createdDate.toDateString() ===today.toDateString());
  });

  const yesterdayTasks =this.tasks.filter(task => {
    const createdDate =new Date(task.createdAt);
    return (createdDate.toDateString() ===yesterday.toDateString());
  });

  this.todayTotalTasks =todayTasks.length;

  this.todayCompletedTasks =todayTasks.filter(t => t.status === 2).length;

  this.yesterdayTotalTasks =yesterdayTasks.length;

  this.yesterdayCompletedTasks =yesterdayTasks.filter(t => t.status === 2).length;

  this.todayCompletionRate =this.todayTotalTasks === 0? 0
    : Math.round(
          (
            this.todayCompletedTasks /
            this.todayTotalTasks
          ) * 100
        );

  this.yesterdayCompletionRate =this.yesterdayTotalTasks === 0? 0
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

// Toggle task status between completed and pending when checkbox is clicked in the UI
toggleTaskStatus(task: Task): void {

  const updatedTask = {
    ...task,    //copy all fields first
    status:      task.status === 2? 0: 2  //if currently completed(2), set to pending(0). If currently pending(0) or in progress(1), set to completed(2)
  }; //all other fields preserved only status changes

  this.taskService.updateTask(task.id, updatedTask).subscribe({
    next: () => {
      task.status =updatedTask.status;
      this.calculateProductivity();
      this.cdr.detectChanges();
      },

    error: (error) => {
      console.error(error);
      alert('Failed to update task status');
    }});
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
      if (!task.dueDate) return false; // Skip tasks without due dates
      return task.dueDate <= nextWeekStr || this.isOverdue(task); // Show tasks due within the next week or overdue tasks
    })
    .sort((a, b) => {
      // Sort by due date first, then by time
      if (a.dueDate !== b.dueDate) { // If due dates are different, sort by due date
        return a.dueDate!.localeCompare(b.dueDate!); //
      }
      if (a.dueTime && b.dueTime) { // If due dates are the same and both have due times, sort by due time
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
