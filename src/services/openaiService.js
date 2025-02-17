import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const getRecommendation = async (favorites, previousTitles = []) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a book recommendation expert. Return ONLY raw JSON with no markdown formatting or backticks. Your recommendation MUST be unique and different from these previous recommendations: " + previousTitles.join(", ") + ". Format: {\"title\": \"Book Title\", \"author\": \"Author Name\", \"connections\": [{\"interest\": \"user interest\", \"explanation\": \"why it connects\"}]}"
        },
        {
          role: "user",
          content: `Recommend a unique book based on these interests: ${favorites.map(f => f.value).join(', ')}`
        }
      ],
      temperature: 0.7,
    });

    // Log the raw response
    console.log('Raw OpenAI Response:', response.choices[0].message.content);

    let recommendation;
    try {
      recommendation = JSON.parse(response.choices[0].message.content.trim());
    } catch (parseError) {
      console.error('Parse Error Details:', {
        error: parseError.message,
        content: response.choices[0].message.content,
        position: parseError.position
      });
      return null;
    }

    return recommendation;
  } catch (error) {
    console.error('API Error:', error);
    return null;
  }
};

// Helper function to get multiple unique recommendations
const getMultipleRecommendations = async (favorites, count = 5) => {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: `You are a book recommendation expert. Return exactly ${count} recommendations as raw JSON with NO markdown formatting, NO \`\`\` markers, and NO additional text:
{
  "recommendations": [
    {
      "title": "Book Title",
      "author": "Author Name",
      "connections": [
        {
          "interest": "user interest",
          "explanation": "why it connects"
        }
      ]
    }
  ]
}
Do not wrap the response in code blocks or add any formatting.`
        },
        {
          role: "user",
          content: `Recommend ${count} unique books based on these interests: ${favorites.map(f => f.value).join(', ')}`
        }
      ],
      temperature: 0.7,
    });

    let content = response.choices[0].message.content.trim();
    
    // Remove any markdown code block markers if present
    content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    
    console.log('Raw OpenAI Response:', content);

    const parsed = JSON.parse(content);
    if (!parsed.recommendations || !Array.isArray(parsed.recommendations) || parsed.recommendations.length !== count) {
      console.error('Invalid response structure:', parsed);
      return [];
    }

    return parsed.recommendations;
  } catch (error) {
    console.error('API Error:', error);
    return [];
  }
};

export { getRecommendation, getMultipleRecommendations }; 