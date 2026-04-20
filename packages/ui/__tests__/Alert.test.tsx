import { render, screen } from '@testing-library/react';
import Alert from '../src/components/ui/alert/Alert';
import React from 'react';

// Mock Next.js Link
jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => {
    return <a href={href}>{children}</a>;
  };
  MockLink.displayName = 'MockLink';
  return MockLink;
});

describe('Alert Component', () => {
  it('renders alert correctly', () => {
    render(<Alert title="Default Alert" variant="info" message="test" />);
    expect(screen.getByText('Default Alert')).toBeInTheDocument();
  });

  it('renders alert with message', () => {
    render(<Alert title="Alert Title" variant="warning" message="Alert Message" />);
    expect(screen.getByText('Alert Message')).toBeInTheDocument();
  });

  it('renders different variants', () => {
    render(<Alert title="Success Alert" variant="success" message="test" />);
    expect(screen.getByText('Success Alert')).toBeInTheDocument();
  });

  it('renders different colors', () => {
    render(<Alert title="Error Alert" variant="error" message="test" />);
    expect(screen.getByText('Error Alert')).toBeInTheDocument();
  });

  it('renders with link', () => {
    render(<Alert title="Link Alert" variant="info" message="test" showLink linkText="Click Here" linkHref="/hello" />);
    expect(screen.getByText('Click Here')).toBeInTheDocument();
  });

  it('renders with link using default text and href', () => {
    render(<Alert title="Link Default Alert" variant="info" message="test" showLink />);
    expect(screen.getByText('Learn more')).toBeInTheDocument();
  });
});
