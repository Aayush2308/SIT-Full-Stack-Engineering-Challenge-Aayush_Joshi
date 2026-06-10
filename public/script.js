const edgesInput = document.querySelector("#edges");
const submitButton = document.querySelector("#submit");
const output = document.querySelector("#output");
const statusText = document.querySelector("#status");

submitButton.addEventListener("click", async () => {
  const edges = edgesInput.value
    .split(/[\n,]+/)
    .map((item) => item.trim())
    .filter(Boolean);

  statusText.textContent = "Calling API...";
  output.textContent = "";

  try {
    const response = await fetch("/api/graph", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ edges })
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "API request failed");
    }

    output.textContent = JSON.stringify(data, null, 2);
    statusText.textContent = "Done";
  } catch (error) {
    statusText.textContent = "Error";
    output.textContent = error.message;
  }
});
