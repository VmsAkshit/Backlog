document.getElementById('backlog-form').addEventListener('submit', async function(e) {
    e.preventDefault();

    // Gather inputs
    const apiKey = document.getElementById('api-key').value.trim();
    const subjects = document.getElementById('subjects').value.trim();
    const chapters = document.getElementById('chapters').value;
    const videos = document.getElementById('videos').value;
    const duration = document.getElementById('duration').value;
    const studyTime = document.getElementById('study-time').value;

    if (!apiKey) {
        alert("Please enter your Gemini API key.");
        return;
    }

    // UI Updates
    const btn = document.getElementById('generate-btn');
    const loading = document.getElementById('loading');
    const resultContainer = document.getElementById('result-container');
    
    btn.disabled = true;
    loading.classList.remove('hidden');
    resultContainer.innerHTML = '';

    // Constructing a highly specific prompt for the API
    const prompt = `
        Act as an expert JEE Advanced academic planner. I need to clear a backlog.
        Here are my constraints:
        - Subjects/Topics: ${subjects}
        - Total Chapters: ${chapters}
        - Videos per chapter: ${videos}
        - Average Video Duration: ${duration} minutes
        - Dedicated self-study time for this backlog: ${studyTime} hours per day.
        
        Important Context: 
        1. My regular school schedule occupies me from 07:00 to 15:45. Ensure all daily study blocks are scheduled outside of these hours.
        2. I am preparing for JEE, so watching lectures is not enough. Allocate a significant portion of the ${studyTime} hours to problem-solving, module practice, and PYQs.
        
        Please generate:
        1. A realistic Day-wise Timetable with specific time slots.
        2. A Weekly Tracker (milestones to hit by the end of the week).
        3. A Monthly goal summary (if applicable based on the math).
        4. A Daily Checklist format (e.g., [ ] Watched Lec 1, [ ] Solved 20 MCQs).
        
        Format the output purely in clean HTML using <h3>, <ul>, <li>, and <p> tags so I can inject it directly into a div. Do not include markdown codeblocks (\`\`\`html) in the response, just the raw HTML.
    `;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{ text: prompt }]
                }]
            })
        });

        const data = await response.json();

        if (data.error) {
            throw new Error(data.error.message);
        }

        // Extracting the text from the API response
        let aiHTML = data.candidates[0].content.parts[0].text;
        
        // Minor cleanup in case the API wraps it in markdown blocks anyway
        aiHTML = aiHTML.replace(/```html/g, '').replace(/```/g, '');

        resultContainer.innerHTML = aiHTML;

    } catch (error) {
        console.error("API Error:", error);
        resultContainer.innerHTML = `<p style="color: #ef4444;">Error generating plan: ${error.message}</p>`;
    } finally {
        btn.disabled = false;
        loading.classList.add('hidden');
    }
});
