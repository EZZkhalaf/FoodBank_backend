const express = require('express');
const fetch = require('node-fetch')

const improveInstructions = async (req, res) => {
  const { message } = req.body;
  const firstPrompt = "I want you to explain in one paragraph. Between each step put a '. 'no numbers or anything just one paragraph  Make it simple and clear. Don't use 'first', 'second', or any numbering. Only provide the instructions. Here's the content:";  
  const fullMessage = firstPrompt + message;
  const API_INSTRUCTIONS = process.env.API_INSTRUCTIONS_IMPROVE_KEY;


  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_INSTRUCTIONS}`,
        "HTTP-Referer": "http://localhost:5000/apiDeepseek/improveInstructions",
        "X-Title": "noFoodWaste",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-r1-zero:free",
        messages: [
          {
            role: "user",
            content: fullMessage
          }
        ]
      })
    });

    const data = await response.json();
    const reasoning = data.choices[0].message.reasoning;
    return res.status(200).json(reasoning);


  } catch (error) {
    console.error(error); 
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = improveInstructions;
