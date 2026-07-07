import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { NgIconComponent } from '@ng-icons/core';
import { LandingComponent } from './landing.component';

describe('LandingComponent', () => {
  let component: LandingComponent;
  let fixture: ComponentFixture<LandingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LandingComponent],
      imports: [RouterTestingModule, BrowserAnimationsModule, HttpClientTestingModule, NgIconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with features hidden', () => {
    expect((component as any).featuresState()).toBe('hidden');
  });

  it('should have teaser events for unauthenticated users', () => {
    expect((component as any).teaserEvents.length).toBe(3);
  });

  it('should format dates correctly', () => {
    const formatted = (component as any).formatDate('2026-05-15T10:00:00');
    expect(formatted).toContain('2026');
  });
});
