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

async function check() {
  const url = envVars.VITE_SUPABASE_URL + "/rest/v1/";
  console.log("Fetching: " + url);
  try {
    const r = await fetch(url, {
      method: "GET",
      headers: {
        apikey: envVars.VITE_SUPABASE_ANON_KEY,
        Authorization: "Bearer " + envVars.VITE_SUPABASE_ANON_KEY
      }
    });
    const data = await r.json();
    console.log(Object.keys(data.definitions.reservations.properties));
  } catch (e) {
    console.error(e);
  }
}
check();
