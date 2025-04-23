
// const express = require('express');
// const fetch = require('node-fetch');
// const improveInstructions = async(req,res) =>{
//     const { message } = req.body;
//     const firstPrompt = "i want you to explain in one paragraph with between each step you put a '/' and improve and make it simple and dont write anything except the paragraph here is (  "
//     const lastPrompt = ')';
//     const fullMessage = firstPrompt + message + lastPrompt;
//     const API_INSTRUCTIONS = process.env.API_INSTRUCTIONS_IMPROVE_KEY;
//     console.log('testing')
//     try {
//         const response = await fetch("https://openrouter.ai/api/v1/chat/completions" , {
//             method: "POST",
//             headers: {
//               "Authorization": `Bearer ${API_INSTRUCTIONS}`,
//               "HTTP-Referer": "http://localhost:5000/apiDeepseek/improveInstructions", // Optional. Site URL for rankings on openrouter.ai.
//               "X-Title": "noFoodWaste", // Optional. Site title for rankings on openrouter.ai.
//               "Content-Type": "application/json"
//             },
//             body: JSON.stringify({
//               "model": "deepseek/deepseek-r1-zero:free",
//               "messages": [
//                 {
//                   "role": "user",
//                   "content": fullMessage
//                 }
//               ]
//             })
//           });

//         const data = await response.json();
//         return res.status(200).json(data);
//     } catch (error) {
//         console.log(error)
//         res.status(500).json({ error: 'Internal Server Error' });
//     }
// }

// module.exports = improveInstructions;


const express = require('express');
const fetch = require('node-fetch')

const improveInstructions = async (req, res) => {
  const { message } = req.body;
  const firstPrompt = "i want you to explain in one paragraph with between each step you put a '/' and improve and make it simple and dont write anything except the paragraph here is (  ";
  const lastPrompt = ')';
  const fullMessage = firstPrompt + message + lastPrompt;
  const API_INSTRUCTIONS = process.env.API_INSTRUCTIONS_IMPROVE_KEY; // Fix typo

  console.log('testing');
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
    console.log(reasoning);

    return res.status(200).json(data);
  } catch (error) {
    console.error(error); // Helpful for debugging
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = improveInstructions;
