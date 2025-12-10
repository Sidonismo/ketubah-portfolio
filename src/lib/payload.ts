import { getPayload } from 'payload';
import config from '../../payload.config';

// Singleton pro Payload klienta
export const getPayloadClient = async () => {
  return await getPayload({ config });
};
