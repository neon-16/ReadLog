import { formatBookStatus } from '@/src/features/books/components/BookDetailSections';

describe('formatBookStatus', () => {
  it('maps reading status label', () => {
    expect(formatBookStatus('reading')).toBe('Reading');
  });

  it('maps want_to_read status label', () => {
    expect(formatBookStatus('want_to_read')).toBe('Want to Read');
  });

  it('maps finished status label', () => {
    expect(formatBookStatus('finished')).toBe('Finished');
  });

  it('returns unknown statuses unchanged', () => {
    expect(formatBookStatus('paused')).toBe('paused');
  });
});
