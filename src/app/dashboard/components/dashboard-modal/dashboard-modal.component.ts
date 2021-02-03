import { Component, ChangeDetectionStrategy, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dashboard-modal',
  templateUrl: './dashboard-modal.component.html',
  styleUrls: ['./dashboard-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class DashboardModalComponent implements OnInit {
  dialogTitle: string = 'New Board';

  constructor(@Inject(MAT_DIALOG_DATA) public title: string = '') { }

  ngOnInit() {
    if (this.title.length) {
      this.dialogTitle = 'Edit Board';
    }
  }
}
