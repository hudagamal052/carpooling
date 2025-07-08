import { Component } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { NavbarComponent } from '../../components/navbar.component';
interface Ride {
  from: string;
  fromDetails: string;
  to: string;
  toDetails: string;
  driver: {
    name: string;
    avatar: string;
    rating: number;
  };
  carType: string;
  date: string;
  status: string;
}
@Component({
  selector: 'app-my-rides',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, NavbarComponent],
  templateUrl: './my-rides.component.html',
  styleUrl: './my-rides.component.css',
})
export class MyRidesComponent {
  rideHistory: Ride[] = [
    {
      from: 'أسيوط',
      fromDetails: 'شارع الجمهورية',
      to: 'القاهرة',
      toDetails: 'محطة مصر',
      driver: {
        name: 'محمود علي',
        avatar: 'https://randomuser.me/api/portraits/men/36.jpg',
        rating: 4.6,
      },
      carType: 'هيونداي النترا',
      date: '2024-05-01',
      status: 'مكتملة',
    },
    {
      from: 'القاهرة',
      fromDetails: 'مدينة نصر',
      to: 'أسيوط',
      toDetails: 'موقف الأزهر',
      driver: {
        name: 'سعيد حسن',
        avatar: 'https://randomuser.me/api/portraits/men/40.jpg',
        rating: 4.9,
      },
      carType: 'كيا سيراتو',
      date: '2024-04-20',
      status: 'ملغاة',
    },
  ];
}
