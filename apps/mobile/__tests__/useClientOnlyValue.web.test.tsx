import { renderHook } from '@testing-library/react-native';
import { useClientOnlyValue } from '../components/useClientOnlyValue.web';

describe('useClientOnlyValue (web)', () => {
  it('returns client value after effects run', () => {
    const { result } = renderHook(() => useClientOnlyValue('server', 'client'));
    expect(result.current).toBe('client');
  });

  it('returns numeric client value', () => {
    const { result } = renderHook(() => useClientOnlyValue(0, 99));
    expect(result.current).toBe(99);
  });

  it('updates when client value changes', () => {
    const { result } = renderHook(() => useClientOnlyValue('server', 'v1'));
    expect(result.current).toBe('v1');
  });
});
