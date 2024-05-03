import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { getThemeColor, setThemeColor } from '@services/utiltiy.service';
import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

const color =
  environment.isMultiColorActive || environment.isDarkSwitchActive
    ? getThemeColor()
    : environment.defaultColor;

import('./assets/css/sass/kardex.' + color + '.scss')
  .then((x) => {
    setThemeColor(color);
    platformBrowserDynamic()
      .bootstrapModule(AppModule)
      .catch((err) => console.error(err));
  })
  .catch(() => {
    setThemeColor(null);
    window.location.reload();
  });
