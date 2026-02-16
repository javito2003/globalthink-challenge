import { Global, Module } from '@nestjs/common';
import { CustomConfigService } from './infrastructure/services/custom-config.service';

@Global()
@Module({
  providers: [CustomConfigService],
  exports: [CustomConfigService],
})
export class SharedModule {}
