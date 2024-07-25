use nutrition;

alter view meal_daily_totals AS
SELECT
date(datex) as day,
sum(caloriesTot) as totalCalories,
sum(carbTot) as totalCarb,
sum(fatTot) as totalFat,
sum(proteinTot) as totalProtein,
sum(fiberTot) as totalFiber,
sum(portionTot) as totalPortion 
FROM meal_totals_join
GROUP BY date (datex);