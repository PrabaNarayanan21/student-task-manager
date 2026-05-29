import { Injectable } from '@angular/core';

import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';

import { environment } from '../../../environments/environment';

import { Task } from '../models/task.model';

import { ApiResponse } from '../models/api-response.model';

@Injectable({
  providedIn: 'root'
})
export class TaskService {

  constructor(
    private http: HttpClient
  ) { }

  // GET ALL TASKS
  getTasks():
    Observable<ApiResponse<Task[]>> { return this.http.get<ApiResponse<Task[]>>(
      `${environment.apiBaseUrl}/Task`);
  }
  // CREATE NEW TASK
  createTask(task: Partial<Task>): Observable<ApiResponse<Task>> {
    return this.http.post<ApiResponse<Task>>(
      `${environment.apiBaseUrl}/Task`,
      task
    );
  }

  //Get task by id
  getTaskById(id: string) {

  return this.http.get(
    `${environment.apiBaseUrl}/Task/${id}`
  );
}
  
  // UPDATE TASK
  updateTask(id: string, task: any) {

  return this.http.put(
    `${environment.apiBaseUrl}/Task/${id}`,
    task
  );
}
  // delete task by id
  deleteTask(id: string) {

  return this.http.delete(
    `${environment.apiBaseUrl}/Task/${id}`
  );
}

  getPendingTasks(): Observable<ApiResponse<Task[]>> {

  return this.http.get<ApiResponse<Task[]>>(
    `${environment.apiBaseUrl}/Task/pending`
  );
}

getInProgressTasks(): Observable<ApiResponse<Task[]>> {

  return this.http.get<ApiResponse<Task[]>>(
    `${environment.apiBaseUrl}/Task/inprogress`
  );
}

getCompletedTasks(): Observable<ApiResponse<Task[]>> {

  return this.http.get<ApiResponse<Task[]>>(
    `${environment.apiBaseUrl}/Task/completed`
  );
}

getTasksSortedByPriority(): Observable<ApiResponse<Task[]>> {

  return this.http.get<ApiResponse<Task[]>>(
    `${environment.apiBaseUrl}/Task/sorted-by-priority`
  );
}

}