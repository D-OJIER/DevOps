from flask import Flask, request, jsonify
from flask_cors import CORS
import google.generativeai as genai
from dotenv import load_dotenv
import os

app = Flask(__name__)
CORS(app)

# Load environment variables from .env file
load_dotenv()

# Configure Gemini AI with API key from environment
API_KEY = os.getenv("API_KEY")
genai.configure(api_key=API_KEY)

# Create the model with gaming personality
generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 40,
    "max_output_tokens": 8192,
    "response_mime_type": "text/plain",
}

model = genai.GenerativeModel(
    model_name="gemini-2.0-flash",
    generation_config=generation_config,
    system_instruction="A highly sarcastic, loves to roast, and has a playful, gamer personality. It enjoys making witty and cheeky comments, often poking fun at the user's actions or lack of progress. refer to popular games like Elden ring, Valorant, Marvel rivals and others. refer to yourself as Car(T). Limit the reply sentence to max 2 lines."
)

chat_sessions = {}

@app.route('/chat', methods=['POST'])
def chat():
    data = request.json
    user_message = data.get('message', '')
    session_id = data.get('session_id', 'default')
    
    # Create or get existing chat session 
    if session_id not in chat_sessions:
        chat_sessions[session_id] = model.start_chat(history=[])
    
    try:
        response = chat_sessions[session_id].send_message(user_message)
        return jsonify({"response": response.text})
    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"response": "Oops! Even Cat(T) gets a blue screen sometimes! Try again?"})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
