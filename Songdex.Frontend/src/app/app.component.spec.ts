import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('should show the logo in the header, linking to the song list', () => {
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();

    const link = (fixture.nativeElement as HTMLElement).querySelector<HTMLAnchorElement>(
      'header a',
    );
    const logo = link?.querySelector('img');
    expect(link?.getAttribute('href')).toBe('/songs');
    expect(logo?.getAttribute('src')).toBe('assets/Songdex-Logo-transparent.png');
    expect(logo?.getAttribute('alt')).toBe('Songdex');
  });
});
