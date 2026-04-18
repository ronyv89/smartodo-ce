jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => {
    throw new Error('NEXT_NOT_FOUND');
  }),
}));

jest.mock(
  'fumadocs-ui/page',
  () => ({
    DocsPage: ({ children }: { children: React.ReactNode; toc?: unknown }) => (
      <div data-testid="docs-page">{children}</div>
    ),
    DocsBody: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
    DocsTitle: ({ children }: { children: React.ReactNode }) => <h1>{children}</h1>,
    DocsDescription: ({ children }: { children: React.ReactNode }) => <p>{children}</p>,
  }),
  { virtual: true }
);

jest.mock('fumadocs-ui/mdx', () => ({ __esModule: true, default: {} }), { virtual: true });

jest.mock('../app/source', () => ({
  source: {
    getPage: jest.fn(),
    generateParams: jest.fn(),
  },
}));

import { render, screen } from '@testing-library/react';
import Page, { generateStaticParams, generateMetadata } from '../app/docs/[[...slug]]/page';
import { source } from '../app/source';
import { notFound } from 'next/navigation';

const mockPage = {
  data: {
    title: 'Test Title',
    description: 'Test description',
    body: () => <div>MDX content</div>,
    toc: [],
  },
};

describe('Docs slug page', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Page', () => {
    it('renders page content when page exists', async () => {
      (source.getPage as jest.Mock).mockReturnValue(mockPage);
      const element = await Page({ params: Promise.resolve({ slug: ['intro'] }) });
      render(element);
      expect(screen.getByTestId('docs-page')).toBeInTheDocument();
      expect(screen.getByText('Test Title')).toBeInTheDocument();
      expect(screen.getByText('Test description')).toBeInTheDocument();
    });

    it('calls notFound when page does not exist', async () => {
      (source.getPage as jest.Mock).mockReturnValue(null);
      await expect(
        Page({ params: Promise.resolve({ slug: undefined }) })
      ).rejects.toThrow('NEXT_NOT_FOUND');
      expect(notFound).toHaveBeenCalled();
    });
  });

  describe('generateStaticParams', () => {
    it('returns params from source', async () => {
      (source.generateParams as jest.Mock).mockReturnValue([{ slug: ['intro'] }]);
      const result = await generateStaticParams();
      expect(result).toEqual([{ slug: ['intro'] }]);
    });
  });

  describe('generateMetadata', () => {
    it('returns metadata for existing page', async () => {
      (source.getPage as jest.Mock).mockReturnValue(mockPage);
      const result = await generateMetadata({ params: Promise.resolve({ slug: ['intro'] }) });
      expect(result).toEqual({ title: 'Test Title', description: 'Test description' });
    });

    it('calls notFound when page does not exist', async () => {
      (source.getPage as jest.Mock).mockReturnValue(null);
      await expect(
        generateMetadata({ params: Promise.resolve({ slug: undefined }) })
      ).rejects.toThrow('NEXT_NOT_FOUND');
      expect(notFound).toHaveBeenCalled();
    });
  });
});
