/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */

/* THIS FILE WAS GENERATED AUTOMATICALLY BY PAYLOAD. */
/* DO NOT MODIFY IT BECAUSE IT COULD BE REWRITTEN AT ANY TIME. */
import { RootPage } from '@payloadcms/next/views';
import type { Metadata } from 'next';

import config from '../../../../../payload.config';
import { importMap } from '../importMap';

type Args = {
  params: Promise<{
    segments: string[];
  }>;
  searchParams: Promise<{
    [key: string]: string | string[];
  }>;
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const generateMetadata = async (_args: Args): Promise<Metadata> => {
  return {
    title: 'Payload Admin',
  };
};

// Nepoužívat await, předat Promise přímo
const Page = ({ params, searchParams }: Args) => {
  return (
    <RootPage params={params} searchParams={searchParams} config={config} importMap={importMap} />
  );
};

export default Page;
