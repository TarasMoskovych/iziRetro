import { TestBed } from '@angular/core/testing';
import { AngularFirestore } from '@angular/fire/firestore';
import { of } from 'rxjs';

import { columns, FirestoreMock, likes, posts, spyOnCollection, spyOnDoc } from '../mocks';
import { Column, Like, Post } from '../models';
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
    spyOnCollection(firestore, columns, 'columns');

    service.getColumns('1').subscribe((response: Column[]) => {
      expect(response).toEqual(columns);
    });
  });

  it('should return posts', () => {
    spyOnCollection(firestore, posts, 'posts');

    service.getPosts('1').subscribe((response: Post[]) => {
      expect(response).toEqual(posts);
    });
  });

  it('should return likes', () => {
    spyOnCollection(firestore, likes, 'likes');

    service.getLikes('1').subscribe((response: Like[]) => {
      expect(response).toEqual(likes);
    });
  });

  it('should init default columns', () => {
    spyOnCollection(firestore);

    service.initColumns('1').subscribe((response: boolean) => {
      expect(firestore.collection).toHaveBeenCalledTimes(3);
      expect(response).toBeTrue();
    });
  });

  it('should add new post', (done: DoneFn) => {
    spyOnCollection(firestore);

    service.addPost(posts[0]).subscribe((response: any) => {
      expect(response.value).toEqual(posts[0].value);
      expect(response.id).toBe('12345');
      done();
    });
  });

  describe('edit', () => {
    beforeEach(() => {
      spyOnCollection(firestore);
      spyOnDoc(firestore);
      spyOn(service, 'getLikesRef').and.returnValue({ get: () => of([{ id: 1, ref: { delete: () => Promise.resolve() } }]) } as any);
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
    spyOnCollection(firestore, null);

    service.editPost(posts[0], false).subscribe(response => {
      expect(response).toBeUndefined();
      expect(firestore.collection).toHaveBeenCalled();
      done();
    });
  });

  it('should add like', (done: DoneFn) => {
    spyOnCollection(firestore);

    service.addLike(likes[0]).subscribe(() => {
      expect(firestore.collection).toHaveBeenCalledTimes(1);
      done();
    });
  });

  describe('removeLike', () => {
    beforeEach(() => {
      spyOnDoc(firestore);
    });

    it('should not remove when snapshot is empty', (done: DoneFn) => {
      spyOnCollection(firestore, null);

      service.removeLike(likes[0]).subscribe(() => {
        expect(firestore.doc).not.toHaveBeenCalled();
        done();
      });
    });

    it('should remove', (done: DoneFn) => {
      spyOnCollection(firestore);

      service.removeLike(likes[0]).subscribe(() => {
        expect(firestore.doc).toHaveBeenCalled();
        done();
      });
    });
  });
});
