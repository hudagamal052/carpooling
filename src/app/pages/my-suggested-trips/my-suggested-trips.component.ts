import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';

import { TripSuggestionService } from '../../services/trip-suggestion.service';
import { AuthService } from '../../services/auth.service';

import { TripSuggestion } from '../../models/trip-suggestion.model';

@Component({
  selector: 'app-my-suggested-trips',
  standalone: true,
  imports: [CommonModule, DatePipe],
  templateUrl: './my-suggested-trips.component.html',
  styleUrls: ['./my-suggested-trips.component.css']
})
export class MySuggestedTripsComponent implements OnInit {

  myTrips: TripSuggestion[] = [];
  
  isLoading = true;
  currentUsername: string | null = null;

  constructor(
    private tripSuggestionService: TripSuggestionService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    console.log('=== My Suggested Trips Component Initialized ===');
    
    const currentUser = this.authService.getCurrentUser();
    console.log('Current user from token:', currentUser);
    
   
    const isLoggedIn = this.authService.isLoggedIn();
    console.log('Is user logged in:', isLoggedIn);
  
    const token = this.authService.getToken();
    console.log('Token exists:', !!token);
    if (token) {
      console.log('Token preview:', token.substring(0, 50) + '...');
    }
    
    if (currentUser?.name) {
      this.currentUsername = currentUser.name;
      console.log('Using username from token:', this.currentUsername);
      this.loadMyTrips();
    } else {
      this.isLoading = false;
      console.error("لا يمكن جلب الرحلات لأن المستخدم غير معروف.");
      console.error("Current user object:", currentUser);
      console.error("Please make sure you are logged in first!");
    }
  }

  loadMyTrips(): void {
    this.isLoading = true;
    
    console.log('Loading all trips and filtering by current user...');

   
    this.tripSuggestionService.getUserTripSuggestions('').subscribe({
      next: (response) => {
        console.log('Full API Response:', response);
        
        
        let allTrips: TripSuggestion[] = [];
        
        if (response?.data) {
          allTrips = response.data;
        } else if (Array.isArray(response)) {
          allTrips = response;
        } else if (response && typeof response === 'object') {
     
          allTrips = Array.isArray(response) ? response : [response];
        }
        
        console.log('All trips from API:', allTrips);
        console.log('Current username:', this.currentUsername);
        
        if (allTrips.length > 0) {
          console.log('First trip structure:', allTrips[0]);
          console.log('Available fields in trip:', Object.keys(allTrips[0]));
        
          console.log('All trips for debugging:');
          allTrips.forEach((trip, index) => {
            console.log(`Trip ${index + 1}:`, trip);
          });
        }
        
       
        this.myTrips = allTrips.filter((trip: any) => {
          
          const tripUsername = trip.userName || trip.username || trip.user_name || trip.user || trip.creator || trip.owner;
          console.log('Checking trip:', trip);
          console.log('Trip username field:', tripUsername);
          console.log('Current username:', this.currentUsername);
          
        
          const match = tripUsername && this.currentUsername && 
                       tripUsername.toLowerCase() === this.currentUsername.toLowerCase();
          console.log('Match (case-insensitive):', match);
          return match;
        });
        
        console.log('Filtered trips for current user:', this.myTrips);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('فشل جلب رحلاتي المقترحة:', err);
        console.error('Error details:', err);
        this.myTrips = [];
        this.isLoading = false;
      }
    });
  }

  deleteTrip(trip: TripSuggestion): void {
    if (!trip.id) {
      alert('لا يمكن حذف الرحلة: لا يوجد معرف (ID) صالح.');
      return;
    }
    if (confirm('هل أنت متأكد من أنك تريد حذف هذه الرحلة؟')) {
      this.tripSuggestionService.deleteSuggestion(trip.id).subscribe({
        next: () => {
          alert('تم حذف الرحلة بنجاح!');
          this.loadMyTrips();
        },
        error: (err) => {
          console.error('فشل حذف الرحلة:', err);
          alert('حدث خطأ أثناء حذف الرحلة.');
        }
      });
    }
  }

  editTrip(trip: TripSuggestion): void {
    if (!trip.id) {
      alert('لا يمكن تعديل الرحلة: لا يوجد معرف (ID) صالح.');
      return;
    }
    console.log('Edit button clicked for trip:', trip);
    console.log(`Navigating to edit page for trip ID: ${trip.id}`);
    this.router.navigate(['/suggest-trip', trip.id]);
  }


  createNewSuggestion(): void {
    this.router.navigate(['/suggest-trip']);
  }
}
