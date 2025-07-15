import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
// 1. IMPORT FormsModule - THIS IS ESSENTIAL
import { FormsModule } from '@angular/forms'; 
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    // 2. ADD FormsModule TO THE IMPORTS ARRAY
    FormsModule, 
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent {
  // This component now controls everything
  activeView: 'personal' | 'car' = 'personal';

  // Data for the sidebar
  profileGreeting: string = 'اهلا';
  profileName: string = 'كيرلس سامح';
  profileImage: string = 'https://i.imgur.com/O1aC3aJ.png';

  // Data for the forms
  personal = { name: 'كيرلس سامح', gender: 'male', email: 'kero.sameh.2024@gmail.com', phone: '+20 120 253 9386' };
  car = { type: 'تويوتا كامري - اسود', plateNumber: 'ق ر ع 1982', seats: 4, category: 'رياضية', color: 'اسود', mainImage: 'assets/images/driver.png', thumbnails: ['assets/images/driver.png', 'assets/images/driver.png', 'assets/images/driver.png'] };

  // Function to switch the view
  setView(view: 'personal' | 'car' ): void {
    this.activeView = view;
  }
}
