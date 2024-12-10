import { Module } from '@nestjs/common';
import { VotesService } from './votes.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vote } from './entities/vote.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Vote])],
  providers: [VotesService],
  exports: [VotesService],
})
export class VotesModule {}
