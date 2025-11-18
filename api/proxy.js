// Contenu pour : /api/proxy.js

export default async function handler(request, response) {
  // 1. Récupérer la vraie clé API (stockée en secret sur Vercel)
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  
  if (!GEMINI_API_KEY) {
     return response.status(500).json({ error: 'Clé API non configurée sur le serveur proxy.' });
  }

  // ✅ CORRIGÉ : Faute de frappe dans "language"
  const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`;

  // 2. Vérifier que c'est une requête POST
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 3. Transférer la requête de Shopify vers Google
    const geminiResponse = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      // request.body contient déjà le JSON envoyé par le chatbot
      body: JSON.stringify(request.body), 
    });

    // 4. Récupérer la réponse de Google
    const data = await geminiResponse.json();
    
    // 5. Envoyer la réponse de Google au chatbot (via Shopify)
    // Important : Vercel ajoute 'Access-Control-Allow-Origin' automatiquement
    response.status(200).json(data);

  } catch (error) {
    console.error('Erreur du proxy:', error.message);
    response.status(500).json({ error: "Erreur lors de la communication avec l'API Gemini." });
  }
}
