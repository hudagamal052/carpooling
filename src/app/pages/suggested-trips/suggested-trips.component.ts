
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TripSuggestionService } from '../../services/trip-suggestion.service'; 

@Component({
  selector: 'app-suggested-trips',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './suggested-trips.component.html',
  styleUrls: ['./suggested-trips.component.css']
})
export class SuggestedTripsComponent implements OnInit {
  
  suggestedTrips: any[] = [];
  isLoading = true;

  constructor(private tripSuggestionService: TripSuggestionService) { }

  ngOnInit(): void {
    this.loadSuggestions();
  }

  loadSuggestions(): void {
    this.isLoading = true;
    const initialFilters = {};

   
    this.tripSuggestionService.GetAllTripSuggetions(initialFilters).subscribe({ 
      next: (response: any) => {
        this.suggestedTrips = response?.data || []; 
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('حدث خطأ أثناء جلب الرحلات:', err);
        this.suggestedTrips = []; 
        this.isLoading = false;
      }
    });
  }
  
}
