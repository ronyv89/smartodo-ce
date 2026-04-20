import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('expo-router', () => ({
  Link: ({ children, ...props }: any) =>
    require('react').createElement('View', props, children),
  Stack: {
    Screen: () => null,
  },
}));

jest.mock('@/components/ui/text', () => ({
  Text: ({ children, ...props }: any) =>
    require('react').createElement('Text', props, children),
}));

jest.mock('@/components/ui/center', () => ({
  Center: ({ children, ...props }: any) =>
    require('react').createElement('View', props, children),
}));

import NotFoundScreen from '../app/+not-found';

describe('NotFoundScreen', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(React.createElement(NotFoundScreen));
    expect(toJSON()).toBeTruthy();
  });

  it('renders the "screen does not exist" message', () => {
    const { toJSON } = render(React.createElement(NotFoundScreen));
    expect(JSON.stringify(toJSON())).toContain("This screen doesn't exist.");
  });

  it('renders the home link', () => {
    const { toJSON } = render(React.createElement(NotFoundScreen));
    expect(JSON.stringify(toJSON())).toContain('Go to home screen!');
  });
});
