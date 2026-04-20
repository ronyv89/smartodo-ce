import React from 'react';
import { render, act } from '@testing-library/react-native';
import { Platform } from 'react-native';

jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn(),
}));

let capturedOnPress: ((e: { preventDefault: jest.Mock }) => void) | undefined;

jest.mock('expo-router', () => ({
  Link: jest.fn(({ onPress, children, ...props }: any) => {
    capturedOnPress = onPress;
    return require('react').createElement('View', props, children);
  }),
}));

import { ExternalLink } from '../components/ExternalLink';
import * as WebBrowser from 'expo-web-browser';

describe('ExternalLink', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedOnPress = undefined;
  });

  it('renders without crashing', () => {
    const { toJSON } = render(
      React.createElement(ExternalLink, { href: 'https://example.com' } as any)
    );
    expect(toJSON()).toBeTruthy();
  });

  describe('on native (non-web)', () => {
    let originalOS: string;

    beforeEach(() => {
      originalOS = Platform.OS;
      (Platform as any).OS = 'ios';
    });

    afterEach(() => {
      (Platform as any).OS = originalOS;
    });

    it('prevents default and calls openBrowserAsync', () => {
      render(
        React.createElement(ExternalLink, { href: 'https://example.com' } as any)
      );

      const mockEvent = { preventDefault: jest.fn() };
      act(() => {
        capturedOnPress!(mockEvent);
      });

      expect(mockEvent.preventDefault).toHaveBeenCalled();
      expect(WebBrowser.openBrowserAsync).toHaveBeenCalledWith('https://example.com');
    });
  });

  describe('on web', () => {
    let originalOS: string;

    beforeEach(() => {
      originalOS = Platform.OS;
      (Platform as any).OS = 'web';
    });

    afterEach(() => {
      (Platform as any).OS = originalOS;
    });

    it('does not call openBrowserAsync', () => {
      render(
        React.createElement(ExternalLink, { href: 'https://example.com' } as any)
      );

      const mockEvent = { preventDefault: jest.fn() };
      act(() => {
        capturedOnPress!(mockEvent);
      });

      expect(mockEvent.preventDefault).not.toHaveBeenCalled();
      expect(WebBrowser.openBrowserAsync).not.toHaveBeenCalled();
    });
  });
});
