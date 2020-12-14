import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-add-dashboard-modal',
  templateUrl: './add-dashboard-modal.component.html',
  styleUrls: ['./add-dashboard-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddDashboardModalComponent implements OnInit {
  title = '';

  constructor() { }

  ngOnInit(): void {
  }

}
