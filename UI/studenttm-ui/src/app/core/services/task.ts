import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import {  Observable,pipe,throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

import { Task } from '../models/task.model';

import { ApiResponse } from '../models/api-response.model';

@Injectable({ 
  providedIn: 'root' //registers with angular's dependency injection system so it can be injected into components
})

export class TaskService {

  constructor(private http: HttpClient) { }

  //one shared error handler - avoids repeating the same logic in every method

  private handleError(message: string) {
    return (err: any): Observable<never> => {
      const msg = err.status === 401 ? 'Session expired. Please login again.' : message;
      return throwError(() => new Error(msg));
    };
  }

  // GET ALL TASKS
  getTasks():Observable<Task[]> { 
      return this.http.get<ApiResponse<Task[]>>(`${environment.apiBaseUrl}/Task`).pipe(
        map(res=>res.data ?? []),
        catchError(this.handleError('Failed to load tasks'))
      );
  } 
  // CREATE NEW TASK
  createTask(task: Partial<Task>): Observable<Task> {
    return this.http.post<ApiResponse<Task>>(`${environment.apiBaseUrl}/Task`,task).pipe(
      map(res => res.data),
      catchError(this.handleError('Failed to create task'))
    );
  }
 
  //Get task by id
  getTaskById(id: string): Observable<Task> {
  return this.http.get<ApiResponse<Task>>(
    `${environment.apiBaseUrl}/Task/${id}`
  ).pipe(
    map(res => res.data),
    catchError(this.handleError('Failed to load task'))
  );
}
  
  // UPDATE TASK
updateTask(id: string, task: Partial<Task>): Observable<Task> {
  return this.http.put<ApiResponse<Task>>(
    `${environment.apiBaseUrl}/Task/${id}`,
    task
  ).pipe(
    map(res => res.data),
    catchError(this.handleError('Failed to update task'))
  );
}
  // delete task by id
  deleteTask(id: string): Observable<void> {  //<void> -> delete returns no data
  return this.http.delete<ApiResponse<void>>(
    `${environment.apiBaseUrl}/Task/${id}`
  ).pipe(
    map(() => void 0), 
    catchError(this.handleError('Failed to delete task'))
  );
}

getPendingTasks(): Observable<Task[]> {
  return this.http.get<ApiResponse<Task[]>>(
    `${environment.apiBaseUrl}/Task/pending`
  ).pipe(
    map(res => res.data ?? []),
    catchError(this.handleError('Failed to load pending tasks'))
  );
}

getInProgressTasks(): Observable<Task[]> {
  return this.http.get<ApiResponse<Task[]>>(
    `${environment.apiBaseUrl}/Task/inprogress`
  ).pipe(
    map(res => res.data ?? []),
    catchError(this.handleError('Failed to load in-progress tasks'))
  );
}

getCompletedTasks(): Observable<Task[]> {
  return this.http.get<ApiResponse<Task[]>>(
    `${environment.apiBaseUrl}/Task/completed`
  ).pipe(
    map(res => res.data ?? []),
    catchError(this.handleError('Failed to load completed tasks'))
  );
}

getTasksSortedByPriority(): Observable<Task[]> {
  return this.http.get<ApiResponse<Task[]>>(
    `${environment.apiBaseUrl}/Task/sorted-by-priority`
  ).pipe(
    map(res => res.data ?? []),
    catchError(this.handleError('Failed to load tasks sorted by priority'))
  );
}

getStreak(): Observable<number> {  //how many consecutive days user has completed at least one task
  return this.http.get<ApiResponse<number>>(`${environment.apiBaseUrl}/Task/streak`).pipe(
    map((response) => response.data ?? 0),
    catchError(this.handleError('Failed to load streak'))
  );
}

}