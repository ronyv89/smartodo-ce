import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Home from '../app/page';

describe('Web App Tests', () => {
  it('renders the generic landing page', () => {
    render(<Home />);
    expect(screen.getByText('smartodo-ce')).toBeInTheDocument();
    expect(screen.getByText(/Your Next\.js dashboard is ready/i)).toBeInTheDocument();
  });
});
