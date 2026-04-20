import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('@/components/ui/box', () => ({
  Box: ({ children, ...props }: any) =>
    require('react').createElement('View', props, children),
}));

jest.mock('@/components/ui/text', () => ({
  Text: ({ children, ...props }: any) =>
    require('react').createElement('Text', props, children),
}));

jest.mock('@/components/ui/button', () => ({
  Button: ({ children, ...props }: any) =>
    require('react').createElement('View', props, children),
  ButtonText: ({ children, ...props }: any) =>
    require('react').createElement('Text', props, children),
}));

jest.mock('@/assets/icons/SmarTodoLogo', () => ({
  __esModule: true,
  default: () => require('react').createElement('View', { testID: 'logo' }),
}));

import LandingPage from '../app/index';

describe('LandingPage', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(React.createElement(LandingPage));
    expect(toJSON()).toBeTruthy();
  });

  it('renders the SmarTodo logo', () => {
    const { getByTestId } = render(React.createElement(LandingPage));
    expect(getByTestId('logo')).toBeTruthy();
  });

  it('renders Sign Up button text', () => {
    const { toJSON } = render(React.createElement(LandingPage));
    expect(JSON.stringify(toJSON())).toContain('Sign Up');
  });

  it('renders Log In button text', () => {
    const { toJSON } = render(React.createElement(LandingPage));
    expect(JSON.stringify(toJSON())).toContain('Log In');
  });

  it('renders the tagline', () => {
    const { toJSON } = render(React.createElement(LandingPage));
    expect(JSON.stringify(toJSON())).toContain('Smart task management, simplified.');
  });
});
