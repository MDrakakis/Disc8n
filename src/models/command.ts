export interface CommandConfig {
  webhook: string;
  description: string;
  requiresConfirmation?: boolean;
  examples?: string[];
}

export interface CommandMap {
  [command: string]: CommandConfig;
}
