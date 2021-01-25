import { TestBed } from '@angular/core/testing';
import { AngularFirestore } from '@angular/fire/firestore';
import { ActivatedRoute } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';

import { FirestoreMock, firebaseUser, board, user, firebaseUserInfo } from '../mocks';
import { Board } from '../models';
import { AuthService } from './auth.service';
import { DashboardService } from './dashboard.service';
import { GeneratorService } from './generator.service';
import { PostService } from './post.service';

describe('DashboardService', () => {
  let service: DashboardService;
  let firestore: AngularFirestore;
  let authServiceSpy: jasmine.SpyObj<AuthService>;
  let generatorServiceSpy: jasmine.SpyObj<GeneratorService>;
  let postServiceServiceSpy: jasmine.SpyObj<PostService>;

  beforeEach(() => {
    authServiceSpy = jasmine.createSpyObj('AuthService', ['getCurrentUser', 'getUserByEmail', 'updateUser']);
    generatorServiceSpy = jasmine.createSpyObj('GeneratorService', { generateId: '12345' });
    postServiceServiceSpy = jasmine.createSpyObj('PostService', ['initColumns', 'getColumnsRef', 'getPostsRef']);

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      providers: [
        DashboardService,
        { provide: AngularFirestore, useClass: FirestoreMock },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: GeneratorService, useValue: generatorServiceSpy },
        { provide: PostService, useValue: postServiceServiceSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParams: { redirectUrl: board.id } } } },
      ],
    });

    service = TestBed.inject(DashboardService);
    firestore = TestBed.inject(AngularFirestore);

    authServiceSpy.getCurrentUser.and.returnValue(of(firebaseUser));
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add board', (done: DoneFn) => {
    postServiceServiceSpy.initColumns.and.returnValue(of(true));

    spyOn(firestore, 'collection').and.callFake(() => {
      return {
        add: (b: Board) => {
          expect(b.creator).toBe(firebaseUser.email as string);
          expect(b.id).toBe(board.id);
          return Promise.resolve(board);
        }
      } as any;
    });

    service.addBoard(board).subscribe((response: boolean) => {
      expect(response).toBeTrue();
      done();
    });
  });

  it('should return my boards', () => {
    spyOn(firestore, 'collection').and.callFake((path: any, queryFn: any) => {
      expect(path).toBe('boards');
      queryFn({ where: () => null });

      return { valueChanges: () => of([board]) } as any;
    });

    service.getMyBoards().subscribe((response: Board[]) => {
      expect(response).toEqual([board]);
    });
  });

  describe('getBoardsSharedWithMe', () => {
    it('should return boards', () => {
      authServiceSpy.getUserByEmail.and.returnValue(of({ ...user, sharedBoards: ['1'] }));
      spyOn(firestore, 'collection').and.callFake((path: any, queryFn: any) => {
        expect(path).toBe('boards');
        queryFn({ where: () => null });

        return { valueChanges: () => of([board]) } as any;
      });

      service.getBoardsSharedWithMe().subscribe((response: Board[]) => {
        expect(response).toEqual([board]);
      });
    });

    it('should return empty array when user does not have boards', () => {
      authServiceSpy.getUserByEmail.and.returnValue(of(user));
      spyOn(firestore, 'collection').and.returnValue({ valueChanges: () => of([]) } as any);

      service.getBoardsSharedWithMe().subscribe((response: Board[]) => {
        expect(response).toEqual([]);
      });
    });

    it('should return empty array when user is not defined', () => {
      authServiceSpy.getUserByEmail.and.returnValue(of(null as any));
      spyOn(firestore, 'collection').and.returnValue({ valueChanges: () => of([]) } as any);

      service.getBoardsSharedWithMe().subscribe((response: Board[]) => {
        expect(response).toEqual([]);
      });
    });
  });

  it('should return board by id', () => {
    spyOn(firestore, 'collection').and.callFake((path: any, queryFn: any) => {
      expect(path).toBe('boards');
      queryFn({ where: () => null });

      return { valueChanges: () => of([board]) } as any;
    });

    service.getBoard('1').subscribe((response: Board) => {
      expect(response).toEqual(board);
    });
  });

  it('should edit current board', (done: DoneFn) => {
    spyOn(firestore, 'collection').and.returnValue({ get: () => of({ docs: [{ id: 1 }] }) } as any);
    spyOn(firestore, 'doc').and.callFake(() => {
      return {
        update: (b: Board) => {
          expect(b).toEqual(board);
          return Promise.resolve();
        },
      } as any;
    });

    service.editBoard(board).subscribe(() => {
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
          DashboardService,
          { provide: AngularFirestore, useClass: FirestoreMock },
          { provide: AuthService, useValue: authServiceSpy },
          { provide: GeneratorService, useValue: jasmine.createSpy() },
          { provide: PostService, useValue: jasmine.createSpy() },
          { provide: ActivatedRoute, useValue: { snapshot: { queryParams: {} } } },
        ],
      });

      TestBed.inject(DashboardService).shareBoard().subscribe(response => {
        expect(response).toBeNull();
        expect(authServiceSpy.getCurrentUser).not.toHaveBeenCalled();
        expect(authServiceSpy.updateUser).not.toHaveBeenCalled();
        expect(authServiceSpy.getUserByEmail).not.toHaveBeenCalled();
        done();
      });
    });

    it('should not update profile when current user is creator', (done: DoneFn) => {
      spyOn(service, 'getBoard').and.returnValue(of({ ...board, creator: user.email }));

      service.shareBoard().subscribe(response => {
        expect(response).toBeNull();
        expect(authServiceSpy.updateUser).not.toHaveBeenCalled();
        expect(authServiceSpy.getUserByEmail).not.toHaveBeenCalled();
        done();
      });
    });

    it('should update profile and set shared board', (done: DoneFn) => {
      spyOn(service, 'getBoard').and.returnValue(of(board));
      authServiceSpy.updateUser.and.returnValue(of(firebaseUserInfo));
      authServiceSpy.getUserByEmail.and.returnValue(of(user));

      service.shareBoard().subscribe(() => {
        expect(authServiceSpy.getUserByEmail).toHaveBeenCalledOnceWith(firebaseUser.email);
        expect(authServiceSpy.updateUser).toHaveBeenCalledOnceWith(firebaseUser, { sharedBoards: [board.id] });
        done();
      });
    });
  });

  it('should remove board', (done: DoneFn) => {
    spyOn(firestore, 'collection').and.returnValue({ get: () => of({ docs: [{ id: 1 }] }) } as any);
    spyOn(firestore, 'doc').and.returnValue({ delete: () => Promise.resolve() } as any);

    postServiceServiceSpy.getColumnsRef.and.returnValue({ get: () => of([{ id: 1, ref: { delete: () => Promise.resolve() } }]) } as any);
    postServiceServiceSpy.getPostsRef.and.returnValue(  { get: () => of([{ id: 1, ref: { delete: () => Promise.resolve() } }]) } as any);

    service.removeBoard(board.id as string).subscribe(() => {
      expect(firestore.collection).toHaveBeenCalledTimes(1);
      expect(firestore.doc).toHaveBeenCalledTimes(1);
      done();
    });
  });
});
