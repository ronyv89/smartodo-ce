import { render, screen } from '@testing-library/react';
import { Code } from '../code';

describe('Code', () => {
  it('renders children', () => {
    render(<Code>const x = 1;</Code>);
    expect(screen.getByText('const x = 1;')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Code className="highlight">code</Code>);
    expect(screen.getByText('code')).toHaveClass('highlight');
  });

  it('renders without className', () => {
    render(<Code>no class</Code>);
    expect(screen.getByText('no class')).toBeInTheDocument();
  });
});
