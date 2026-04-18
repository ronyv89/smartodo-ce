jest.mock(
  'fumadocs-ui/layouts/docs',
  () => ({
    DocsLayout: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="docs-layout">{children}</div>
    ),
  }),
  { virtual: true }
);

jest.mock('../app/source', () => ({
  source: { pageTree: {} },
}));

import { render, screen } from '@testing-library/react';
import Layout from '../app/docs/layout';

describe('Docs Layout', () => {
  it('renders children inside DocsLayout', () => {
    render(<Layout>page content</Layout>);
    expect(screen.getByTestId('docs-layout')).toBeInTheDocument();
    expect(screen.getByText('page content')).toBeInTheDocument();
  });
});
