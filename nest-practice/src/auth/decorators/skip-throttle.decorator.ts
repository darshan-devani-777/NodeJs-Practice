import { SetMetadata } from '@nestjs/common';

export const SkipThrottle = () => SetMetadata('skipThrottle', true);

export const DontSkipThrottle = () => SetMetadata('skipThrottle', false);
