import { IsString, IsDefined } from 'class-validator';

export class CreateQrDto {
  @IsDefined()
  @IsString()
  readonly data: string;

  @IsDefined()
  @IsString()
  readonly customer_id: string;

}
