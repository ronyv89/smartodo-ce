import { render, screen } from '@testing-library/react';
import Badge from '../src/components/ui/badge/Badge';
import React from 'react';

describe('Badge Component', () => {
  it('renders badge correctly', () => {
    render(<Badge>Default Badge</Badge>);
    expect(screen.getByText('Default Badge')).toBeInTheDocument();
  });

  it('renders with solid variant', () => {
    render(<Badge variant="solid">Solid Badge</Badge>);
    expect(screen.getByText('Solid Badge')).toBeInTheDocument();
  });

  it('renders different variants', () => {
    render(<Badge color="success">Success Badge</Badge>);
    expect(screen.getByText('Success Badge')).toBeInTheDocument();
  });

  it('renders start and end icons', () => {
    render(<Badge startIcon={<span>Start</span>} endIcon={<span>End</span>}>Icons</Badge>);
    expect(screen.getByText('Start')).toBeInTheDocument();
    expect(screen.getByText('End')).toBeInTheDocument();
  });
});
