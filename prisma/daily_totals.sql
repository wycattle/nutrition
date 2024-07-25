use nutrition;
CREATE or replace VIEW daily_totals AS
SELECT 
    row_number() over (order by date(datex)) as id,
    DATE(datex) AS day,
    SUM(caloriesTot) AS calories,
    SUM(carbTot) AS total_carbs,
    SUM(fatTot) AS total_fat,
    SUM(proteinTot) AS total_protein,
    SUM(fiberTot) AS total_fiber,
    SUM(portionTot) AS total_portion
FROM 
    meal_totals_join
GROUP BY 
    DATE(datex);
