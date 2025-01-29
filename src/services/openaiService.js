import { supabase } from './supabaseClient';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
console.log('OpenAI Key loaded:', !!OPENAI_API_KEY); // Will log true if key exists, false if undefined
const API_URL = 'https://api.openai.com/v1/chat/completions';

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

let previousRecommendations = new Set();

export const getRecommendation = async (favorites, isNewRequest = false) => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'OpenAI-Beta': 'assistants=v1'
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          {
            role: "user",
            content: createPrompt(favorites, isNewRequest)
          }
        ],
        temperature: isNewRequest ? 0.9 : 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    
    try {
      const cleanedContent = content.trim().replace(/```json\n?|\n?```/g, '');
      const parsedResponse = JSON.parse(cleanedContent);
      
      previousRecommendations.add(parsedResponse.title);
      
      if (previousRecommendations.size > 5) {
        const [firstItem] = previousRecommendations;
        previousRecommendations.delete(firstItem);
      }
      
      // Save to Supabase
      const { error } = await supabase
        .from('recommendations')
        .insert({
          title: parsedResponse.title,
          author: parsedResponse.author,
          interests: favorites,
          connections: parsedResponse.connections,
          times_recommended: 1
        });

      if (error) console.error('Error saving to Supabase:', error);
      
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

export const clearRecommendationHistory = () => {
  previousRecommendations.clear();
}; 