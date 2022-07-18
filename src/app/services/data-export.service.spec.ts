import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import * as xlsx from 'xlsx';

import { boards, columns, posts } from '../mocks';
import { DataExportService } from './data-export.service';
import { PostService } from './post.service';

describe('DataExportService', () => {
  let service: DataExportService;
  let postServiceSpy: jasmine.SpyObj<PostService>;

  beforeEach(() => {
    postServiceSpy = jasmine.createSpyObj('PostService', {
      getColumns: of(columns),
      getPosts: of(posts),
    });

    TestBed.configureTestingModule({
      providers: [
        DataExportService,
        { provide: PostService, useValue: postServiceSpy },
      ]
    });

    service = TestBed.inject(DataExportService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should export data to excel', () => {
    spyOn(xlsx.utils, 'json_to_sheet').and.returnValue({});

    service.export(boards[0]);

    expect(xlsx.utils.json_to_sheet).toHaveBeenCalledOnceWith(
      [
        {
          1: columns[0].title.toUpperCase(), 2: columns[1].title.toUpperCase(), 3: columns[2].title.toUpperCase(),
        },
        {
          1: posts[0].value, 2: posts[1].value, 3: undefined,
        },
        {
          1: undefined, 2: posts[2].value, 3: undefined,
        },
      ],
      { skipHeader: true },
    );
  });
});
