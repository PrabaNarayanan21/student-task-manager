import {Component,OnInit,ChangeDetectorRef} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {Router,RouterModule,ActivatedRoute} from '@angular/router';
import { TaskService } from '../../../core/services/task';
import { Priority } from '../../../core/enums/task-priority.enum';
import { TaskItemStatus } from '../../../core/enums/task-status.enum';

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule,FormsModule,RouterModule],
  templateUrl: './task-form.html',
  styleUrl: './task-form.css'
})
export class TaskForm implements OnInit {

  // FORM FIELDS

  title: string = '';

  description: string = '';

  dueDate: string = '';

  taskTime: string = '';

  priority: Priority = Priority.Low;

  status: TaskItemStatus =
    TaskItemStatus.Pending;
  
  category: string = '';

  // EDIT MODE

  isEditMode = false;

  taskId: string = '';

  // DROPDOWNS

  priorityOptions = [
    {
      label: 'Low',
      value: Priority.Low
    },
    {
      label: 'Medium',
      value: Priority.Medium
    },
    {
      label: 'High',
      value: Priority.High
    }
  ];

  statusOptions = [
    {
      label: 'Pending',
      value: TaskItemStatus.Pending
    },
    {
      label: 'In Progress',
      value: TaskItemStatus.InProgress
    },
    {
      label: 'Completed',
      value: TaskItemStatus.Completed
    }
  ];
  categoryOptions = [
  'Assignment',
  'Exam',
  'Personal',
  'Project',
  'Other'
];

  // UI STATE

  isSubmitting = false;

  errorMessage: string = '';

  constructor(
    private taskService: TaskService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.taskId =this.route.snapshot.paramMap.get('id') || '';

    if (this.taskId) {
      this.isEditMode = true;
      this.loadTask();
    }
  }

  // LOAD TASK FOR EDIT

  loadTask(): void {

    this.taskService.getTaskById(this.taskId).subscribe({
      next: (response: any) => {
        const task = response.data;
        this.title = task.title;
        this.description =task.description || '';
        this.priority =task.priority;
        this.status =task.status;
        this.category = task.category || '';
        this.dueDate = task.dueDate ; 
        this.taskTime = task.dueTime ;

        this.cdr.detectChanges();
      },

      error: (error: any) => {
        console.error(error);
        this.errorMessage ='Failed to load task';
      }
      });
  }

  // SUBMIT

  onSubmit(): void {
    this.errorMessage = '';
    // VALIDATION
    if (!this.title.trim()) {
      this.errorMessage ='Title is required';
      return;
    }

    if (!this.dueDate) {
      this.errorMessage = 'Due date is required';
      return;
    }

    if (this.title.length > 100) {
      this.errorMessage ='Title must be less than 100 characters';
      return;
    }

    this.isSubmitting = true; 
    
    // PAYLOAD
  const payload = {
      title: this.title.trim(), //removes leading or trailing spaces
      description: this.description.trim() || null,
      dueDate: this.dueDate || null,
      dueTime: this.taskTime || null,
      priority: Number(this.priority), //converts to number
      status: Number(this.status),
      category: this.category || null
};

    console.log('Submitting payload:', payload);

    // EDIT MODE

    if (this.isEditMode) {
      this.taskService.updateTask(this.taskId,payload).subscribe({
        next: (response: any) => {
          this.isSubmitting = false;
          this.cdr.detectChanges();
          alert('Task updated successfully');
          this.router.navigate(['/dashboard']);
          },

        error: (error: any) => {
          this.isSubmitting = false;
          this.cdr.detectChanges();
          this.errorMessage = 'Failed to update task';
          }
        });
    }

    // CREATE MODE

    else {
  this.taskService.createTask(payload).subscribe({
    next: (response: any) => {
      this.isSubmitting = false;
      this.cdr.detectChanges();
      this.router.navigate(['/dashboard']);
    },
    error: (error: any) => {
      this.isSubmitting = false;
      this.cdr.detectChanges();
      if (error.error &&error.error.message) {
        this.errorMessage =error.error.message;
      } 
      else if (error.status === 400) {
        this.errorMessage ='Invalid task data';
      } 
      else if (error.status === 401) {
        this.errorMessage ='You must login first';
      } 
      else {
        this.errorMessage ='Failed to create task';
      }
      }
    });
    }
  }

// RESET FORM
resetForm(): void {
  this.title = '';
  this.description = '';
  this.dueDate = '';
  this.priority = Priority.Low;
  this.status = TaskItemStatus.Pending;
  this.taskTime = '';
  this.category = '';
  this.errorMessage = '';
} 
}