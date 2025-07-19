// src/app/pages/suggest-trip/suggest-trip.component.ts

import { Component, OnInit, OnDestroy, AfterViewInit, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import * as L from 'leaflet';
import { finalize } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

import { TripSuggestionService } from '../../services/trip-suggestion.service';
import { CreateTripSuggestionRequest, SuggestedLocation, TripSuggestion } from '../../models/trip-suggestion.model';

import { icon, Marker } from 'leaflet';
const iconRetinaUrl = 'assets/marker-icon-2x.png';
const iconUrl = 'assets/marker-icon.png';
const shadowUrl = 'assets/marker-shadow.png';
const iconDefault = icon({
  iconRetinaUrl, iconUrl, shadowUrl,
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
  tooltipAnchor: [16, -28], shadowSize: [41, 41]
} );
Marker.prototype.options.icon = iconDefault;

@Component({
  selector: 'app-suggest-trip',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './suggest-trip.component.html',
  styleUrls: ['./suggest-trip.component.css']
})
export class SuggestTripComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('tripForm') tripForm!: NgForm;

  // This object holds the data for the form fields
  tripDetails = {
    from: '',
    to: '',
    dateTime: '',
    passengers: 1,
    price: null as number | null,
    notes: ''
  };

  // These will store the detailed location data from the map
  private departureLocation: SuggestedLocation | null = null;
  private destinationLocation: SuggestedLocation | null = null;
  private originalClassifications: number = 0; // To store classifications in edit mode

  // Map-related properties
  private map: L.Map | null = null;
  private fromMarker: L.Marker | undefined;
  private toMarker: L.Marker | undefined;
  activeField: 'from' | 'to' | null = null;
  private defaultCenter: L.LatLngTuple = [30.0444, 31.2357];

  // Component state properties
  isSubmitting = false;
  isEditMode = false;
  currentTripId: string | null = null;
  isLoading = false;
  pageTitle = 'اقترح رحلة جديدة';
  buttonText = 'تأكيد الاقتراح';

  // Injected services for cleaner code
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient );
  private suggestionService = inject(TripSuggestionService);

  ngOnInit(): void {
    this.currentTripId = this.route.snapshot.paramMap.get('id');

    if (this.currentTripId) {
      // --- EDIT MODE ---
      this.isEditMode = true;
      this.pageTitle = 'تعديل الرحلة';
      this.buttonText = 'حفظ التعديلات';
      this.loadTripForEditing(this.currentTripId);
    } else {
      // --- CREATE MODE ---
      console.log('Component is in Create Mode.');
    }
  }

  ngAfterViewInit(): void {
    // Initialize the map after the view is ready
    setTimeout(() => this.initMap(), 200);
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  loadTripForEditing(id: string): void {
    this.isLoading = true;
    this.suggestionService.getSuggestionById(id).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (response) => {
        const trip: TripSuggestion = response?.data || response;
        if (!trip) {
          alert('لم يتم العثور على الرحلة.');
          this.router.navigate(['/my-suggested-trips']);
          return;
        }

        // Populate form fields with data from the fetched trip
        this.tripDetails = {
          from: trip.departure?.address || '',
          to: trip.destination?.address || '',
          dateTime: trip.preferredDepartureTime ? new Date(trip.preferredDepartureTime).toISOString().slice(0, 16) : '',
          passengers: trip.seatCount,
          price: trip.suggestedPrice,
          notes: trip.description || ''
        };

        // Store the original detailed location and classification data
        this.departureLocation = trip.departure;
        this.destinationLocation = trip.destination;
        this.originalClassifications = trip.classifications;

        // Update map with markers for the existing locations
        if (this.departureLocation) {
          this.updateMarker(this.departureLocation.latitude, this.departureLocation.longitude, 'from');
        }
        if (this.destinationLocation) {
          this.updateMarker(this.destinationLocation.latitude, this.destinationLocation.longitude, 'to');
        }
      },
      error: () => {
        alert('فشل تحميل بيانات الرحلة.');
        this.router.navigate(['/my-suggested-trips']);
      }
    });
  }

  private initMap(): void {
    if (document.getElementById('popup-map') && !this.map) {
      this.map = L.map('popup-map').setView(this.defaultCenter, 10);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' ).addTo(this.map);
      this.map.on('click', (e: L.LeafletMouseEvent) => this.onMapClick(e));
    }
  }

  onMapClick(e: L.LeafletMouseEvent): void {
    if (!this.activeField) {
      alert('الرجاء تحديد حقل "من" أو "إلى" أولاً.');
      return;
    }
    const { lat, lng } = e.latlng;
    this.updateMarker(lat, lng, this.activeField);
    this.reverseGeocode(lat, lng, this.activeField);
  }

  selectOnMap(field: 'from' | 'to'): void {
    this.activeField = field;
  }

  private updateMarker(lat: number, lng: number, field: 'from' | 'to'): void {
    if (!this.map) return;
    const markerRef = field === 'from' ? 'fromMarker' : 'toMarker';
    const iconColor = field === 'from' ? 'green' : 'red';
    const customIcon = new L.Icon({
      iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${iconColor}.png`,
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41]
    } );

    if (this[markerRef]) {
      this[markerRef]!.setLatLng([lat, lng]);
    } else {
      this[markerRef] = L.marker([lat, lng], { icon: customIcon }).addTo(this.map);
    }
    this.map.setView([lat, lng], 15);
  }

  private reverseGeocode(lat: number, lng: number, field: 'from' | 'to'): void {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&accept-language=ar`;
    this.http.get<any>(url ).subscribe(data => {
      if (data?.display_name) {
        this.tripDetails[field] = data.display_name;
        const locationData: SuggestedLocation = {
          id: '', description: data.display_name, address: data.display_name,
          latitude: lat, longitude: lng,
          city: data.address.city || data.address.town || data.address.village || 'غير محدد',
          country: data.address.country || 'غير محدد'
        };
        if (field === 'from') this.departureLocation = locationData;
        else this.destinationLocation = locationData;
      }
    });
  }

  onSubmit(): void {
    if (!this.tripForm.form.valid || !this.departureLocation || !this.destinationLocation) {
      alert('يرجى ملء جميع الحقول المطلوبة وتحديد المواقع على الخريطة.');
      return;
    }

    this.isSubmitting = true;

    const request = this.isEditMode ? this.prepareEditRequest() : this.prepareCreateRequest();
    const operation = this.isEditMode 
      ? this.suggestionService.editSuggestion(request as TripSuggestion)
      : this.suggestionService.createSuggestion(request as CreateTripSuggestionRequest);

    operation.pipe(
      finalize(() => this.isSubmitting = false)
    ).subscribe({
      next: () => {
        alert(this.isEditMode ? 'تم تحديث الرحلة بنجاح!' : 'تم اقتراح الرحلة بنجاح!');
        this.router.navigate(['/my-suggested-trips']);
      },
      error: (err) => {
        alert('حدث خطأ أثناء الحفظ. يرجى المحاولة مرة أخرى.');
        console.error(err);
      }
    });
  }

  private prepareCreateRequest(): CreateTripSuggestionRequest {
    return {
      departure: this.departureLocation!,
      destination: this.destinationLocation!,
      seatCount: Number(this.tripDetails.passengers),
      suggestedPrice: Number(this.tripDetails.price),
      preferredDepartureTime: new Date(this.tripDetails.dateTime).toISOString(),
      description: this.tripDetails.notes || ''
    };
  }

  private prepareEditRequest(): TripSuggestion {
    return {
      id: this.currentTripId!,
      departure: this.departureLocation!,
      destination: this.destinationLocation!,
      seatCount: Number(this.tripDetails.passengers),
      suggestedPrice: Number(this.tripDetails.price),
      preferredDepartureTime: new Date(this.tripDetails.dateTime).toISOString(),
      description: this.tripDetails.notes || '',
      classifications: this.originalClassifications
    };
  }

  onCancel(): void {
    this.router.navigate(['/my-suggested-trips']);
  }
  
  
  locateUser() { /* ... */ }
  resetMap() { /* ... */ }
}
