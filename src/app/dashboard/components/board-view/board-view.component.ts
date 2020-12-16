import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Board } from 'src/app/models';

@Component({
  selector: 'app-board-view',
  templateUrl: './board-view.component.html',
  styleUrls: ['./board-view.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class BoardViewComponent implements OnInit {
  board: Board;

  constructor(private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.board = this.route.snapshot.data['board'];
  }

}
