import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn(),
}));

jest.mock('expo-router', () => ({
  Link: ({ children, ...props }: any) =>
    require('react').createElement('View', props, children),
}));

jest.mock('@/components/ui/box', () => ({
  Box: ({ children, ...props }: any) =>
    require('react').createElement('View', props, children),
}));

jest.mock('@/components/ui/text', () => ({
  Text: ({ children, ...props }: any) =>
    require('react').createElement('Text', props, children),
}));

import EditScreenInfo from '../components/EditScreenInfo';

describe('EditScreenInfo', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(
      React.createElement(EditScreenInfo, { path: 'app/index.tsx' })
    );
    expect(toJSON()).toBeTruthy();
  });

  it('displays the provided path', () => {
    const { toJSON } = render(
      React.createElement(EditScreenInfo, { path: 'app/screens/home.tsx' })
    );
    expect(JSON.stringify(toJSON())).toContain('app/screens/home.tsx');
  });

  it('renders static instructional text', () => {
    const { toJSON } = render(
      React.createElement(EditScreenInfo, { path: 'app/index.tsx' })
    );
    expect(JSON.stringify(toJSON())).toContain('Open up the code');
  });
});
