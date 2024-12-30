import { render, screen, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import TitleInfo from '../TitleInfo';
import { useAuth } from '../../../../hooks/useAuth';

jest.mock('../../../../hooks/useAuth', () => ({
  useAuth: jest.fn(),
}));

afterEach(cleanup);

describe('TitleInfo component unit tests', () => {
  const baseData = {
    id: 1,
    name: 'Test Company',
    person: 1,
    regions_ukr_display: '',
    activities: [],
    categories: [],
    is_saved: false,
    logo: null,
  };

  beforeEach(() => {
    useAuth.mockReturnValue({
      user: {
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
      },
    });
  });

  test('renders with shortened region', () => {
    const testData = {
      ...baseData,
      regions_ukr_display: 'Київська область, Кіровоградська область',
    };

    render(
      <MemoryRouter>
        <TitleInfo isAuthorized={true} data={testData} />
      </MemoryRouter>
    );

    const regionElement = screen.getByText(/Київська обл., Кіровоградська обл./i);
    expect(regionElement).toBeInTheDocument();
  });

  test('renders without region', () => {
    render(
      <MemoryRouter>
        <TitleInfo isAuthorized={true} data={baseData} />
      </MemoryRouter>
    );

    const regionElement = screen.queryByText(/обл./i);
    expect(regionElement).not.toBeInTheDocument();
  });

  test('renders activities and categories', () => {
    const testData = {
      ...baseData,
      activities: [
        { id: 1, name: 'IT Development' },
        { id: 2, name: 'Education' },
      ],
      categories: [
        { id: 1, name: 'Software' },
        { id: 2, name: 'Hardware' },
      ],
    };

    render(
      <MemoryRouter>
        <TitleInfo isAuthorized={true} data={testData} />
      </MemoryRouter>
    );

    const activityElement = screen.getByText(/IT Development, Education/i);
    const categoryElement = screen.getByText(/Software/i);

    expect(activityElement).toBeInTheDocument();
    expect(categoryElement).toBeInTheDocument();
  });

  test('renders saved button for non-owner', () => {
    const testData = {
      ...baseData,
      person: 2,
      regions_ukr_display: 'Київська область',
    };

    render(
      <MemoryRouter>
        <TitleInfo isAuthorized={true} data={testData} />
      </MemoryRouter>
    );

    const buttonElement = screen.getByText(/Додати в збережені/i);
    expect(buttonElement).toBeInTheDocument();
  });

  test('renders edit link for owner', () => {
    const testData = {
      ...baseData,
      regions_ukr_display: 'Київська область',
    };

    render(
      <MemoryRouter>
        <TitleInfo isAuthorized={true} data={testData} />
      </MemoryRouter>
    );

    const linkElement = screen.getByText(/Редагувати/i);
    expect(linkElement).toBeInTheDocument();
  });
});
