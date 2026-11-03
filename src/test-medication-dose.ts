import 'zone.js/testing';
import { getTestBed } from '@angular/core/testing';
import { BrowserDynamicTestingModule, platformBrowserDynamicTesting } from '@angular/platform-browser-dynamic/testing';

getTestBed().initTestEnvironment(BrowserDynamicTestingModule, platformBrowserDynamicTesting(), {
  teardown: { destroyAfterEach: false },
});

import './app/e-prescription/dose-unit-change.spec';
import './app/e-prescription/timed-dose-schedule.spec';
import './app/e-prescription/timed-dose-all-screens.spec';
