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
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
  MockLink.displayName = 'MockLink';
  return MockLink;
});

describe('SignInForm Component', () => {
  it('renders correctly', () => {
    // Suppress Link warning by testing basic structure
    render(<SignInForm />);
    expect(screen.getAllByText(/Sign In/i)[0]).toBeInTheDocument();
  });

  it('toggles password visibility', () => {
    const { container } = render(<SignInForm />);

    const passwordInput = container.querySelector('input[type="password"]') as HTMLInputElement;
    expect(passwordInput).toBeInTheDocument();

    // Click the eye icon span to toggle visibility
    const toggleSpan = container.querySelector('span.cursor-pointer') as HTMLElement;
    expect(toggleSpan).toBeInTheDocument();

    fireEvent.click(toggleSpan); // toggles on — password becomes text
    const textInput = container.querySelector('input[type="text"]') as HTMLInputElement;
    expect(textInput).toBeInTheDocument();

    fireEvent.click(toggleSpan); // toggles off — back to password
    expect(container.querySelector('input[type="password"]')).toBeInTheDocument();
  });

  it('toggles checkbox keep me logged in', () => {
    const { container } = render(<SignInForm />);
    const checkbox = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(checkbox).toBeInTheDocument();
    expect(checkbox.checked).toBe(false);

    fireEvent.click(checkbox);
    expect(checkbox.checked).toBe(true);
  });
});
