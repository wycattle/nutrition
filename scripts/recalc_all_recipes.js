// scripts/recalc_all_recipes.js
// Run this in the browser developer console (F12 → Console) while logged into the app.
// It calls the admin endpoint to recalculate all recipe totals from the latest nutrition data.

fetch('/api/admin/recalc_all_recipes', { method: 'POST' })
  .then(r => r.json())
  .then(data => {
    console.log(data.message);
    if (data.updated?.length) console.log('Updated:', data.updated.join(', '));
    if (data.skipped?.length) console.log('Skipped:', data.skipped.join(', '));
  })
  .catch(err => console.error('Error:', err));
