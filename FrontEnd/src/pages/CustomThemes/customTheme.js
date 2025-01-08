const customTheme = {
    components: {
      Button: {
        defaultColor: '#1F9A7C',
        colorPrimaryHover: '#0b6c61',
        fontWeight: 600,
        contentFontSize: 16,
        fontFamilyCode: 'Inter',
      },
      Radio: {
        colorPrimary: '#1f9a7c',
        borderRadius: 2,
        colorBorder: '#DEE1E8',
        buttonColor: '#25292C',
        fontFamily: 'Inter',
        fontSize: 16,
        algorithm: true, // Enable algorithm
      },
      Pagination: {
        colorPrimary: '#25292C',
        colorPrimaryHover: '#25292C',
        fontFamily: 'Geologica',
        borderRadius: '2px',
      },
      Select: {
        colorPrimary: '#1f9a7c',
        colorTextPlaceholder: '#adb3b9',
        borderRadiusSM: '2px',
        optionPadding: '5px 12px',
        optionFontSize: 14,
        optionLineHeight: '22px',
        optionSelectedBg: '#EFFFF6',
        optionSelectedColor: '#25292C',
        multipleItemBorderColor: '#D9D9D9',
        multipleItemBg: '#F8F8F8',
      },
      Checkbox: {
        colorPrimary: '#000000',
        colorPrimaryHover: '#000000',
      },
      Spin: {
        colorPrimary: '#ffffff',
      },
      List: {
        fontFamily: 'Geologica',
        emptyTextPadding: 0,
      }
    },
    token: {
      fontFamily: 'Geologica',
      screenXLMax: 1511,
      screenXXLMin: 1512, // for grid (row/col)
      screenXXL: 1512, // for List
    }
  };

export default customTheme;
