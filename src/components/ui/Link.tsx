import NextLink from 'next/link';
import { useLocale } from 'next-intl';
import type { ComponentProps } from 'react';

type LinkProps = ComponentProps<typeof NextLink>;

// Wrapper komponenta pro Link s automatickým locale prefixem
export function Link({ href, ...props }: LinkProps) {
  const locale = useLocale();

  // Pokud je href string a začíná /, přidej locale prefix
  const localizedHref =
    typeof href === 'string' && href.startsWith('/')
      ? `/${locale}${href}`
      : href;

  return <NextLink href={localizedHref} {...props} />;
}
