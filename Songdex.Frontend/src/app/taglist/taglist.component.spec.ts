import { type ComponentFixture, TestBed } from '@angular/core/testing';
import { MockProvider } from 'ng-mocks';
import { type Observable, of, Subject, throwError } from 'rxjs';
import type { Mock } from 'vitest';
import type { TagSummary } from '../models/tag';
import { TagService } from '../services/tag.service';
import { stubDialog } from '../shared/confirm-dialog/dialog.testing';
import { TAG_STATE, type TagState } from '../store/tag.store';
import { TaglistComponent } from './taglist.component';

describe('TaglistComponent', () => {
  const acoustic: TagSummary = { id: 't1', name: 'Acoustic', songCount: 3 };
  const rehearsed: TagSummary = { id: 't2', name: 'Rehearsed', songCount: 1 };
  const summer: TagSummary = { id: 't3', name: 'Summer party', songCount: 0 };

  let fixture: ComponentFixture<TaglistComponent>;
  let fetchTags: Mock<() => void>;
  let renameTag: Mock<(id: string, name: string) => Observable<TagSummary>>;
  let deleteTag: Mock<(id: string) => Observable<void>>;
  let mergeTags: Mock<(sourceId: string, targetId: string) => Observable<TagSummary>>;

  const setup = async (state: Partial<TagState> = {}) => {
    stubDialog();
    fetchTags = vi.fn<() => void>();
    renameTag = vi.fn<(id: string, name: string) => Observable<TagSummary>>((id, name) =>
      of({ id, name, songCount: 0 }),
    );
    deleteTag = vi.fn<(id: string) => Observable<void>>(() => of(undefined));
    mergeTags = vi.fn<(sourceId: string, targetId: string) => Observable<TagSummary>>(() =>
      of(rehearsed),
    );
    await TestBed.configureTestingModule({
      imports: [TaglistComponent],
      providers: [
        MockProvider(TagService, { fetchTags, renameTag, deleteTag, mergeTags }),
        {
          provide: TAG_STATE,
          useValue: {
            allTags: [summer, acoustic, rehearsed],
            loading: false,
            error: null,
            ...state,
          } satisfies TagState,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(TaglistComponent);
    fixture.detectChanges();
  };

  const el = (): HTMLElement => fixture.nativeElement;
  const rows = () => Array.from(el().querySelectorAll('tbody tr'));
  const row = (name: string) => {
    const found = rows().find((r) => r.querySelector('td')?.textContent?.trim() === name);
    if (!found) {
      throw new Error(`no row for ${name}`);
    }
    return found;
  };
  const button = (scope: Element, label: string) => {
    const found = Array.from(scope.querySelectorAll<HTMLButtonElement>('button')).find(
      (b) => b.textContent?.trim() === label,
    );
    if (!found) {
      throw new Error(`no button ${label}`);
    }
    return found;
  };
  const click = (scope: Element, label: string) => {
    button(scope, label).click();
    fixture.detectChanges();
  };
  const dialogs = () => Array.from(el().querySelectorAll<HTMLDialogElement>('dialog'));
  const openDialog = () => dialogs().find((d) => d.hasAttribute('open'));

  describe('overview', () => {
    it('should load the tags when it opens', async () => {
      await setup();

      expect(fetchTags).toHaveBeenCalledTimes(1);
    });

    it('should list the tags by name with their song counts', async () => {
      await setup();

      const cells = rows().map((r) =>
        Array.from(r.querySelectorAll('td'))
          .slice(0, 2)
          .map((td) => td.textContent?.trim()),
      );
      expect(cells).toEqual([
        ['Acoustic', '3'],
        ['Rehearsed', '1'],
        ['Summer party', 'unused'],
      ]);
    });

    it('should make unused tags recognisable', async () => {
      await setup();

      expect(el().textContent).toContain('3 tags · 1 unused');
      expect(row('Summer party').classList).toContain('opacity-60');
      expect(row('Acoustic').classList).not.toContain('opacity-60');
    });

    it('should explain where tags come from when there are none', async () => {
      await setup({ allTags: [] });

      expect(el().querySelector('table')).toBeNull();
      expect(el().textContent).toContain('No tags yet.');
    });

    it('should show an error above the table and reload on request', async () => {
      await setup({ error: 'This tag no longer exists.' });

      expect(el().querySelector('[role="alert"]')?.textContent).toContain(
        'This tag no longer exists.',
      );
      expect(el().querySelector('table')).not.toBeNull();
      click(el(), 'Reload');
      expect(fetchTags).toHaveBeenCalledTimes(2);
    });
  });

  describe('rename', () => {
    const nameField = () => el().querySelector<HTMLInputElement>('td input');
    const typeName = (name: string) => {
      const field = nameField();
      if (!field) {
        throw new Error('no name field');
      }
      field.value = name;
      field.dispatchEvent(new Event('input'));
      fixture.detectChanges();
    };

    it('should edit the name in place and save it trimmed', async () => {
      await setup();
      click(row('Acoustic'), 'Rename');
      expect(nameField()?.value).toBe('Acoustic');

      typeName('  Unplugged ');
      click(el(), 'Save');

      expect(renameTag).toHaveBeenCalledWith('t1', 'Unplugged');
      expect(nameField()).toBeNull();
    });

    it('should save on Enter and cancel on Escape', async () => {
      await setup();
      click(row('Acoustic'), 'Rename');
      typeName('Unplugged');
      nameField()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
      fixture.detectChanges();
      expect(nameField()).toBeNull();
      expect(renameTag).not.toHaveBeenCalled();

      click(row('Acoustic'), 'Rename');
      typeName('Unplugged');
      nameField()?.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
      fixture.detectChanges();
      expect(renameTag).toHaveBeenCalledWith('t1', 'Unplugged');
    });

    it('should not call the backend for an unchanged name', async () => {
      await setup();
      click(row('Acoustic'), 'Rename');

      click(el(), 'Save');

      expect(renameTag).not.toHaveBeenCalled();
      expect(nameField()).toBeNull();
    });

    it('should refuse a blank or too long name', async () => {
      await setup();
      click(row('Acoustic'), 'Rename');

      typeName('   ');
      click(el(), 'Save');
      expect(el().querySelector('td [role="alert"]')?.textContent).toContain('needs a name');

      typeName('x'.repeat(51));
      click(el(), 'Save');
      expect(el().querySelector('td [role="alert"]')?.textContent).toContain('50 characters');
      expect(renameTag).not.toHaveBeenCalled();
    });

    it('should stay in edit mode when the backend refuses', async () => {
      await setup();
      renameTag.mockReturnValue(throwError(() => new Error('409')));
      click(row('Acoustic'), 'Rename');
      typeName('Rehearsed');

      click(el(), 'Save');

      expect(nameField()?.value).toBe('Rehearsed');
    });
  });

  describe('delete', () => {
    it('should ask first, naming the tag and how many songs lose it', async () => {
      await setup();

      click(row('Acoustic'), 'Delete');

      expect(openDialog()?.textContent).toContain('Delete this tag?');
      expect(openDialog()?.textContent).toContain('“Acoustic”: It will be removed from 3 songs.');
      expect(deleteTag).not.toHaveBeenCalled();
    });

    it('should say so when no song carries the tag', async () => {
      await setup();

      click(row('Summer party'), 'Delete');

      expect(openDialog()?.textContent).toContain('No song carries it.');
    });

    it('should delete once confirmed', async () => {
      await setup();
      click(row('Rehearsed'), 'Delete');

      openDialog()?.close('confirm');
      await fixture.whenStable();

      expect(deleteTag).toHaveBeenCalledWith('t2');
    });

    it('should keep the tag when the question is dismissed', async () => {
      await setup();
      click(row('Rehearsed'), 'Delete');

      openDialog()?.close('cancel');
      await fixture.whenStable();

      expect(deleteTag).not.toHaveBeenCalled();
    });
  });

  describe('merge', () => {
    const targetSelect = () => el().querySelector<HTMLSelectElement>('td select');
    const pickTarget = (id: string) => {
      const select = targetSelect();
      if (!select) {
        throw new Error('no target select');
      }
      select.value = id;
      select.dispatchEvent(new Event('change'));
      fixture.detectChanges();
    };

    it('should offer every other tag as the target', async () => {
      await setup();

      click(row('Acoustic'), 'Merge');

      const options = Array.from(targetSelect()?.querySelectorAll('option') ?? [])
        .filter((o) => o.value !== '')
        .map((o) => o.textContent?.trim());
      expect(options).toEqual(['Rehearsed', 'Summer party']);
      expect(button(row('Acoustic'), 'Merge').disabled).toBe(true);
    });

    it('should explain the merge, and merge once confirmed', async () => {
      await setup();
      click(row('Acoustic'), 'Merge');
      pickTarget('t2');

      click(row('Acoustic'), 'Merge');
      expect(openDialog()?.textContent).toContain(
        'Songs tagged “Acoustic” will be tagged “Rehearsed” instead, and “Acoustic” will be deleted.',
      );
      openDialog()?.close('confirm');
      await fixture.whenStable();
      fixture.detectChanges();

      expect(mergeTags).toHaveBeenCalledWith('t1', 't2');
      expect(targetSelect()).toBeNull();
    });

    it('should not merge when the question is dismissed', async () => {
      await setup();
      click(row('Acoustic'), 'Merge');
      pickTarget('t3');
      click(row('Acoustic'), 'Merge');

      openDialog()?.close('cancel');
      await fixture.whenStable();

      expect(mergeTags).not.toHaveBeenCalled();
    });

    it('should not offer merging while there is only one tag', async () => {
      await setup({ allTags: [acoustic] });

      expect(button(row('Acoustic'), 'Merge').disabled).toBe(true);
    });

    it('should ignore a second change while one is still running', async () => {
      await setup();
      const pending = new Subject<void>();
      deleteTag.mockReturnValue(pending);
      click(row('Rehearsed'), 'Delete');
      openDialog()?.close('confirm');
      await fixture.whenStable();
      fixture.detectChanges();

      expect(button(row('Acoustic'), 'Delete').disabled).toBe(true);
    });
  });
});
