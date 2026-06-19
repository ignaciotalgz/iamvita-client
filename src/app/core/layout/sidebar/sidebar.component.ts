import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface NavItem {
  label: string;
  icon:  string;
  route: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {

  collapsed      = input<boolean>(false);
  toggleCollapse = output<void>();

  // Agregar más items acá cuando crees nuevas secciones protegidas
  readonly navItems: NavItem[] = [
    { label: 'Dashboard', icon: '📊', route: '/dashboard' }
  ];

  onToggle(): void {
    this.toggleCollapse.emit();
  }
}