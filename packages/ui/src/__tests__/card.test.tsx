import { render, screen } from '@testing-library/react';
import { Card } from '../card';

describe('Card', () => {
  it('renders title and children', () => {
    render(
      <Card title="Test Card" href="https://example.com">
        Card content
      </Card>
    );
    expect(screen.getByText('Test Card')).toBeInTheDocument();
    expect(screen.getByText('Card content')).toBeInTheDocument();
  });

  it('renders as a link containing the href', () => {
    render(
      <Card title="Test" href="https://example.com">
        content
      </Card>
    );
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', expect.stringContaining('https://example.com'));
  });

  it('opens in a new tab', () => {
    render(
      <Card title="Test" href="https://example.com">
        content
      </Card>
    );
    expect(screen.getByRole('link')).toHaveAttribute('target', '_blank');
  });
});
