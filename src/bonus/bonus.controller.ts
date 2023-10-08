import { Post, Body, Controller } from '@nestjs/common';
import { ProduceBonusDto } from './dto/produce-bonus.dto';
import { BonusBusinessService } from './bonus.business-service';

@Controller('bonuses')
export class BonusController {
  constructor(private readonly bonusBusinessService: BonusBusinessService) {}

  @Post()
  produce(@Body() produceBonuses: ProduceBonusDto) {
    return this.bonusBusinessService.produce(produceBonuses);
  }
}
