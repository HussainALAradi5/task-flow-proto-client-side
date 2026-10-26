import { TestBed } from '@angular/core/testing';
import { GenericProgressBarComponent } from './generic-progress-bar.component';

describe('GenericProgressBarComponent', () => {
  it('clamps the displayed value and exposes its label to assistive technology', async () => {
    await TestBed.configureTestingModule({ imports: [GenericProgressBarComponent] }).compileComponents();
    const fixture = TestBed.createComponent(GenericProgressBarComponent);
    fixture.componentRef.setInput('label', 'Project progress');
    fixture.componentRef.setInput('value', 140);
    fixture.detectChanges();

    const bar = fixture.nativeElement.querySelector('[role="progressbar"]') as HTMLElement;
    const fill = bar.firstElementChild as HTMLElement;
    expect(bar.getAttribute('aria-label')).toBe('Project progress');
    expect(bar.getAttribute('aria-valuenow')).toBe('100');
    expect(fill.style.width).toBe('100%');

    fixture.componentRef.setInput('value', -10);
    fixture.detectChanges();
    expect(bar.getAttribute('aria-valuenow')).toBe('0');
    expect(fill.style.width).toBe('0%');
  });
});
