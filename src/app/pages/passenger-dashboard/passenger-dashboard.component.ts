import { Component, Output, EventEmitter, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { NgClass, CommonModule } from '@angular/common';
import * as L from 'leaflet';
export interface Location {
  lat: number;
  lng: number;
}

@Component({
  selector: 'app-passenger-dashboard',
  standalone: true,
  imports: [NgClass, CommonModule],
  templateUrl: './passenger-dashboard.component.html',
  styleUrl: './passenger-dashboard.component.css',
})
export class PassengerDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  passengerCount = 1;

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

  // Default to Cairo, Egypt
  private defaultCenter: L.LatLngExpression = [30.0444, 31.2357];

  ngOnInit(): void {
    // Fix for default markers in Leaflet
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
      iconUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
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
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.map);

    this.map.on("click", (e: L.LeafletMouseEvent) => {
      this.onMapClick(e.latlng);
    });

    // Get user's current location
    this.getCurrentLocation();
  }

  private onMapClick(latlng: L.LatLng): void {
    const location: Location = { lat: latlng.lat, lng: latlng.lng };

    if (this.isSelectingPickup) {
      this.setPickupLocation(location);
      this.isSelectingPickup = false;
    } else {
      this.setDropoffLocation(location);
    }

    this.emitLocationChange();
  }

  private setPickupLocation(location: Location): void {
    this.pickupLocation = location;

    if (this.pickupMarker) {
      this.map.removeLayer(this.pickupMarker);
    }

    const greenIcon = new L.Icon({
      iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    this.pickupMarker = L.marker([location.lat, location.lng], {
      icon: greenIcon,
    })
      .addTo(this.map)
      .bindPopup("موقع الانطلاق");
  }

  private setDropoffLocation(location: Location): void {
    this.dropoffLocation = location;

    if (this.dropoffMarker) {
      this.map.removeLayer(this.dropoffMarker);
    }

    const redIcon = new L.Icon({
      iconUrl:
        "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
    });

    this.dropoffMarker = L.marker([location.lat, location.lng], {
      icon: redIcon,
    })
      .addTo(this.map)
      .bindPopup("موقع الوصول");
  }

  setSelectionMode(isPickup: boolean): void {
    this.isSelectingPickup = isPickup;
  }

  async searchLocation(): Promise<void> {
    if (!this.searchQuery.trim()) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          this.searchQuery
        )}&limit=1&accept-language=ar`
      );
      const data = await response.json();

      if (data && data.length > 0) {
        const { lat, lon } = data[0];
        const location: Location = {
          lat: parseFloat(lat),
          lng: parseFloat(lon),
        };

        if (this.isSelectingPickup) {
          this.setPickupLocation(location);
          this.isSelectingPickup = false;
        } else {
          this.setDropoffLocation(location);
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
            this.isSelectingPickup = false;
          } else {
            this.setDropoffLocation(location);
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
}

