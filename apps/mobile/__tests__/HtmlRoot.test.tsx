import React from 'react';
import { render } from '@testing-library/react-native';

jest.mock('expo-router/html', () => ({
  ScrollViewStyleReset: () => null,
}));

import Root from '../app/+html';

describe('Root (HTML layout)', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(
      React.createElement(Root, null, React.createElement('div', null, 'content'))
    );
    expect(toJSON()).toBeTruthy();
  });

  it('renders children', () => {
    const { toJSON } = render(
      React.createElement(Root, null, React.createElement('div', null, 'page content'))
    );
    expect(JSON.stringify(toJSON())).toContain('page content');
  });

  it('renders meta charset tag', () => {
    const { toJSON } = render(React.createElement(Root, null, null));
    expect(JSON.stringify(toJSON())).toContain('utf-8');
  });

  it('renders viewport meta tag', () => {
    const { toJSON } = render(React.createElement(Root, null, null));
    expect(JSON.stringify(toJSON())).toContain('width=device-width');
  });
});
