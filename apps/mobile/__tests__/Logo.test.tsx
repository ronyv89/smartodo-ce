import React from 'react';
import { render } from '@testing-library/react-native';

import LogoSvg from '../assets/icons/Logo';

describe('Logo SVG', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(React.createElement(LogoSvg));
    expect(toJSON()).toBeTruthy();
  });

  it('matches snapshot', () => {
    const { toJSON } = render(React.createElement(LogoSvg));
    expect(toJSON()).toMatchSnapshot();
  });
});
