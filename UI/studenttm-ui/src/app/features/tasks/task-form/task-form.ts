import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import {ReactiveFormsModule,FormBuilder,FormGroup,Validators} from '@angular/forms';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { TaskService } from '../../../core/services/task';
import { Priority } from '../../../core/enums/task-priority.enum';
import { TaskItemStatus } from '../../../core/enums/task-status.enum';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';                          
import { takeUntil, finalize } from 'rxjs/operators';   

@Component({
  selector: 'app-task-form', 
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './task-form.html',
  styleUrl: './task-form.css'
})
export class TaskForm implements OnInit, OnDestroy { 

  taskForm!: FormGroup;
  isEditMode = false;
  taskId: string = '';
  today: string = '';

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

  // destroy$ - auto-unsubscribe all subscriptions when component is destroyed
  private destroy$ = new Subject<void>();

  constructor(
    private taskService: TaskService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private toastr: ToastrService,
    private fb: FormBuilder
  ) {}

ngOnInit(): void {

  this.today = new Date().toISOString().split('T')[0];

  this.taskForm = this.fb.group({
    title: [
      '',
      [
        Validators.required,
        Validators.maxLength(100)
      ]
    ],
    description: [''],
    category: [''],
    dueDate: [
      '',
      [
    Validators.required,
    this.pastDateValidator()
  ]
    ],
    dueTime: [''],
    priority: [
      Priority.Low
    ],
    status: [
      TaskItemStatus.Pending
    ]
  });

  this.taskId = this.route.snapshot.paramMap.get('id') || '';
  
  // Check for date from calendar 
  const dateFromCalendar = this.route.snapshot.queryParamMap.get('date');
  if (dateFromCalendar) {
    this.taskForm.patchValue({ dueDate: dateFromCalendar });
  } 

  // Then check if in edit mode
  if (this.taskId) { 
    this.isEditMode = true;
    this.loadTask();
  }
} 
  //emit on destroy$ so takeUntil cleans up active subscriptions
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadTask(): void {

  this.taskService
    .getTaskById(this.taskId)
    .pipe(
      takeUntil(this.destroy$)
    )
    .subscribe({

      next: (task) => {

        this.taskForm.patchValue({

          title: task.title,

          description:
            task.description || '',

          category:
            task.category || '',

          dueDate:
            task.dueDate,

          dueTime:
            task.dueTime,

          priority:
            task.priority,

          status:
            task.status
        });

        this.cdr.detectChanges();
      },

      error: (err: Error) => {

        this.toastr.error(
          err.message
        );
      }
    });
}

  onSubmit(): void {
    this.errorMessage = '';

    if (this.taskForm.invalid) {

  this.taskForm.markAllAsTouched();

  return;
}
    this.isSubmitting = true;

    const payload = {
  ...this.taskForm.value,

  title:
    this.taskForm.value.title.trim(),

  description:
    this.taskForm.value.description?.trim() || null,

  category:
    this.taskForm.value.category || null,

  dueDate:
    this.taskForm.value.dueDate || null,

  dueTime:
    this.taskForm.value.dueTime || null,

  priority:
    Number(this.taskForm.value.priority),

  status:
    Number(this.taskForm.value.status)
};

    if (this.isEditMode) {
      this.taskService.updateTask(this.taskId, payload).pipe(
        // finalize — always hides the spinner, whether success or error
        finalize(() => {
          this.isSubmitting = false;
          this.cdr.detectChanges();
        }),
        takeUntil(this.destroy$) 
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
        takeUntil(this.destroy$) 
      ).subscribe({
        next: () => {
          this.toastr.success('Task created successfully!');
          this.router.navigate(['/dashboard']);
        },
        error: (err: Error) => {
          this.toastr.error(err.message);
        }
      });
    }
  }

  pastDateValidator() {
  return (control: any) => {

    if (!control.value) {
      return null;
    }

    const selectedDate = new Date(control.value);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return selectedDate < today 
      ? { pastDate: true }
      : null;
  };
}

  resetForm(): void {
    this.taskForm.reset();
  }
} 
 