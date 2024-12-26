import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PageWrapper from '../../PageWrapper/PageWrapper';
import { CookieProvider } from '../../../context/CookieContext';
import { BurgerMenuProvider } from '../../../context/BurgerMenuContext';
import { useCookies } from 'react-cookie';

jest.mock('react-cookie', () => ({
  useCookies: jest.fn(),
}));

afterEach(cleanup);

describe('CookieMod component unit tests', () => {
  const renderWithProviders = (cookiesValue) => {
    useCookies.mockReturnValue([cookiesValue, jest.fn()]);
    return render(
      <MemoryRouter>
        <BurgerMenuProvider>
          <CookieProvider>
            <PageWrapper>
              <div>Test Content</div>
            </PageWrapper>
          </CookieProvider>
        </BurgerMenuProvider>
      </MemoryRouter>
    );
  };

  test('renders "Allow" button', () => {
    renderWithProviders({ cookies: undefined });
    const buttonElement = screen.getByText(/Дозволити/i);
    expect(buttonElement).toBeInTheDocument();
  });

  test('renders "Decline" button', () => {
    renderWithProviders({ cookies: undefined });
    const buttonElement = screen.getByText(/Відмовитись/i);
    expect(buttonElement).toBeInTheDocument();
  });

  test('renders link to cookie policy', () => {
    renderWithProviders({ cookies: undefined });
    const linkElement = screen.getByText(/про файли cookie/i);
    expect(linkElement).toBeInTheDocument();
  });

  test('does not render cookie banner when inactive', () => {
    renderWithProviders({ cookies: true });
    const cookieElement = screen.queryByTestId('cookiemodal');
    expect(cookieElement).not.toBeInTheDocument();
  });

  test('renders cookie banner when active', () => {
    renderWithProviders({ cookies: undefined });
    const cookieElement = screen.getByTestId('cookiemodal');
    expect(cookieElement).toBeInTheDocument();
  });
});
