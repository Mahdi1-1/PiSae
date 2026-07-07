import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MyBadgesComponent } from './my-badges.component';

describe('MyBadgesComponent', () => {
  let component: MyBadgesComponent;
  let fixture: ComponentFixture<MyBadgesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [MyBadgesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MyBadgesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
