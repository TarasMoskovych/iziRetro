import { TestBed } from '@angular/core/testing';
import { AngularFirestore } from '@angular/fire/firestore';
import { of } from 'rxjs';

import { columns, FirestoreMock, posts } from '../mocks';
import { Column, Post } from '../models';
import { GeneratorService } from './generator.service';
import { PostService } from './post.service';

describe('PostService', () => {
  let service: PostService;
  let firestore: AngularFirestore;
  let generatorServiceSpy: jasmine.SpyObj<GeneratorService>;

  beforeEach(() => {
    generatorServiceSpy = jasmine.createSpyObj('GeneratorService', { generateId: '12345' });

    TestBed.configureTestingModule({
      providers: [
        PostService,
        { provide: AngularFirestore, useClass: FirestoreMock },
        { provide: GeneratorService, useValue: generatorServiceSpy },
      ],
    });

    service = TestBed.inject(PostService);
    firestore = TestBed.inject(AngularFirestore);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return columns', () => {
    spyOn(firestore, 'collection').and.callFake((path: any, queryFn: any) => {
      expect(path).toBe('columns');
      queryFn({ where: () => null });

      return { valueChanges: () => of(columns) } as any;
    });

    service.getColumns('1').subscribe((response: Column[]) => {
      expect(response).toEqual(columns);
    });
  });

  it('should return posts', () => {
    spyOn(firestore, 'collection').and.callFake((path: any, queryFn: any) => {
      expect(path).toBe('posts');
      queryFn({ where: () => null });

      return { valueChanges: () => of(posts) } as any;
    });

    service.getPosts('1').subscribe((response: Post[]) => {
      expect(response).toEqual(posts);
    });
  });

  it('should init default columns', () => {
    spyOn(firestore, 'collection').and.returnValue({ add: (post: Post) => Promise.resolve(post) } as any);

    service.initColumns('1').subscribe((response: boolean) => {
      expect(firestore.collection).toHaveBeenCalledTimes(3);
      expect(response).toBeTrue();
    });
  });

  it('should add new post', (done: DoneFn) => {
    spyOn(firestore, 'collection').and.returnValue({ add: (post: Post) => Promise.resolve(post) } as any);

    service.addPost(posts[0]).subscribe((response: any) => {
      expect(response.value).toEqual(posts[0].value);
      expect(response.id).toBe('12345');
      done();
    });
  });

  describe('edit', () => {
    beforeEach(() => {
      spyOn(firestore, 'collection').and.callFake((path: any, queryFn: any) => {
        expect(path).toBe('posts');
        queryFn({ where: () => null });

        return { get: () => of({ docs: [{ id: 1 }] }) } as any;
      });
      spyOn(firestore, 'doc').and.returnValue({ delete: (post: Post) => Promise.resolve(post), update: (post: Post) => Promise.resolve(post) } as any);
    });

    it('should update current post', (done: DoneFn) => {
      service.editPost(posts[0], false).subscribe((response: any) => {
        expect(response).toEqual(posts[0]);
        expect(firestore.collection).toHaveBeenCalled();
        expect(firestore.doc).toHaveBeenCalled();
        done();
      });
    });

    it('should delete current post', (done: DoneFn) => {
      service.editPost(posts[0], true).subscribe((response: any) => {
        expect(response).toEqual(posts[0]);
        expect(firestore.collection).toHaveBeenCalled();
        expect(firestore.doc).toHaveBeenCalled();
        done();
      });
    });
  });

  it('should not edit when not found', (done: DoneFn) => {
    spyOn(firestore, 'collection').and.returnValue({ get: () => of(null) } as any);
    service.editPost(posts[0], false).subscribe(response => {
      expect(response).toBeNull();
      expect(firestore.collection).toHaveBeenCalled();
      done();
    });
  });
});
