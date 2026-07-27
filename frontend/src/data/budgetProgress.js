const DEFAULT_MONTHLY_BUDGET = 2400;


export function summarizeBudgetProgress(spending, configuredBudget) {
  const budget = Number(configuredBudget) > 0
    ? Number(configuredBudget)
    : DEFAULT_MONTHLY_BUDGET;
  const rawPercentage = (Number(spending) || 0) / budget * 100;

  return {
    budget,
    percentage: Math.round(rawPercentage),
    progress: Math.min(Math.max(rawPercentage, 0), 100),
  };
}
