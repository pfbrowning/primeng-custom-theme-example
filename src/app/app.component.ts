import { Component } from '@angular/core';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'PrimeNG Custom Theme Example';
  constructor(private messageService: MessageService) {}

  public onClick(severity: string = 'success') {
    this.messageService.add({severity:severity, summary:severity, detail:'You clicked a button!'});
  }
}
