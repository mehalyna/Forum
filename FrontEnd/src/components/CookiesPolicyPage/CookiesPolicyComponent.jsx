import styles from './cookiesPolicyComponent.module.css';
import CookiesPolicyText from './text.js';
import Text from './text.js';
import { v4 as uuidv4 } from 'uuid';
import { useEffect } from 'react';

const CookiesPolicy = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
  return (
    <div className={styles['cookies_policy']}>
        <div className={styles['cookies_policy__link_container']}>
            <div className={styles['link']}>
                <a className={styles['link_text']} href="/privacy-policy/">Privacy Policy<br /></a>
                <a className={styles['link_text']} href="/terms-and-conditions/">Terms & Conditions<br /></a>
                <a className={styles['link_text__active']} href="/cookies-policy/">Cookie Policy</a>
                <a className={styles['link_text']} href="/Contact/">Contact</a>
            </div>
            <img className={styles['cookies_policy__img1']}
                src={`${process.env.REACT_APP_PUBLIC_URL}/img/dots.png`}
                alt="dots.png" />
            <img className={styles['cookies_policy__img2']}
                src={`${process.env.REACT_APP_PUBLIC_URL}/img/dots.png`}
                alt="dots.png" />
        </div>
        <div className={styles['cookies_policy__text_container']}>
        <h2 className={styles['cookies_policy__title']}>{CookiesPolicyText.title} </h2>
        {Text.content.map((item) => {
            if (item.type === 'paragraph') {
            return <p className={styles['text_content']} key={item.id || uuidv4()}>{item.text}</p>;
            } else if (item.type === 'heading') {
            const HeadingTag =`h${item.level}`;
            return <HeadingTag className={styles['text_content__heading']} key={item.id || uuidv4()}>{item.text}
            </HeadingTag>;
            }else if (item.type === 'paragraph__margin_bottom') {
            return <p  className={styles['text_content__margin_bottom']} key={item.id || uuidv4()}>{item.text}</p>;
            } else if (item.type === 'list-item') {
            return (
                <ul key={item.id || uuidv4()} className={styles['custom-list']}>
                <li className={styles['custom-list__item']}>{item.text}</li>
                </ul>
            );
            }
            return null;
        })}
        </div>
    </div>
  );
};

export default CookiesPolicy;
