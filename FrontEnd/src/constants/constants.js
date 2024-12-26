export const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
export const PASSWORD_PATTERN = /^(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z])[a-zA-Z0-9]{8,128}$/;
export const NAME_SURNAME_PATTERN = /^(?=.{2,50}$)[a-zA-Zа-щюяьА-ЩЮЯЬїЇіІєЄґҐ']+(\s[a-zA-Zа-щюяьА-ЩЮЯЬїЇіІєЄґҐ']+)*$/;
export const COMPANY_NAME_PATTERN = /^.{2,100}$/;
export const MESSAGE_PATTERN = /^.{10,}$/;
export const SCREEN_WIDTH = {
    tablet: 768,
    smallDesktop: 1200,
    desktop: 1512,
};
export const PAGE_SIZE = {
    mobile: 4,
    tablet: 10,
    smallDesktop: 12,
    desktop: 16,
};
