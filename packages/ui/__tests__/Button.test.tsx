import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../src/components/ui/button/Button';
import React from 'react';

describe('Button Component', () => {
  it('renders default button correctly', () => {
    render(<Button>Click Me</Button>);
    expect(screen.getByText('Click Me')).toBeInTheDocument();
  });

  it('renders disabled state', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByText('Disabled')).toBeDisabled();
  });

  it('triggers onClick handler', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Clickable</Button>);
    fireEvent.click(screen.getByText('Clickable'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('renders different variants', () => {
    render(<Button variant="outline">Outline</Button>);
    expect(screen.getByText('Outline')).toBeInTheDocument();
  });

  it('renders with custom size', () => {
    render(<Button size="sm">Small</Button>);
    expect(screen.getByText('Small')).toBeInTheDocument();
  });

  it('renders with start and end icons', () => {
    render(<Button startIcon={<span>StartIcon</span>} endIcon={<span>EndIcon</span>}>Iconned</Button>);
    expect(screen.getByText('StartIcon')).toBeInTheDocument();
    expect(screen.getByText('EndIcon')).toBeInTheDocument();
  });
});
