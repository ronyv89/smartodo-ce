import React from 'react';
import { render, renderHook } from '@testing-library/react-native';

jest.mock('../components/useColorScheme', () => ({
  useColorScheme: jest.fn(() => 'light'),
}));

import { useThemeColor, Text, View } from '../components/Themed';

const mockUseColorScheme: jest.Mock = require('../components/useColorScheme').useColorScheme;

describe('useThemeColor', () => {
  beforeEach(() => {
    mockUseColorScheme.mockReturnValue('light');
  });

  it('returns light colorFromProps when theme is light', () => {
    const { result } = renderHook(() =>
      useThemeColor({ light: '#custom-light', dark: '#custom-dark' }, 'text')
    );
    expect(result.current).toBe('#custom-light');
  });

  it('returns Colors.light.text when no light prop provided', () => {
    const { result } = renderHook(() => useThemeColor({}, 'text'));
    expect(result.current).toBe('#11181C');
  });

  it('returns Colors.light.background when no props provided', () => {
    const { result } = renderHook(() => useThemeColor({}, 'background'));
    expect(result.current).toBe('#fff');
  });

  it('returns dark colorFromProps when theme is dark', () => {
    mockUseColorScheme.mockReturnValue('dark');
    const { result } = renderHook(() =>
      useThemeColor({ light: '#light', dark: '#custom-dark' }, 'text')
    );
    expect(result.current).toBe('#custom-dark');
  });

  it('returns Colors.dark.text when no dark prop provided in dark theme', () => {
    mockUseColorScheme.mockReturnValue('dark');
    const { result } = renderHook(() => useThemeColor({}, 'text'));
    expect(result.current).toBe('#ECEDEE');
  });

  it('falls back to light theme when useColorScheme returns null', () => {
    mockUseColorScheme.mockReturnValue(null);
    const { result } = renderHook(() => useThemeColor({}, 'text'));
    expect(result.current).toBe('#11181C');
  });
});

describe('Text component', () => {
  beforeEach(() => {
    mockUseColorScheme.mockReturnValue('light');
  });

  it('renders without crashing', () => {
    const { toJSON } = render(React.createElement(Text, null, 'Hello'));
    expect(toJSON()).toBeTruthy();
  });

  it('renders with custom lightColor', () => {
    const { toJSON } = render(
      React.createElement(Text, { lightColor: '#aaa' }, 'Custom')
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders with custom darkColor in dark theme', () => {
    mockUseColorScheme.mockReturnValue('dark');
    const { toJSON } = render(
      React.createElement(Text, { darkColor: '#bbb' }, 'Dark')
    );
    expect(toJSON()).toBeTruthy();
  });
});

describe('View component', () => {
  beforeEach(() => {
    mockUseColorScheme.mockReturnValue('light');
  });

  it('renders without crashing', () => {
    const { toJSON } = render(React.createElement(View, null));
    expect(toJSON()).toBeTruthy();
  });

  it('renders with custom lightColor', () => {
    const { toJSON } = render(
      React.createElement(View, { lightColor: '#eee' })
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders with custom darkColor in dark theme', () => {
    mockUseColorScheme.mockReturnValue('dark');
    const { toJSON } = render(
      React.createElement(View, { darkColor: '#222' })
    );
    expect(toJSON()).toBeTruthy();
  });
});
