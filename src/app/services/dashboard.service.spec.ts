import { TestBed } from '@angular/core/testing';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { ShareComponent } from '../dashboard/components';
import { FirestoreMock, firebaseUser, boards, user, firebaseUserInfo, spyOnCollection, spyOnDoc } from '../mocks';
import { Board } from '../models';
import { AuthService } from './auth.service';
import { DashboardService } from './dashboard.service';
import { GeneratorService } from './generator.service';
import { NotificationService } from './notification.service';
import { PostService } from './post.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let firestore: AngularFirestore;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let generatorServiceSpy: jasmine.SpyObj<GeneratorService>;
  let postServiceSpy: jasmine.SpyObj<PostService>;
  let matDialogSpy: jasmine.SpyObj<MatDialog>;
  let notificationServiceSpy: jasmine.SpyObj<NotificationService>;

  const getProviders = () => {
    return [
      DashboardService,
      { provide: AngularFirestore, useClass: FirestoreMock },
      { provide: AuthService, useValue: authServiceSpy },
      { provide: GeneratorService, useValue: generatorServiceSpy },
      { provide: PostService, useValue: postServiceSpy },
      { provide: MatDialog, useValue: matDialogSpy },
      { provide: NotificationService, useValue: notificationServiceSpy },
    ];
  };

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getFirebaseUser', 'getUserByEmail', 'getCurrentUser', 'updateUser']);
    generatorServiceSpy = jasmine.createSpyObj('GeneratorService', { generateId: '12345' });
    postServiceSpy = jasmine.createSpyObj('PostService', ['initColumns', 'getColumnsRef', 'getPostsRef', 'getLikesRef']);
    matDialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
    notificationServiceSpy = jasmine.createSpyObj('NotificationService', ['showMessage']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: { redirectUrl: boards[0].id } } } },
        ...getProviders(),
      ],
    });

    service = TestBed.inject(DashboardService);
    firestore = TestBed.inject(AngularFirestore);

    authServiceSpy.getFirebaseUser.and.returnValue(of(firebaseUser));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add board', (done: DoneFn) => {
    postServiceSpy.initColumns.and.returnValue(of(true));
    spyOnCollection(firestore);

    service.addBoard(boards[0]).subscribe((response: boolean) => {
      expect(response).toBeTrue();
      done();
    });
  });

  it('should return my boards', () => {
    spyOnCollection(firestore, [boards[0]], 'boards');

    service.getMyBoards().subscribe((response: Board[]) => {
      expect(response).toEqual([boards[0]]);
    });
  });

  describe('getBoardsSharedWithMe', () => {
    it('should return boards', () => {
      authServiceSpy.getCurrentUser.and.returnValue(of({ ...user, sharedBoards: ['1'] }));
      spyOnCollection(firestore, [boards[0]], 'boards');

      service.getBoardsSharedWithMe().subscribe((response: Board[]) => {
        expect(response).toEqual([boards[0]]);
      });
    });

    it('should return empty array when user does not have boards', () => {
      authServiceSpy.getCurrentUser.and.returnValue(of(user));
      spyOnCollection(firestore, []);

      service.getBoardsSharedWithMe().subscribe((response: Board[]) => {
        expect(response).toEqual([]);
      });
    });

    it('should return empty array when user is not defined', () => {
      authServiceSpy.getCurrentUser.and.returnValue(of(null as any));
      spyOnCollection(firestore, []);

      service.getBoardsSharedWithMe().subscribe((response: Board[]) => {
        expect(response).toEqual([]);
      });
    });
  });

  it('should return board by id', () => {
    spyOnCollection(firestore, [boards[0]], 'boards');

    service.getBoard('1').subscribe((response: Board) => {
      expect(response).toEqual(boards[0]);
    });
  });

  it('should edit current board', (done: DoneFn) => {
    spyOnCollection(firestore);
    spyOnDoc(firestore);

    service.editBoard(boards[0]).subscribe(() => {
      expect(firestore.collection).toHaveBeenCalledTimes(1);
      expect(firestore.doc).toHaveBeenCalledTimes(1);
      done();
    });
  });

  describe('shareBoard', () => {
    it('should return null when boardId is not defined', (done: DoneFn) => {
      TestBed.resetTestingModule();
      TestBed.configureTestingModule({
        imports: [RouterTestingModule],
        providers: [
          { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} } } },
          ...getProviders(),
        ],
      });

      TestBed.inject(DashboardService).shareBoard().subscribe(response => {
        expect(response).toBeNull();
        expect(authServiceSpy.getFirebaseUser).not.toHaveBeenCalled();
        expect(authServiceSpy.updateUser).not.toHaveBeenCalled();
        expect(authServiceSpy.getUserByEmail).not.toHaveBeenCalled();
        done();
      });
    });

    it('should not update profile when current user is creator', (done: DoneFn) => {
      spyOn(service, 'getBoard').and.returnValue(of({ ...boards[0], creator: user.email }));

      service.shareBoard().subscribe(response => {
        expect(response).toBeNull();
        expect(authServiceSpy.updateUser).not.toHaveBeenCalled();
        expect(authServiceSpy.getUserByEmail).not.toHaveBeenCalled();
        done();
      });
    });

    it('should update profile and set shared board', (done: DoneFn) => {
      spyOn(service, 'getBoard').and.returnValue(of(boards[0]));
      authServiceSpy.updateUser.and.returnValue(of(firebaseUserInfo));
      authServiceSpy.getUserByEmail.and.returnValue(of(user));

      service.shareBoard().subscribe(() => {
        expect(authServiceSpy.getUserByEmail).toHaveBeenCalledOnceWith(firebaseUser.email as string);
        expect(authServiceSpy.updateUser).toHaveBeenCalledOnceWith(firebaseUser, { sharedBoards: [boards[0].id] as string[] });
        done();
      });
    });

    it('should share board url', () => {
      const url = `${window.location.origin}/dashboard?redirectUrl=${boards[0].id}`;
      service.shareUrl(boards[0]);

      expect(notificationServiceSpy.showMessage).toHaveBeenCalledOnceWith('Copied to clipboard');
      expect(matDialogSpy.open).toHaveBeenCalledOnceWith(ShareComponent, { data: url, panelClass: 'share-modal' });
    });
  });

  it('should remove board', (done: DoneFn) => {
    const ref = { get: () => of([{ id: 1, ref: { delete: () => Promise.resolve() } }]) } as any;
    spyOnCollection(firestore);
    spyOnDoc(firestore);

    postServiceSpy.getColumnsRef.and.returnValue(ref);
    postServiceSpy.getPostsRef.and.returnValue(ref);
    postServiceSpy.getLikesRef.and.returnValue(ref);

    service.removeBoard(boards[0].id as string).subscribe(() => {
      expect(firestore.collection).toHaveBeenCalledTimes(1);
      expect(firestore.doc).toHaveBeenCalledTimes(1);
      done();
    });
  });
});
