import { Priority } from '../enums/task-priority.enum';

import { TaskItemStatus } from '../enums/task-status.enum';

export interface Task {

  id: string;
  title: string;
  description: string | null;
  dueDate: string | null;
  dueTime: string | null;
  priority: Priority;
  status: TaskItemStatus;
  createdAt: Date;
  category: string | null;
} 