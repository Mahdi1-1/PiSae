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
    if (!window.IntersectionObserver) {
      class MockIntersectionObserver {
        readonly root: Element | null = null;
        readonly rootMargin: string = '';
        readonly thresholds: ReadonlyArray<number> = [];
        constructor(public callback: IntersectionObserverCallback, options?: IntersectionObserverInit) {}
        observe(target: Element): void {}
        unobserve(target: Element): void {}
        disconnect(): void {}
      }
      Object.defineProperty(window, 'IntersectionObserver', {
        writable: true,
        configurable: true,
        value: MockIntersectionObserver
      });
    }

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
});
