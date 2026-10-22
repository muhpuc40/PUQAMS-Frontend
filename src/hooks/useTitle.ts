import { useEffect } from 'react';

export interface UseTitleOptions {
  restoreOnUnmount?: boolean;
  prefix?: string;
  suffix?: string;
}

export function useTitle(
  title: string,
  options: UseTitleOptions = {}
) {
  const {
    restoreOnUnmount = false,
    prefix = '',
    suffix = ' | React Pro Template',
  } = options;

  useEffect(() => {
    const previousTitle = document.title;
    const fullTitle = `${prefix}${title}${suffix}`;
    document.title = fullTitle;

    return () => {
      if (restoreOnUnmount) {
        document.title = previousTitle;
      }
    };
  }, [title, prefix, suffix, restoreOnUnmount]);
}
