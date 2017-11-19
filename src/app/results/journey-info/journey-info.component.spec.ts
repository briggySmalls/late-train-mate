import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JourneyInfoComponent } from './journey-info.component';

describe('JourneyInfoComponent', () => {
  let component: JourneyInfoComponent;
  let fixture: ComponentFixture<JourneyInfoComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JourneyInfoComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JourneyInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
