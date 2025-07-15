import { Component, Output, EventEmitter, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { NgClass, CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import * as L from 'leaflet';
import { Trip } from '../../models/trip.model';
import { TripService } from '../../services/trip.service';

export interface Location {
  lat: number;
  lng: number;
}

export interface Driver {
  name: string;
  avatar: string;
  rating: number;
}

export interface Ride {
  from: string;
  fromDetails: string;
  to: string;
  toDetails: string;
  carType: string;
  availableSeats: number;
  driver: Driver;
}

@Component({
  selector: 'app-passenger-dashboard',
  standalone: true,
  imports: [NgClass, CommonModule, FormsModule],
  templateUrl: './passenger-dashboard.component.html',
  styleUrl: './passenger-dashboard.component.css',
})
export class PassengerDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  passengerCount = 1;
  rides: Trip[] = [];

  constructor(private tripService: TripService) {}

  increasePassengers() {
    this.passengerCount++;
  }
  
  decreasePassengers() {
    if (this.passengerCount > 1) {
      this.passengerCount--;
    }
  }
  @Output() locationChange = new EventEmitter<{
    pickup: Location | null;
    dropoff: Location | null;
  }>();

  private map!: L.Map;
  private pickupMarker?: L.Marker;
  private dropoffMarker?: L.Marker;

  pickupLocation: Location | null = null;
  dropoffLocation: Location | null = null;
  isSelectingPickup = true;
  searchQuery = "";
  fromLocationText = ""; // To store the "From" input value
  toLocationText = "";   // To store the "To" input value

  // Default to Cairo, Egypt
  private defaultCenter: L.LatLngExpression = [30.0444, 31.2357];

  ngOnInit(): void {
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    });
    this.tripService.getTrips().subscribe((trips: Trip[]) => {
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

  private initMap(): void {
    this.map = L.map("map").setView(this.defaultCenter, 13);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    this.map.on("click", (e: L.LeafletMouseEvent) => {
      this.onMapClick(e.latlng);
    });

    this.getCurrentLocation();
  }

  private async reverseGeocode(location: Location): Promise<string> {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${location.lat}&lon=${location.lng}&accept-language=ar`
      );
      const data = await response.json();
      return data.display_name || `${location.lat}, ${location.lng}`;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return `${location.lat}, ${location.lng}`;
    }
  }

  private async setPickupLocation(location: Location): Promise<void> {
    this.pickupLocation = location;

    if (this.pickupMarker) {
      this.map.removeLayer(this.pickupMarker);
    }

    const greenIcon = new L.Icon({
      iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    this.pickupMarker = L.marker([location.lat, location.lng], { icon: greenIcon })
      .addTo(this.map)
      .bindPopup("موقع الانطلاق");

    // Get address and set to input
    this.fromLocationText = await this.reverseGeocode(location);
  }

  private async setDropoffLocation(location: Location): Promise<void> {
    this.dropoffLocation = location;

    if (this.dropoffMarker) {
      this.map.removeLayer(this.dropoffMarker);
    }

    const redIcon = new L.Icon({
      iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
      shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    this.dropoffMarker = L.marker([location.lat, location.lng], { icon: redIcon })
      .addTo(this.map)
      .bindPopup("موقع الوصول");

    // Get address and set to input
    this.toLocationText = await this.reverseGeocode(location);
  }

  private async onMapClick(latlng: L.LatLng): Promise<void> {
    const location: Location = { lat: latlng.lat, lng: latlng.lng };

    if (this.isSelectingPickup) {
      await this.setPickupLocation(location);
      this.isSelectingPickup = false;
    } else {
      await this.setDropoffLocation(location);
    }

    this.emitLocationChange();
  }

  setSelectionMode(isPickup: boolean): void {
    this.isSelectingPickup = isPickup;
  }

  async searchLocation(): Promise<void> {
    if (!this.searchQuery.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(this.searchQuery)}&limit=1&accept-language=ar`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const location: Location = { lat: parseFloat(lat), lng: parseFloat(lon) };

        if (this.isSelectingPickup) {
          this.setPickupLocation(location);
          this.fromLocationText = this.searchQuery;
          this.isSelectingPickup = false;
        } else {
          this.setDropoffLocation(location);
          this.toLocationText = this.searchQuery;
        }

        this.map.setView([location.lat, location.lng], 15);
        this.searchQuery = "";
        this.emitLocationChange();
      }
    } catch (error) {
      console.error("خطأ في البحث عن الموقع:", error);
    }
  }

  getCurrentLocation(): void {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: Location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          this.map.setView([location.lat, location.lng], 15);

          if (this.isSelectingPickup) {
            this.setPickupLocation(location);
            this.fromLocationText = "Current: " + location.lat + ", " + location.lng;
            this.isSelectingPickup = false;
          } else {
            this.setDropoffLocation(location);
            this.toLocationText = "Current: " + location.lat + ", " + location.lng;
          }

          this.emitLocationChange();
        },
        (error) => {
          console.error("خطأ في الحصول على الموقع الحالي:", error);
        }
      );
    }
  }

  resetLocations(): void {
    this.pickupLocation = null;
    this.dropoffLocation = null;
    this.isSelectingPickup = true;
    this.fromLocationText = "";
    this.toLocationText = "";

    if (this.pickupMarker) {
      this.map.removeLayer(this.pickupMarker);
      this.pickupMarker = undefined;
    }

    if (this.dropoffMarker) {
      this.map.removeLayer(this.dropoffMarker);
      this.dropoffMarker = undefined;
    }

    this.emitLocationChange();
  }

  private emitLocationChange(): void {
    this.locationChange.emit({
      pickup: this.pickupLocation,
      dropoff: this.dropoffLocation,
    });
  }

  // Set marker and location by address (from input field)
  async setLocationByAddress(type: 'from' | 'to', address: string): Promise<void> {
    if (!address.trim()) return;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1&accept-language=ar`
      );
      const data = await response.json();
      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const location: Location = { lat: parseFloat(lat), lng: parseFloat(lon) };
        if (type === 'from') {
          await this.setPickupLocation(location);
          this.isSelectingPickup = false;
          this.map.setView([location.lat, location.lng], 15);
        } else {
          await this.setDropoffLocation(location);
          this.map.setView([location.lat, location.lng], 15);
        }
        this.emitLocationChange();
      }
    } catch (error) {
      console.error('خطأ في البحث عن العنوان:', error);
    }
  }

  // Updated method with proper typing and null check
  onInputChange(type: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    if (target && target.value !== undefined) {
      const value = target.value;
      if (type === 'from') {
        this.fromLocationText = value;
        if (value.trim()) {
          this.setLocationByAddress('from', value);
        }
      } else if (type === 'to') {
        this.toLocationText = value;
        if (value.trim()) {
          this.setLocationByAddress('to', value);
        }
      }
    }
  }

  // Method to search for rides based on locations
  searchRides(): void {
    if (this.fromLocationText.trim() && this.toLocationText.trim()) {
      this.tripService.getTripsByLocation(this.fromLocationText, this.toLocationText)
        .subscribe((trips: Trip[]) => {
          this.rides = trips;
        });
    } else {
      // If no specific locations, get all trips
      this.tripService.getTrips().subscribe((trips: Trip[]) => {
        this.rides = trips;
      });
    }
  }
}