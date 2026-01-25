import { Injectable } from '@angular/core';
import { SharedService } from './shared.service';

@Injectable({
  providedIn: 'root',
})
export class DocsService {
  constructor(private sharedService: SharedService) {}

  showSuccessMsg(actionType: string, docName: string = 'Document') {
    let message: string;

    switch (actionType) {
      case 'release':
        message = `${docName} released successfully`;
        break;
      case 'add':
        message = `${docName} created successfully`;
        break;
      default:
        message = `${docName} updated successfully`;
    }

    this.sharedService.successSwallModel(message);
  }

  showErrorMsg(error: any) {
    const errorMsg = this.extractErrorMessage(error);
    this.sharedService.errorSwallModel(`${errorMsg}`);
  }

  showWarningMsg(error: any) {
    const warnMsg = this.extractErrorMessage(error);
    this.sharedService.waringSwallModel(`${warnMsg}`);
  }

  private extractErrorMessage(error: unknown): string {
    // Backend error handle
    const backendMessage = (error as any)?.error?.error?.message?.value;

    if (backendMessage) {
      return backendMessage;
    }

    // Custom error handle
    if (typeof error === 'string') {
      return error;
    }

    // Native Error (thrown in code)
    if (error instanceof Error) {
      return error.message;
    }

    // HttpErrorResponse or other objects with message
    if ((error as any)?.message) {
      return (error as any).message;
    }

    return 'Something went wrong. Please try again.';
  }
}
