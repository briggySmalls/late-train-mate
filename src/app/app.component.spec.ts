import { AppComponent } from './app.component';
import { AppModule } from './app.module';
import { HspApiService } from './hsp-api.service';
import { ResourceService } from './national_rail/resource.service';

import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';

describe('AppComponent', function () {
  let de: DebugElement;
  let comp: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  // Configure the test bed
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ],
      imports: [ AppModule ],
      providers: [
        {provide: APP_BASE_HREF, useValue: '/'}
      ]
    })
    .compileComponents();
  }));

  // Create the component under test
  beforeEach(() => {
    fixture = TestBed.createComponent(AppComponent);
    comp = fixture.componentInstance;
    de = fixture.debugElement.query(By.css('.title'));
  });

  // Test component created
  it('should create component', () => expect(comp).toBeDefined() );

  // Test title
  it('should have expected <h1> text', () => {
    fixture.detectChanges();
    const h1 = de.nativeElement;
    expect(h1.innerText).toMatch(/Late Mate/i,
      '<h1> should say something about "Late Mate"');
  });
});
