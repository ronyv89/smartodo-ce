import { Colors } from '../constants/Colors';

describe('Colors', () => {
  describe('light theme', () => {
    it('has correct text color', () => expect(Colors.light.text).toBe('#11181C'));
    it('has correct background color', () => expect(Colors.light.background).toBe('#fff'));
    it('has correct tint color', () => expect(Colors.light.tint).toBe('#0a7ea4'));
    it('has correct icon color', () => expect(Colors.light.icon).toBe('#687076'));
    it('has correct tabIconDefault color', () => expect(Colors.light.tabIconDefault).toBe('#687076'));
    it('has correct tabIconSelected color', () => expect(Colors.light.tabIconSelected).toBe('#0a7ea4'));
  });

  describe('dark theme', () => {
    it('has correct text color', () => expect(Colors.dark.text).toBe('#ECEDEE'));
    it('has correct background color', () => expect(Colors.dark.background).toBe('#151718'));
    it('has correct tint color', () => expect(Colors.dark.tint).toBe('#fff'));
    it('has correct icon color', () => expect(Colors.dark.icon).toBe('#9BA1A6'));
    it('has correct tabIconDefault color', () => expect(Colors.dark.tabIconDefault).toBe('#9BA1A6'));
    it('has correct tabIconSelected color', () => expect(Colors.dark.tabIconSelected).toBe('#fff'));
  });
});
