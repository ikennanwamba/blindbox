const DEEPSEEK_API_KEY = import.meta.env.VITE_DEEPSEEK_API_KEY;
const API_URL = 'https://api.deepseek.com/v1/chat/completions';

// Keep track of previous recommendations
let previousRecommendations = new Set();

const createPrompt = (favorites, isNewRequest = false) => {
  const previousBooks = Array.from(previousRecommendations).join(', ');
  
  let prompt = `Based on these interests: ${favorites.join(', ')}, recommend a book.`;
  
  if (isNewRequest && previousBooks.length > 0) {
    prompt += ` Please suggest a different book that has NOT been recommended before. Previously recommended books were: ${previousBooks}. The new recommendation should be unique and NOT include any of these titles.`;
  }

  prompt += ` Return your response in this exact JSON format, with no additional text or formatting:
{
  "title": "Book Title",
  "author": "Author Name",
  "connections": [
    {
      "topic": "${favorites[0]}",
      "explanation": "Detailed explanation of how the book connects to this interest"
    },
    {
      "topic": "${favorites[1]}",
      "explanation": "Detailed explanation of how the book connects to this interest"
    },
    {
      "topic": "${favorites[2]}",
      "explanation": "Detailed explanation of how the book connects to this interest"
    }
  ]
}`;

  return prompt;
};

export const getRecommendation = async (favorites, isNewRequest = false) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "user",
            content: createPrompt(favorites, isNewRequest)
          }
        ],
        temperature: isNewRequest ? 0.9 : 0.7,
        max_tokens: 1000,
        presence_penalty: isNewRequest ? 1.0 : 0, // Encourage different tokens
        frequency_penalty: isNewRequest ? 1.0 : 0  // Discourage repetition
      })
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    console.log('Raw API response:', data);

    const content = data.choices[0].message.content;
    console.log('Content before parsing:', content);

    try {
      const cleanedContent = content.trim().replace(/```json\n?|\n?```/g, '');
      console.log('Cleaned content:', cleanedContent);
      
      const parsedResponse = JSON.parse(cleanedContent);
      
      // Add the new recommendation to our history
      previousRecommendations.add(parsedResponse.title);
      
      // Keep only the last 5 recommendations in history
      if (previousRecommendations.size > 5) {
        const [firstItem] = previousRecommendations;
        previousRecommendations.delete(firstItem);
      }
      
      return parsedResponse;
    } catch (parseError) {
      console.error('Parse error:', parseError);
      return {
        title: "Error Processing Recommendation",
        author: "System",
        connections: favorites.map(fav => ({
          topic: fav,
          explanation: "We encountered an error processing this recommendation. Please try again."
        }))
      };
    }
  } catch (error) {
    console.error('API error:', error);
    throw error;
  }
};

// Add a function to clear history if needed
export const clearRecommendationHistory = () => {
  previousRecommendations.clear();
}; 