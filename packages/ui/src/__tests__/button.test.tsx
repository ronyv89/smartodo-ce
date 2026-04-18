import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../button';

describe('Button', () => {
  it('renders children', () => {
    render(<Button appName="test">Click me</Button>);
    expect(screen.getByRole('button', { name: 'Click me' })).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(
      <Button appName="test" className="my-class">
        Click
      </Button>
    );
    expect(screen.getByRole('button')).toHaveClass('my-class');
  });

  it('shows alert with appName on click', () => {
    const alertMock = jest.spyOn(window, 'alert').mockImplementation(() => {});
    render(<Button appName="my-app">Click me</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(alertMock).toHaveBeenCalledWith('Hello from your my-app app!');
    alertMock.mockRestore();
  });
});
