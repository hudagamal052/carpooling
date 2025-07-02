import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgClass, CommonModule } from '@angular/common';
@Component({
  selector: 'app-landing',
  imports: [NgClass, CommonModule],
  templateUrl: './landing.component.html',
  styleUrl: './landing.component.css'
})
export class LandingComponent implements OnInit, OnDestroy {
  showMore = false;
  carImages = [
    'car1.png',
    'car2.png',
    'car3.png',
    'car4.png',
    'car5.png'
  ];
  currentCarIndex = 0;
  currentCarImage = this.carImages[0];
  private intervalId: any;

  ngOnInit() {
    this.intervalId = setInterval(() => {
      this.currentCarIndex = (this.currentCarIndex + 1) % this.carImages.length;
      this.currentCarImage = this.carImages[this.currentCarIndex];
    }, 2000);
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }
}

// Features section is static and does not require logic for now.
