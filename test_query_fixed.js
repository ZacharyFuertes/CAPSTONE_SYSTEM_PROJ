import fs from "fs";
import path from "path";

const envStr = fs.readFileSync(".env.local", "utf-8");
const envVars = {};
envStr.split(/\r?\n/).forEach(line => {
  if (line.trim() && !line.startsWith("#")) {
    const [key, ...vals] = line.split("=");
    if (key) {
      envVars[key.trim()] = vals.join("=").trim().replace(/^['"](.*)['"]$/, '$1');
    }
  }
});

const url = envVars.VITE_SUPABASE_URL + "/rest/v1/appointments?select=id,scheduled_date,scheduled_time,service_type,status,notes,description,mechanic_id,estimated_price&limit=1";
console.log("Fetching: " + url);
fetch(url, {
  headers: {
    apikey: envVars.VITE_SUPABASE_ANON_KEY,
    Authorization: "Bearer " + envVars.VITE_SUPABASE_ANON_KEY
  }
}).then(r => r.json()).then(data => {
  console.log(JSON.stringify(data, null, 2));
}).catch(console.error);
