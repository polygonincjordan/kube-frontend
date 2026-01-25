import { environment } from 'src/environments/environment';

export const getDate = (value: string) => {
  if (!value) return null;
  
  const num = parseInt(value.replace(/[^0-9]/g, ''));
  const date = new Date(num);
  return date;
}

export const camelCase = (str: string): string => {
  if (str) {
    str = str.replace(/[^a-zA-Z0-9 ]/g, ' ');
    str = str.replace(/([a-z](?=[A-Z]))/g, '$1 ');
    str = str
      .replace(/([^a-zA-Z0-9 ])|^[0-9]+/g, '')
      .trim()
      .toLowerCase();
    str = str.replace(
      /([ 0-9]+)([a-zA-Z])/g,
      (a, b, c) => `${b.trim()}${c.toUpperCase()}`
    );
  }
  return str;
};

export const enumToArray = (data: any): any => {
  const arrayData = [];
  if (data && Object.entries(data).length) {
    for (const [key, value] of Object.entries(data)) {
      if (!Number.isNaN(Number(key))) {
        continue;
      }
      arrayData.push({ key: value, value: key });
    }
  }
  return arrayData;
};

export const getThemeColor = () => {
  let color = environment.defaultColor;
  try {
    color = localStorage.getItem('ThemeColor') || environment.defaultColor;
  } catch (error) {
    console.log('>>>> src/app/utils/util.js : getThemeColor -> error', error);
    color = environment.defaultColor;
  }
  return color;
};

export const setThemeColor = (color: string) => {
  try {
    if (color) {
      localStorage.setItem('ThemeColor', color);
    } else {
      localStorage.removeItem('ThemeColor');
    }
  } catch (error) {
    console.log('>>>> src/app/utils/util.js : setThemeColor -> error', error);
  }
};

export const getThemeRadius = () => {
  let radius = 'flat';
  try {
    radius = localStorage.getItem('ThemeRadius') || 'flat';
  } catch (error) {
    console.log('>>>> src/app/utils/util.js : getThemeRadius -> error', error);
    radius = 'rounded';
  }
  return radius;
};

export const setThemeRadius = (radius: string) => {
  try {
    localStorage.setItem('ThemeRadius', radius);
  } catch (error) {
    console.log('>>>> src/app/utils/util.js : setThemeRadius -> error', error);
  }
};

export const getThemeLang = () => {
  let lang = 'en-US';
  try {
    lang = localStorage.getItem('theme_lang') || 'en-US';
  } catch (error) {
    console.log('>>>> src/app/utils/util.js : getThemeLang -> error', error);
    lang = 'en-US';
  }
  return lang;
};

export const setThemeLang = (lang: string) => {
  try {
    localStorage.setItem('theme_lang', lang);
  } catch (error) {
    console.log('>>>> src/app/utils/util.js : setThemeLang -> error', lang);
  }
};
