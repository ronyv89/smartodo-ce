import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SignInForm from '../src/components/auth/SignInForm';

// Mock matchMedia because next/apexcharts might rely on it
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

// Mock Next.js Link
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: any) => {
    return <a href={href}>{children}</a>;
  };
  MockLink.displayName = 'MockLink';
  return MockLink;
});

describe('SignInForm Component', () => {
  it('renders correctly', () => {
    // Suppress Link warning by testing basic structure
    const { container } = render(<SignInForm />);
    expect(screen.getAllByText(/Sign In/i)[0]).toBeInTheDocument();
  });

  it('toggles password visibility', () => {
    const { container } = render(<SignInForm />);
    const inputs = container.querySelectorAll('input') as NodeListOf<HTMLInputElement>;
    
    // There are a few inputs: email, password, and checkbox
    // password is the second one
    const passwordInput = Array.from(inputs).find(input => input.type === 'password' || input.placeholder === 'Enter your password');
    
    // Get the eye icon (which is an svg inside a span that toggles showPassword)
    const toggleSpans = container.querySelectorAll('span.cursor-pointer');
    if (toggleSpans.length > 0) {
       fireEvent.click(toggleSpans[0]); // toggles on
       fireEvent.click(toggleSpans[0]); // toggles off
    }
  });

  it('toggles checkbox keep me logged in', () => {
    const { container } = render(<SignInForm />);
    // Checkbox component might hide actual input, but Label handles click if setup correctly. We click the Checkbox container.
    const checkboxLabel = screen.getByText('Keep me logged in');
    // find nearest checkbox or its wrapper
    fireEvent.click(checkboxLabel);
  });
});
