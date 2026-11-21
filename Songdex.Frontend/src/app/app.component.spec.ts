import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
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

  it('should link to songs and tags in the navigation, marking the active area', async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [provideRouter([{ path: 'tags', children: [] }])],
    }).compileComponents();
    const fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
    await TestBed.inject(Router).navigateByUrl('/tags');
    await fixture.whenStable();
    fixture.detectChanges();

    const links = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLAnchorElement>('nav a'),
    );
    expect(links.map((a) => [a.textContent?.trim(), a.getAttribute('href')])).toEqual([
      ['Songs', '/songs'],
      ['Tags', '/tags'],
    ]);
    expect(links.map((a) => a.classList.contains('active'))).toEqual([false, true]);
  });
});
