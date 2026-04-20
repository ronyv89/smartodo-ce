import React from 'react';
import { render } from '@testing-library/react-native';

import GradientSvg from '../assets/icons/Gradient';

describe('Gradient SVG', () => {
  it('renders without crashing', () => {
    const { toJSON } = render(React.createElement(GradientSvg));
    expect(toJSON()).toBeTruthy();
  });

  it('matches snapshot', () => {
    const { toJSON } = render(React.createElement(GradientSvg));
    expect(toJSON()).toMatchSnapshot();
  });
});
