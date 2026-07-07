import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { Oauth2CallbackComponent } from './oauth2-callback';

@Component({
  standalone: true,
  template: '',
  selector: 'app-dummy-login'
})
class DummyComponent {}

describe('Oauth2CallbackComponent', () => {
  let component: Oauth2CallbackComponent;
  let fixture: ComponentFixture<Oauth2CallbackComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Oauth2CallbackComponent],
      providers: [
        provideRouter([
          { path: 'auth/login', component: DummyComponent },
          { path: 'auth/reset-password', component: DummyComponent },
          { path: 'app/dashboard', component: DummyComponent }
        ]),
        provideHttpClient(),
        provideHttpClientTesting()
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(Oauth2CallbackComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
