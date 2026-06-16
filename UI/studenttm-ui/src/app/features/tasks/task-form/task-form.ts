import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'; // ADDED: OnDestroy
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { TaskService } from '../../../core/services/task';
import { Priority } from '../../../core/enums/task-priority.enum';
import { TaskItemStatus } from '../../../core/enums/task-status.enum';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';                          // ADDED
import { takeUntil, finalize } from 'rxjs/operators';    // ADDED

@Component({
  selector: 'app-task-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './task-form.html',
  styleUrl: './task-form.css'
})
export class TaskForm implements OnInit, OnDestroy { // ADDED: OnDestroy

  title: string = '';
  description: string = '';
  dueDate: string | null = null;
  taskTime: string | null = null;
  priority: Priority = Priority.Low;
  status: TaskItemStatus = TaskItemStatus.Pending;
  category: string = '';

  isEditMode = false;
  taskId: string = '';

  priorityOptions = [
    { label: 'Low', value: Priority.Low },
    { label: 'Medium', value: Priority.Medium },
    { label: 'High', value: Priority.High }
  ];

  statusOptions = [
    { label: 'Pending', value: TaskItemStatus.Pending },
    { label: 'In Progress', value: TaskItemStatus.InProgress },
    { label: 'Completed', value: TaskItemStatus.Completed }
  ];

  categoryOptions = ['Assignment', 'Exam', 'Personal', 'Project', 'Other'];

  isSubmitting = false;
  errorMessage: string = '';

  // ADDED: destroy$ to auto-unsubscribe all subscriptions when component is destroyed
  private destroy$ = new Subject<void>();

  constructor(
    private taskService: TaskService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.taskId = this.route.snapshot.paramMap.get('id') || '';
    if (this.taskId) {
      this.isEditMode = true;
      this.loadTask();
    }
  }

  // ADDED: emit on destroy$ so takeUntil cleans up active subscriptions
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTask(): void {
    this.taskService.getTaskById(this.taskId).pipe(
      takeUntil(this.destroy$) // ADDED: if user navigates away before response, unsubscribes
    ).subscribe({
      next: (task) => {
        // CHANGED: service returns Task directly now — no more response.data
        this.title = task.title;
        this.description = task.description || '';
        this.priority = task.priority;
        this.status = task.status;
        this.category = task.category || '';
        this.dueDate = task.dueDate;
        this.taskTime = task.dueTime;
        this.cdr.detectChanges();
      },
      error: (err: Error) => {
        // CHANGED: err.message already formatted by service's catchError
        this.toastr.error(err.message);
      }
    });
  }

  onSubmit(): void {
    this.errorMessage = '';

    if (!this.title.trim()) { this.toastr.warning('Title is required'); return; }
    if (!this.dueDate) { this.toastr.warning('Due date is required'); return; }
    if (this.title.length > 100) { this.toastr.warning('Title must be less than 100 characters'); return; }

    this.isSubmitting = true;

    const payload = {
      title: this.title.trim(),
      description: this.description.trim() || null,
      dueDate: this.dueDate || null,
      dueTime: this.taskTime || null,
      priority: Number(this.priority),
      status: Number(this.status),
      category: this.category || null
    };

    if (this.isEditMode) {
      this.taskService.updateTask(this.taskId, payload).pipe(
        // ADDED: finalize — always hides the spinner, whether success or error
        finalize(() => {
          this.isSubmitting = false;
          this.cdr.detectChanges();
        }),
        takeUntil(this.destroy$) // ADDED
      ).subscribe({
        next: () => {
          this.toastr.success('Task updated successfully');
          this.router.navigate(['/dashboard']);
        },
        error: (err: Error) => {
          this.toastr.error(err.message);
        }
      });

    } else {
      this.taskService.createTask(payload).pipe(
        finalize(() => {
          this.isSubmitting = false;
          this.cdr.detectChanges();
        }),
        takeUntil(this.destroy$) // ADDED
      ).subscribe({
        next: () => {
          this.toastr.success('Task created successfully!');
          this.router.navigate(['/dashboard']);
        },
        error: (err: Error) => {
          // CHANGED: service catchError already picks the right message — just display it
          this.toastr.error(err.message);
        }
      });
    }
  }

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