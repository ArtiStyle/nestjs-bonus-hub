export interface BonusCount {
  bonusId: number;
  count: string;
}

export interface ProducedBonusesCount {
  producedBonuses: BonusCount[];
  producedBonusesByUser: BonusCount[];
}
