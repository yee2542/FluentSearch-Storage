import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class DataDashboard {
  @Field(() => Number)
  total: number;

  @Field(() => Number)
  today: number;
}

@ObjectType()
export class FileDashboardDTO {
  @Field(() => DataDashboard)
  photo: DataDashboard;

  @Field(() => DataDashboard)
  video: DataDashboard;
}
