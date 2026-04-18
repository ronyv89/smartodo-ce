jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

import { redirect } from 'next/navigation';
import HomePage from '../app/page';

describe('HomePage', () => {
  it('redirects to /docs', () => {
    HomePage();
    expect(redirect).toHaveBeenCalledWith('/docs');
  });
});
