import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';

import { firebaseUser } from '../mocks';
import { AuthGuard } from './auth.guard';
import { AuthService } from './auth.service';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let routerServiceSpy: jasmine.SpyObj<Router>;
  let route: ActivatedRouteSnapshot;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser']);
    routerServiceSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthGuard,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: Router, useValue: routerServiceSpy },
      ],
    });

    guard = TestBed.inject(AuthGuard);
    route = new ActivatedRouteSnapshot();
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('redirect', () => {
    it('should redirect to login when user is guest', () => {
      authServiceSpy.getCurrentUser.and.returnValue(of(null as any));

      (guard.canActivate(route) as Observable<boolean>).subscribe((isLoggedIn: boolean) => {
        expect(isLoggedIn).toBeFalse();
        expect(routerServiceSpy.navigate).toHaveBeenCalledWith(['login'], { queryParams: undefined });
      });
    });

    it('should redirect to login when user is not confirmed', () => {
      authServiceSpy.getCurrentUser.and.returnValue(of(firebaseUser));

      (guard.canActivate(route) as Observable<boolean>).subscribe((isLoggedIn: boolean) => {
        expect(isLoggedIn).toBeFalse();
        expect(routerServiceSpy.navigate).toHaveBeenCalledWith(['login'], { queryParams: undefined });
      });
    });
  });

  it('should resolve', () => {
    authServiceSpy.getCurrentUser.and.returnValue(of({ ...firebaseUser, emailVerified: true }));

    (guard.canActivate(route) as Observable<boolean>).subscribe((isLoggedIn: boolean) => {
      expect(isLoggedIn).toBeTrue();
    });
  });
});
