import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('@/global.css', () => {});

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));

jest.mock('expo-font', () => ({
  useFonts: jest.fn(() => [true, null]),
}));

jest.mock('expo-status-bar', () => ({
  StatusBar: () => null,
}));

jest.mock('expo-router', () => ({
  Slot: () => null,
  ErrorBoundary: ({ children }: any) => children,
}));

jest.mock('@/components/ui/gluestack-ui-provider', () => ({
  GluestackUIProvider: ({ children }: any) =>
    require('react').createElement('View', null, children),
}));

import RootLayout from '../app/_layout';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';

describe('RootLayout', () => {
  it('calls preventAutoHideAsync at module load', () => {
    expect(SplashScreen.preventAutoHideAsync).toHaveBeenCalled();
  });

  describe('rendering', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      (useFonts as jest.Mock).mockReturnValue([true, null]);
    });

    it('renders without crashing', () => {
      const { toJSON } = render(React.createElement(RootLayout));
      expect(toJSON()).toBeTruthy();
    });

    it('calls hideAsync when fonts are loaded', () => {
      render(React.createElement(RootLayout));
      expect(SplashScreen.hideAsync).toHaveBeenCalled();
    });

    it('does not call hideAsync when fonts are not yet loaded', () => {
      (useFonts as jest.Mock).mockReturnValue([false, null]);
      render(React.createElement(RootLayout));
      expect(SplashScreen.hideAsync).not.toHaveBeenCalled();
    });

    it('throws when useFonts returns an error', () => {
      const fontError = new Error('Font load failed');
      (useFonts as jest.Mock).mockReturnValue([false, fontError]);

      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      try {
        expect(() => {
          render(React.createElement(RootLayout));
        }).toThrow('Font load failed');
      } finally {
        consoleError.mockRestore();
      }
    });
  });
});
