/**
 *
 * Global configuration file for any ngx-bootstrap components
 *
 */

import { TooltipConfig } from "ngx-bootstrap/tooltip";

export function getAlertConfig(): TooltipConfig {
  return Object.assign(new TooltipConfig(), {
    placement: 'auto',
    container: 'body',
    adaptivePosition: 'false',
    delay: 500
  });
}
