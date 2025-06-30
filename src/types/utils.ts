export interface DateRange {
  start: Date;
  end: Date;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export type Result<T> = 
  | { success: true; data: T }
  | { success: false; error: { message: string; code: string } };

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequireAtLeastOne<T, Keys extends keyof T = keyof T> =
  Pick<T, Exclude<keyof T, Keys>> &
  {
    [K in Keys]-?: Required<Pick<T, K>> & Partial<Pick<T, Exclude<Keys, K>>>;
  }[Keys];

export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;