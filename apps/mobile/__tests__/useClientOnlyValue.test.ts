import { useClientOnlyValue } from '../components/useClientOnlyValue';

describe('useClientOnlyValue (native)', () => {
  it('returns client value for strings', () => {
    expect(useClientOnlyValue('server', 'client')).toBe('client');
  });

  it('returns client value for numbers', () => {
    expect(useClientOnlyValue(0, 42)).toBe(42);
  });

  it('returns client value when server is null', () => {
    expect(useClientOnlyValue(null, 'value')).toBe('value');
  });

  it('returns false as client value', () => {
    expect(useClientOnlyValue(true, false)).toBe(false);
  });
});
