const TABLET_SCREEN_WIDTH = 768;
const SMALL_DESKTOP_SCREEN_WIDTH = 1200;
const DESKTOP_SCREEN_WIDTH = 1512;

const MOBILE_PAGE_SIZE = 4;
const TABLET_PAGE_SIZE = 10;
const SMALL_DESKTOP_PAGE_SIZE = 12;
const DESKTOP_PAGE_SIZE = 16;

export function definPageSize (windowWidth, setPageSize) {
    if (windowWidth < TABLET_SCREEN_WIDTH) {
      return setPageSize(MOBILE_PAGE_SIZE);
    }
    if (windowWidth < SMALL_DESKTOP_SCREEN_WIDTH) {
      return setPageSize(TABLET_PAGE_SIZE);
    }
    if (windowWidth < DESKTOP_SCREEN_WIDTH) {
      return setPageSize(SMALL_DESKTOP_PAGE_SIZE);
    }
    return setPageSize(DESKTOP_PAGE_SIZE);
  }
