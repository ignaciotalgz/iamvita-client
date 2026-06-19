import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ToastComponent } from './core/components/toast/toast.component'; // ← agregar

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, ToastComponent], // ← agregar ToastComponent
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {}