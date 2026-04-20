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
    render(<SignUpForm />);
    expect(screen.getAllByText(/Sign Up/i)[0]).toBeInTheDocument();
  });

  it('toggles password visibility in signup context', () => {
    const { container } = render(<SignUpForm />);

    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    expect(passwordInput).toBeInTheDocument();

    const toggleSpan = container.querySelector('span.cursor-pointer') as HTMLElement;
    expect(toggleSpan).toBeInTheDocument();

    fireEvent.click(toggleSpan); // toggles on — password becomes text
    expect(container.querySelector('input[type="text"]')).toBeInTheDocument();

    fireEvent.click(toggleSpan); // toggles off — back to password
    expect(container.querySelector('input[type="password"]')).toBeInTheDocument();
  });

  it('toggles terms checkbox', () => {
    const { container } = render(<SignUpForm />);
    const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(checkbox).toBeInTheDocument();
    expect(checkbox.checked).toBe(false);

    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
  });
});
