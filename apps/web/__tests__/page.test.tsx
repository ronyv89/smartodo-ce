import { render, screen } from '@testing-library/react';
import Home from '../app/page';

jest.mock('next/image', () => ({
  __esModule: true,
  default: ({
    alt,
    priority: _priority,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & { alt: string; priority?: boolean }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} {...props} />
  ),
}));

jest.mock('@repo/ui/button', () => ({
  Button: ({ children }: { children: React.ReactNode }) => <button>{children}</button>,
}));

describe('Home page', () => {
  it('renders the getting started instruction', () => {
    render(<Home />);
    expect(screen.getByText(/Get started by editing/)).toBeInTheDocument();
  });

  it('renders the deploy and docs links', () => {
    render(<Home />);
    expect(screen.getByText('Deploy now')).toBeInTheDocument();
    expect(screen.getByText('Read our docs')).toBeInTheDocument();
  });

  it('renders the open alert button', () => {
    render(<Home />);
    expect(screen.getByRole('button', { name: 'Open alert' })).toBeInTheDocument();
  });
});
