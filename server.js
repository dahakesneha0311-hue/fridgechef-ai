require("dotenv").config();

const express = require("express");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname + "/frontend"));

async function generateWithRetry(url, options, maxRetries = 4) {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        const response = await fetch(url, options);

        // Success
        if (response.ok) {
            return response;
        }

        // Retry ONLY for temporary 503 errors
        if (response.status === 503) {
            if (attempt === maxRetries) {
                return response;
            }

            const delay = 2000 * Math.pow(2, attempt);

            console.log(
                `Gemini busy. Retrying in ${delay / 1000} seconds...`
            );

            await new Promise(resolve =>
                setTimeout(resolve, delay)
            );

            continue;
        }

        // Do NOT retry 429 quota errors
        return response;
    }
}

app.post("/api/recipe", async (req, res) => {
    try {
        const {
            ingredients,
            mealType,
            diet,
            cookingTime
        } = req.body;

        if (!ingredients || !ingredients.trim()) {
            return res.status(400).json({
                error: "Please enter your ingredients."
            });
        }

        const prompt = `
You are FridgeChef AI, an AI recipe generator.

Create one practical recipe using these details:

Ingredients: ${ingredients}
Meal type: ${mealType}
Diet: ${diet}
Cooking time: ${cookingTime}

Rules:
- Respect the diet preference.
- Prefer the ingredients provided.
- Keep the recipe simple.
- Keep the cooking time within the requested time where possible.
- Include quantities.
- Give clear numbered cooking steps.

Return ONLY valid JSON:

{
  "name": "Recipe name",
  "ingredients": [
    "ingredient with quantity"
  ],
  "instructions": [
    "Step 1",
    "Step 2"
  ],
  "cookingTime": "15 minutes"
}
`;

        const response = await generateWithRetry(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": process.env.GEMINI_API_KEY
                },

                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt
                                }
                            ]
                        }
                    ],

                    generationConfig: {
                        responseMimeType: "application/json"
                    }
                })
            }
        );

        const data = await response.json();

        console.log("Gemini response status:", response.status);

        if (!response.ok) {
            console.error("Gemini API error:", data);

            if (response.status === 429) {
                return res.status(429).json({
                    error: "Gemini free quota has been reached. Please try again later."
                });
            }

            if (response.status === 503) {
                return res.status(503).json({
                    error: "Gemini is temporarily busy. Please try again later."
                });
            }

            return res.status(response.status).json({
                error: "Gemini API error."
            });
        }

        const text =
            data.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!text) {
            return res.status(500).json({
                error: "Gemini did not return a recipe."
            });
        }

        const recipe = JSON.parse(text);

        res.json(recipe);

    } catch (error) {
        console.error("Recipe generation error:", error);

        res.status(500).json({
            error: "Unable to generate recipe."
        });
    }
});

app.listen(PORT, () => {
    console.log(
        `FridgeChef AI is running at http://localhost:${PORT}`
    );
});