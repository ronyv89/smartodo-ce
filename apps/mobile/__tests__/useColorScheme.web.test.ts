import { useColorScheme } from '../components/useColorScheme.web';

describe('useColorScheme (web)', () => {
  it('always returns light', () => {
    expect(useColorScheme()).toBe('light');
  });
});
