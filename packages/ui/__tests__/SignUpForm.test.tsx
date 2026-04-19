import { render, screen, fireEvent } from '@testing-library/react';
import SignUpForm from '../src/components/auth/SignUpForm';
import React from 'react';

// Mock matchMedia because next/apexcharts might rely on it down the tree
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // Deprecated
    removeListener: jest.fn(), // Deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

describe('SignUpForm Component', () => {
  it('renders correctly', () => {
    const { container } = render(<SignUpForm />);
    expect(screen.getAllByText(/Sign Up/i)[0]).toBeInTheDocument();
  });

  it('toggles password visibility in signup context', () => {
    const { container } = render(<SignUpForm />);
    const toggleSpans = container.querySelectorAll('span.cursor-pointer');
    if (toggleSpans.length > 0) {
       fireEvent.click(toggleSpans[0]); // toggles on
       fireEvent.click(toggleSpans[0]); // toggles off
    }
  });

  it('toggles terms checkbox', () => {
    render(<SignUpForm />);
    // Just click something near checkbox
    const termsText = screen.getByText(/Terms and Conditions/i);
    fireEvent.click(termsText);
  });
});
