import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot } from '@angular/router';
import { of } from 'rxjs';

import { boards, firebaseUser, user } from '../mocks';
import { AuthService } from '../services/auth.service';
import { DashboardService } from '../services/dashboard.service';
import { BoardAccessGuard } from './board-access.guard';

describe('BoardAccessGuard', () => {
  let guard: BoardAccessGuard;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let dashboardServiceSpy: jasmine.SpyObj<DashboardService>;
  let route: ActivatedRouteSnapshot;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser', 'navigateToDashboard']);
    dashboardServiceSpy = jasmine.createSpyObj('DashboardService', ['getBoard']);

    TestBed.configureTestingModule({
      providers: [
        BoardAccessGuard,
        { provide: AuthService, useValue: authServiceSpy },
        { provide: DashboardService, useValue: dashboardServiceSpy },
        { provide: ActivatedRouteSnapshot, useValue: { params: { id: boards[0].id } } },
      ],
    });

    guard = TestBed.inject(BoardAccessGuard);
    route = TestBed.inject(ActivatedRouteSnapshot);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });

  describe('resolve', () => {
    it('should resolve when current user is a creator', () => {
      authServiceSpy.getCurrentUser.and.returnValue(of(user));
      dashboardServiceSpy.getBoard.and.returnValue(of({ ...boards[0], creator: user.email }));
    });

    it('should resolve when current user has already shared the board', () => {
      authServiceSpy.getCurrentUser.and.returnValue(of({ ...user, sharedBoards: ['1'] }));
      dashboardServiceSpy.getBoard.and.returnValue(of(boards[0]));
    });

    afterEach(() => {
      guard.canActivate(route).subscribe((response: boolean) => {
        expect(response).toBeTrue();
      });
    });
  });

  describe('reject', () => {
    it('should reject when the board is invalid', () => {
      authServiceSpy.getCurrentUser.and.returnValue(of(user));
      dashboardServiceSpy.getBoard.and.returnValue(of(undefined as any));
    });

    it('should reject when current user has not shared the board', () => {
      authServiceSpy.getCurrentUser.and.returnValue(of({ ...user, sharedBoards: ['2', '3'] }));
      dashboardServiceSpy.getBoard.and.returnValue(of(boards[0]));
    });

    afterEach(() => {
      guard.canActivate(route).subscribe((response: boolean) => {
        expect(response).toBeFalse();
        expect(authServiceSpy.navigateToDashboard).toHaveBeenCalled();
      });
    });
  });
});
