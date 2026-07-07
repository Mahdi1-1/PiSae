import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { LandingLayoutComponent } from './landing-layout.component';
import { NgIconComponent } from '@ng-icons/core';

describe('LandingLayoutComponent', () => {
  let component: LandingLayoutComponent;
  let fixture: ComponentFixture<LandingLayoutComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [LandingLayoutComponent],
      imports: [RouterTestingModule, BrowserAnimationsModule, NgIconComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(LandingLayoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should start with pills in hidden state', () => {
    expect((component as any).pillState()).toBe('hidden');
  });

  it('should show badge after settling', (done) => {
    setTimeout(() => {
      expect((component as any).showBadge()).toBe(true);
      done();
    }, 1100);
  });
});
