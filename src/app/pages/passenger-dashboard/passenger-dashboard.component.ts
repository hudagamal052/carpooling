

import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { NgClass, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import * as L from 'leaflet';
import { TripCard } from '../../models/trip.model';
import { TripService } from '../../services/trip.service';
import { AuthService } from '../../services/auth.service';
import { SuggestTripComponent } from '../suggest-trip/suggest-trip.component';

export interface Location {
  lat: number;
  lng: number;
}

@Component({
  selector: 'app-passenger-dashboard',
  standalone: true,
  imports: [ NgClass, CommonModule, FormsModule, SuggestTripComponent ],
  templateUrl: './passenger-dashboard.component.html',
  styleUrls: ['./passenger-dashboard.component.css'],
})
export class PassengerDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
 
  passengerCount = 1;
  rides: TripCard[] = [];
  isSuggestTripModalVisible = false;

  private map!: L.Map;
  private pickupMarker?: L.Marker;
  private dropoffMarker?: L.Marker;
  private defaultCenter: L.LatLngExpression = [30.0444, 31.2357];

  isSelectingPickup = true;
  fromLocationText = "";
  toLocationText = "";

  constructor(
    private tripService: TripService,
    private authService: AuthService,
    private router: Router
  ) {}

 
  ngOnInit(): void {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    } );

    this.tripService.getAllTrips().subscribe((trips: TripCard[]) => {
      this.rides = trips;
    });
  }

  ngAfterViewInit(): void {
    this.initMap();
  }

  ngOnDestroy(): void {
    if (this.map) {
      this.map.remove();
    }
  }

  // --- Modal Control Methods ---

  // *** تم تعديل هذه الدالة ***
  openSuggestTripModal(): void {
    // تحقق مما إذا كان المستخدم قد سجل دخوله
    if (this.authService.isLoggedIn()) {
      // إذا كان مسجلاً، افتح النافذة المنبثقة كالمعتاد
      this.isSuggestTripModalVisible = true;
    }else {
  alert('يجب عليك تسجيل الدخول أولاً لاقتراح رحلة.');
  this.router.navigate(['/auth'], { queryParams: { returnUrl: '/passenger-dashboard' } });
}
  }

  closeSuggestTripModal(): void {
    this.isSuggestTripModalVisible = false;
  }

 
  increasePassengers(): void { this.passengerCount++; }
  decreasePassengers(): void { if (this.passengerCount > 1) { this.passengerCount--; } }
  searchRides(): void {
    console.log(`Searching for rides from "${this.fromLocationText}" to "${this.toLocationText}"`);
    this.tripService.getTripsByLocation(this.fromLocationText, this.toLocationText)
      .subscribe((trips: TripCard[]) => { this.rides = trips; });
  }
  private initMap(): void {
    this.map = L.map("map").setView(this.defaultCenter, 13);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    } ).addTo(this.map);
    this.map.on("click", (e: L.LeafletMouseEvent) => { this.onMapClick(e.latlng); });
  }
  private async onMapClick(latlng: L.LatLng): Promise<void> {
    const location: Location = { lat: latlng.lat, lng: latlng.lng };
    if (this.isSelectingPickup) {
      await this.setPickupLocation(location);
      this.isSelectingPickup = false;
    } else {
      await this.setDropoffLocation(location);
    }
  }
  setSelectionMode(isPickup: boolean): void { this.isSelectingPickup = isPickup; }
  private async setPickupLocation(location: Location): Promise<void> {
    if (this.pickupMarker) { this.map.removeLayer(this.pickupMarker); }
    const greenIcon = new L.Icon({ iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png", shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png", iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41], } );
    this.pickupMarker = L.marker([location.lat, location.lng], { icon: greenIcon }).addTo(this.map);
    this.fromLocationText = await this.reverseGeocode(location);
  }
  private async setDropoffLocation(location: Location): Promise<void> {
    if (this.dropoffMarker) { this.map.removeLayer(this.dropoffMarker); }
    const redIcon = new L.Icon({ iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png", shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png", iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41], } );
    this.dropoffMarker = L.marker([location.lat, location.lng], { icon: redIcon }).addTo(this.map);
    this.toLocationText = await this.reverseGeocode(location);
  }
  getCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: Location = { lat: position.coords.latitude, lng: position.coords.longitude };
          this.map.setView([location.lat, location.lng], 15);
          this.setPickupLocation(location);
          this.isSelectingPickup = false;
        },
        (error) => console.error("Error getting current location:", error)
      );
    }
  }
  resetLocations(): void {
    this.fromLocationText = "";
    this.toLocationText = "";
    this.isSelectingPickup = true;
    if (this.pickupMarker) this.map.removeLayer(this.pickupMarker);
    if (this.dropoffMarker) this.map.removeLayer(this.dropoffMarker);
    this.pickupMarker = undefined;
    this.dropoffMarker = undefined;
  }
  private async reverseGeocode(location: Location): Promise<string> {
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}&accept-language=ar` );
      const data = await response.json();
      return data.display_name || `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`;
    }
  }
  onInputChange(type: 'from' | 'to', event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    console.log(`Input for ${type} changed to: ${value}`);
  }
}
