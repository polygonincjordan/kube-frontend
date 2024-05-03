export const StatusFlags = {
  Success: 1,
  Failed: 2,
  AlreadyExists: 3,
  DependencyExists: 4,
  NotPermitted: 5
};

export class ApiResponse<T> {
  data: T;
  message: string;
  status: number;
}

export const eMessageType = {
  Error: 'Error',
  Success: 'Success',
  Info: 'Info',
  Warning: 'Warn',
};

export const eMessageIcon = {
  Error: "error",
  Success: 'success',
  Info: 'info',
  Warning: 'warning',
};

