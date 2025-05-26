export async function logPlaythrough(score: number, sessionStart: number): Promise<void> {
  const duration = Math.floor((Date.now() - sessionStart) / 1000);
  const apiUrl = `${window.location.origin}/api/playthrough`;
  // const apiUrl = 'http://localhost:8080/api/playthrough'; // explicitly use the Next.js port

  try {
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ score, duration }),
    });

    if (!res.ok) {
      throw new Error(`Server error: ${res.status}`);
    }

    const data = await res.json();
    console.log(`✅ Logged: Score ${data.score}, Duration ${data.duration}s`);
  } catch (err) {
    console.error('❌ Error logging playthrough:', err);
  }
}
