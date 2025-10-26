import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Country {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column({ nullable: true })
  capital?: string;

  @Column()
  population!: number;

  @Column({ nullable: true })
  region?: string;

  @Column({ nullable: true })
  currency_code?: string;

  @Column({ type: "float", nullable: true })
  exchange_rate?: number;

  @Column({ type: "float", nullable: true })
  estimated_gdp?: number;

  @Column({ nullable: true })
  flag_url?: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  last_refreshed_at!: Date;
}
