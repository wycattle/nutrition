use nutrition;

CREATE or replace view meal_totals_join AS
select a.datex, b.* 
FROM meal a
join totalrowmeal as b on a.id = b.id;

CREATE or replace VIEW daily_totals AS
SELECT 
    row_number() over (order by date(datex)) as id,
    DATE(datex) AS day,
    SUM(caloriesTot) AS calories,
    SUM(carbTot) AS carbs,
    SUM(fatTot) AS fat,
    SUM(proteinTot) AS protein,
    SUM(fiberTot) AS fiber,
    SUM(portionTot) AS portion_weight
FROM 
    meal_totals_join
GROUP BY 
    DATE(datex);