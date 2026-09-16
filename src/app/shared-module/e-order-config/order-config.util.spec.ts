import {
  ER_ORDER_TABS,
  hasAnyOrderFunction,
  isOrderTabEnabled,
  ORDER_CONFIG_FUNCTIONS,
  resolveDefaultOrderTab,
  resolveFirstErTab,
} from './order-config.util';

/** A configuration with every known flag off, matching the OrderConfigSet shape. */
function allOff(): any {
  return {
    Ordprofile: false,
    Clinicord: false,
    Medicat: false,
    Ordset: false,
    Doctfees: false,
    Surgery: false,
    Consultation: false,
    Admission: false,
    Quickord: false,
    Daycaseord: false,
  };
}

function only(flag: string): any {
  const config = allOff();
  config[flag] = true;
  return config;
}

describe('order-config.util', () => {
  describe('resolveDefaultOrderTab', () => {
    it('opens each function\'s own tab when it is the only one enabled', () => {
      ORDER_CONFIG_FUNCTIONS.forEach((fn) => {
        expect(resolveDefaultOrderTab(only(fn.flag))).toBe(fn.tab);
      });
    });

    it('follows the documented priority order when several are enabled', () => {
      const config = allOff();
      config.Ordprofile = true;
      config.Doctfees = true;
      config.Clinicord = true;
      expect(resolveDefaultOrderTab(config)).toBe('Clinical');

      config.Clinicord = false;
      expect(resolveDefaultOrderTab(config)).toBe('Fees');

      config.Doctfees = false;
      expect(resolveDefaultOrderTab(config)).toBe('Ordprofile');
    });

    it('returns null when nothing showable is enabled', () => {
      expect(resolveDefaultOrderTab(allOff())).toBeNull();
      expect(resolveDefaultOrderTab(only('Quickord'))).toBeNull();
      expect(resolveDefaultOrderTab(only('Daycaseord'))).toBeNull();
    });

    it('returns null for a configuration that has not loaded yet', () => {
      expect(resolveDefaultOrderTab(null)).toBeNull();
      expect(resolveDefaultOrderTab(undefined)).toBeNull();
    });
  });

  describe('hasAnyOrderFunction', () => {
    it('is true for any single showable function', () => {
      ORDER_CONFIG_FUNCTIONS.forEach((fn) => {
        expect(hasAnyOrderFunction(only(fn.flag))).toBe(true);
      });
    });

    it('is false for functions that have no content behind them', () => {
      expect(hasAnyOrderFunction(only('Quickord'))).toBe(false);
      expect(hasAnyOrderFunction(only('Daycaseord'))).toBe(false);
    });

    it('is false for an all-off or unloaded configuration', () => {
      expect(hasAnyOrderFunction(allOff())).toBe(false);
      expect(hasAnyOrderFunction(null)).toBe(false);
      expect(hasAnyOrderFunction(undefined)).toBe(false);
    });
  });

  describe('resolveFirstErTab', () => {
    it('selects each emergency tab when its own flag is the only one on', () => {
      ER_ORDER_TABS.forEach((entry) => {
        const flag = ORDER_CONFIG_FUNCTIONS.find((fn) => fn.tab === entry.tab);
        expect(resolveFirstErTab(only(flag.flag))).toBe(entry.key);
      });
    });

    it('keeps the emergency bar order when several are on', () => {
      const config = allOff();
      config.Surgery = true;
      config.Medicat = true;
      expect(resolveFirstErTab(config)).toBe('medications');
    });

    it('is null for functions the emergency page has no panel for', () => {
      expect(resolveFirstErTab(only('Ordprofile'))).toBeNull();
      expect(resolveFirstErTab(only('Ordset'))).toBeNull();
    });

    it('is null for an all-off or unloaded configuration', () => {
      expect(resolveFirstErTab(allOff())).toBeNull();
      expect(resolveFirstErTab(null)).toBeNull();
    });
  });

  describe('isOrderTabEnabled', () => {
    it('gates a tab on its own flag only', () => {
      const config = only('Medicat');
      expect(isOrderTabEnabled(config, 'Medications')).toBe(true);
      expect(isOrderTabEnabled(config, 'Clinical')).toBe(false);
      expect(isOrderTabEnabled(config, 'Fees')).toBe(false);
    });

    it('is false for an unloaded configuration', () => {
      expect(isOrderTabEnabled(null, 'Clinical')).toBe(false);
    });
  });
});
