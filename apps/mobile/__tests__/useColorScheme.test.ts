import { useColorScheme } from '../components/useColorScheme';

describe('useColorScheme (native)', () => {
  it('exports useColorScheme as a function', () => {
    expect(typeof useColorScheme).toBe('function');
  });
});
