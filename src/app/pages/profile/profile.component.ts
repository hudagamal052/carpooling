import { Component } from '@angular/core';
import { NgIf } from '@angular/common';
import { NavbarComponent } from '../../components/navbar.component';
@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [NgIf, NavbarComponent],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.css',
})
export class ProfileComponent {
  user = {
    name: 'أحمد محمد',
    email: 'ahmed@example.com',
    phone: '01012345678',
    avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
  };
}
