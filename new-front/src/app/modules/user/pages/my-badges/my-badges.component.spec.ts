import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { MyBadgesComponent } from './my-badges.component';

describe('MyBadgesComponent', () => {
  let component: MyBadgesComponent;
  let fixture: ComponentFixture<MyBadgesComponent>;
  let httpMock: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MyBadgesComponent], // standalone : s'importe, ne se déclare pas
      providers: [provideHttpClient(), provideHttpClientTesting()],
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyBadgesComponent);
    component = fixture.componentInstance;
    httpMock = TestBed.inject(HttpTestingController);
    fixture.detectChanges();
  });

  afterEach(() => httpMock.verify());

  it('should create', () => {
    expect(component).toBeTruthy();
    httpMock.expectOne(() => true).flush([]); // ngOnInit() déclenche un appel HTTP réel
  });
});
