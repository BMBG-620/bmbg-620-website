const client = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_PUBLISHABLE_KEY
);

const form = document.getElementById("applicationForm");
const msg = document.getElementById("message");
const btn = document.getElementById("submitButton");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  btn.disabled = true;
  msg.className = "";
  msg.textContent = "Submitting...";

  try {
    const fd = new FormData(form);
    const paths = [];

    const images = document.getElementById("images");

    if (images && images.files.length > 0) {
      for (const file of images.files) {
        const safe = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `${crypto.randomUUID()}-${safe}`;

        const { error: uploadError } = await client.storage
          .from(IMAGE_BUCKET)
          .upload(path, file);

        if (uploadError) {
          throw uploadError;
        }

        paths.push(path);
      }
    }

    const row = {
      username: fd.get("username"),
      game_id: fd.get("game_id"),
      current_state: fd.get("current_state"),
      current_clan: fd.get("current_clan"),
      preferred_clan: fd.get("preferred_clan"),
      backup_clan: fd.get("backup_clan"),
      watchtower_level: fd.get("watchtower_level"),
      overall_power: fd.get("overall_power"),
      first_march_power: fd.get("first_march_power"),
      second_march_power: fd.get("second_march_power"),
      third_march_power: fd.get("third_march_power"),
      reason: fd.get("reason"),
      image_urls: paths.join(","),
      status: "pending"
    };

    const { error } = await client
      .from(APPLICATION_TABLE)
      .insert([row]);

    if (error) {
      throw error;
    }

    form.reset();

    msg.className = "ok";
    msg.textContent =
      "✓ APPLICATION SUBMITTED — Your application was sent successfully.";

  } catch (err) {
    console.error(err);

    msg.className = "err";
    msg.textContent =
      "Could not submit: " + (err.message || String(err));

  } finally {
    btn.disabled = false;
  }
});
