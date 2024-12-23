import { Link } from 'react-router-dom';
import css from './FooterNavigation.module.css';

const PAGE_NAVIGATION_LINKS = [
  {
    title: 'Компанії',
    params: { companyType: 'companies' },
  },
  {
    title: 'Стартапи',
    params: { companyType: 'startups' },
  },
];

const SERVICES_LINKS = [
  {
    title: 'Виробники',
    params: { activity: 'producers' },
  },
  {
    title: 'Імпортери',
    params: { activity: 'importers' },
  },
  {
    title: 'Роздрібні мережі',
    params: { activity: 'retailers' },
  },
  {
    title: 'HORECA',
    params: { activity: 'horeca' },
  },
  {
    title: 'Інші послуги',
    params: { activity: 'other-services' },
  },
];

function FooterNavigation() {
  const generateQueryString = (params) =>
    new URLSearchParams(params).toString();

  return (
    <div className={css['navigation-content']}>
      <div className={css['navigation-content__company']}>
        <h3 className={css['navigation-content-company__header']}>Підприємства</h3>
        <div className={css['navigation-content-company__text-block']}>
          {PAGE_NAVIGATION_LINKS.map((element) => (
            <Link
              key={element.params.companyType}
              className={css['navigation-content-company__text']}
              to={`/profiles?${generateQueryString(element.params)}`}
            >
              {element.title}
            </Link>
          ))}
        </div>
      </div>
      <div className={css['navigation-content__section']}>
        <h3 className={css['navigation-content-section__header']}>Сектори</h3>
        <div className={css['navigation-content-section__text-block']}>
          {SERVICES_LINKS.map((element) => (
            <Link
              key={element.params.activity}
              className={css['navigation-content-section__text']}
              to={`/profiles?${generateQueryString(element.params)}`}
            >
              {element.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export default FooterNavigation;
