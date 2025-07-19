import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuggestTripComponent } from './suggest-trip.component';

describe('SuggestTripComponent', () => {
  let component: SuggestTripComponent;
  let fixture: ComponentFixture<SuggestTripComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuggestTripComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuggestTripComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
