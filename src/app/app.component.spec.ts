import { async, ComponentFixture, TestBed, getTestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { DebugElement } from '@angular/core';
import { APP_BASE_HREF } from '@angular/common';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { AppComponent } from './app.component';
import { AppModule } from './app.module';

describe('AppComponent', function () {
  let de: DebugElement;
  let comp: AppComponent;
  let fixture: ComponentFixture<AppComponent>;

  // Configure the test bed
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [],
      imports: [
        AppModule,
        HttpClientTestingModule
      ],
      providers: [
        {provide: APP_BASE_HREF, useValue: '/'}
      ]
    })
    // TODO: .overrideComponent
    .compileComponents();

    // Create the component under test
    fixture = TestBed.createComponent(AppComponent);
    comp = fixture.componentInstance;
    de = fixture.debugElement.query(By.css('.title'));
  }));

  // Test component created
  it('should create component', () => expect(comp).toBeDefined() );

  // Test title
  it('should have expected <h1> text', () => {
    fixture.detectChanges();
    const h1 = de.nativeElement;
    expect(h1).not.toBeNull();
    expect(h1.innerText).toMatch(/Late Mate/i,
      '<h1> should say something about "Late Mate"');
  });
});
