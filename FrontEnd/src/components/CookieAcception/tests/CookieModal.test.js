import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import CookieMod from '../CookieMod';
import { CookieProvider } from '../../../context/CookieContext';
import { useCookies } from 'react-cookie';

jest.mock('react-cookie', () => ({
  useCookies: jest.fn(),
}));

afterEach(cleanup);

describe('CookieMod component unit tests', () => {
  const renderWithProvider = (cookiesValue) => {
    useCookies.mockReturnValue([cookiesValue, jest.fn()]);
    return render(
      <MemoryRouter>
        <CookieProvider>
          <CookieMod />
        </CookieProvider>
      </MemoryRouter>
    );
  };

  test('renders "Allow" button', () => {
    renderWithProvider({ cookies: undefined });
    const buttonElement = screen.getByText(/Дозволити/i);
    expect(buttonElement).toBeInTheDocument();
  });

  test('renders "Decline" button', () => {
    renderWithProvider({ cookies: undefined });
    const buttonElement = screen.getByText(/Відмовитись/i);
    expect(buttonElement).toBeInTheDocument();
  });

  test('renders link to cookie policy', () => {
    renderWithProvider({ cookies: undefined });
    const linkElement = screen.getByText(/про файли cookie/i);
    expect(linkElement).toBeInTheDocument();
  });

  test('does not render cookie banner when inactive', () => {
    renderWithProvider({ cookies: true });
    const cookieElement = screen.queryByTestId('cookiemodal');
    expect(cookieElement).not.toBeInTheDocument();
  });

  test('renders cookie banner when active', () => {
    renderWithProvider({ cookies: undefined });
    const cookieElement = screen.getByTestId('cookiemodal');
    expect(cookieElement).toBeInTheDocument();
  });
});
