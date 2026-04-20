import React from 'react';
import { render } from '@testing-library/react-native';

import SmarTodoLogo from '../assets/icons/SmarTodoLogo';

describe('SmarTodoLogo SVG', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(React.createElement(SmarTodoLogo));
    expect(toJSON()).toBeTruthy();
  });

  it('matches snapshot', () => {
    const { toJSON } = render(React.createElement(SmarTodoLogo));
    expect(toJSON()).toMatchSnapshot();
  });
});
