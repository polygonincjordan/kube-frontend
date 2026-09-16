/**
 * `OrderConfigSet` decides which e-Order functions a user sees. SAP returns one
 * boolean per function, and both the e-Order page and the emergency dashboard's
 * e-Orders tab render their tabs from it, so the meaning of each flag is defined
 * once here rather than as hand-written flag chains in each template.
 */

/** The tab keys the e-Order pages navigate between. */
export type OrderTab =
  | 'Ordprofile'
  | 'Clinical'
  | 'Medications'
  | 'OrderSet'
  | 'Fees'
  | 'Surgery'
  | 'Consultation'
  | 'Admission';

export interface OrderConfigFunction {
  /** The `OrderConfigSet` boolean that enables this function. */
  flag: string;
  /** The tab it opens. */
  tab: OrderTab;
}

/**
 * The functions that have a destination, in the order the default tab is picked.
 *
 * `Quickord` and `Daycaseord` are deliberately absent: both are still returned
 * by SAP, but neither has a content panel behind it, so counting them as
 * "configured" leaves the user on an empty page.
 */
export const ORDER_CONFIG_FUNCTIONS: OrderConfigFunction[] = [
  { flag: 'Clinicord', tab: 'Clinical' },
  { flag: 'Medicat', tab: 'Medications' },
  { flag: 'Doctfees', tab: 'Fees' },
  { flag: 'Ordset', tab: 'OrderSet' },
  { flag: 'Surgery', tab: 'Surgery' },
  { flag: 'Consultation', tab: 'Consultation' },
  { flag: 'Admission', tab: 'Admission' },
  { flag: 'Ordprofile', tab: 'Ordprofile' },
];

/**
 * The emergency dashboard's e-Orders tab shows a subset of the functions, keyed
 * by the tab names `EPrescriptionService.eOrderTabNavigation` already uses. It
 * has no Orders Profile or Order Sets panel, so those two flags have no tab
 * there even though the same configuration enables them on the e-Order page.
 */
export const ER_ORDER_TABS: { key: string; tab: OrderTab }[] = [
  { key: 'clinicalOrders', tab: 'Clinical' },
  { key: 'medications', tab: 'Medications' },
  { key: 'feesAndServices', tab: 'Fees' },
  { key: 'consultationOrder', tab: 'Consultation' },
  { key: 'admissionOrder', tab: 'Admission' },
  { key: 'surgeryOrder', tab: 'Surgery' },
];

/** The first emergency-dashboard tab the configuration enables, or null. */
export function resolveFirstErTab(config: any): string | null {
  if (!config) {
    return null;
  }
  const enabled = ER_ORDER_TABS.find((entry) =>
    isOrderTabEnabled(config, entry.tab)
  );
  return enabled ? enabled.key : null;
}

/** True when the configuration enables at least one function that can be shown. */
export function hasAnyOrderFunction(config: any): boolean {
  if (!config) {
    return false;
  }
  return ORDER_CONFIG_FUNCTIONS.some((fn) => !!config[fn.flag]);
}

/**
 * The tab to open first, or null when nothing is enabled. Callers keep their
 * current tab on null rather than navigating to a tab the user cannot see.
 */
export function resolveDefaultOrderTab(config: any): OrderTab | null {
  if (!config) {
    return null;
  }
  const enabled = ORDER_CONFIG_FUNCTIONS.find((fn) => !!config[fn.flag]);
  return enabled ? enabled.tab : null;
}

/** True when this specific tab is enabled by the configuration. */
export function isOrderTabEnabled(config: any, tab: OrderTab): boolean {
  if (!config) {
    return false;
  }
  const fn = ORDER_CONFIG_FUNCTIONS.find((entry) => entry.tab === tab);
  return fn ? !!config[fn.flag] : false;
}
