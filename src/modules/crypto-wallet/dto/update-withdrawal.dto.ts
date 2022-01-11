import { PartialType } from '@nestjs/swagger';
import { CreateWithdrawalDto } from './create-withdrawal.dto';

export class UpdateWithdrawDto extends PartialType(CreateWithdrawalDto) {}
