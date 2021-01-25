import { TestBed } from '@angular/core/testing';
import { MatSnackBar } from '@angular/material/snack-bar';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { AuthError } from '../models';
import { NotificationService } from './notification.service';

describe('NotificationService', () => {
  const message = 'Test message';
  let service: NotificationService;
  let snackBarSpy: jasmine.SpyObj<MatSnackBar>;

  beforeEach(() => {
    snackBarSpy = jasmine.createSpyObj('MatSnackBar', ['open']);

    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        { provide: MatSnackBar, useValue: snackBarSpy },
      ],
    });

    service = TestBed.inject(NotificationService);
  });

  const assert = () => {
    expect(snackBarSpy.open).toHaveBeenCalledOnceWith(message, 'Ok', { duration: 2000 });
  };

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should show message', () => {
    service.showMessage(message);
    assert();
  });

  it('should handle error', () => {
    throwError({ message })
      .pipe(catchError((e: AuthError) => service.handleError(e)))
      .subscribe(
        () => fail(),
        (e: AuthError) => {
          expect(e.message).toBe(message);
          assert();
        }
      );
  });
});
