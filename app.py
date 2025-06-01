from flask import Flask, request, jsonify, render_template
from transformers import BartTokenizer, BartForConditionalGeneration
from sumy.parsers.plaintext import PlaintextParser
from sumy.nlp.tokenizers import Tokenizer
from sumy.summarizers.lsa import LsaSummarizer
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import redis
import torch
import hashlib
import logging

app = Flask(__name__, static_folder='static', template_folder='templates')

redis_connection = redis.Redis(host='localhost', port=6379)

limiter = Limiter(
    key_func=get_remote_address,
    storage_uri="redis://localhost:6379",  # Use Redis for storage
    default_limits=["10 per minute"]
)
limiter.init_app(app)

logging.basicConfig(
    format='%(asctime)s - %(levelname)s - %(message)s',  # Remove {ip}
    level=logging.INFO
)

model_name = "facebook/bart-large-cnn"
tokenizer = BartTokenizer.from_pretrained(model_name)
model = BartForConditionalGeneration.from_pretrained(model_name)

summary_cache = {}
MAX_INPUT_LENGTH = 4000


def log_request(ip: str, message: str):
    logging.info(f"{ip} - {message}")


def summarize_with_sumy(text: str, sentences_count: int) -> str:
    parser = PlaintextParser.from_string(text, Tokenizer("english"))
    summarizer = LsaSummarizer()
    summary = summarizer(parser.document, sentences_count)
    return ' '.join(str(sentence) for sentence in summary)


@app.route('/', methods=['GET'])
def home():
    return render_template('index.html')  # Renders the HTML template


@app.route('/summarize', methods=['POST'])
@limiter.limit("10 per minute")
def summarize():
    client_ip = request.remote_addr or "unknown"
    data = request.json
    if not data:
        return jsonify({"error": "Invalid request"}), 400

    input_text = data.get('text', '').strip()
    selected_model = data.get('model', 'bart')
    length = data.get('length', 'medium')

    log_request(client_ip, f"Summarize request: model={selected_model}, length={length}")

    if not input_text:
        return jsonify({"error": "No text provided for summarization."}), 400
    if len(input_text) > MAX_INPUT_LENGTH:
        return jsonify({"error": f"Input text too long (max {MAX_INPUT_LENGTH} characters)."}), 400

    # Logic for short, medium, and long summaries
    if length == 'short':
        min_len, max_len, sumy_sent = 30, 75, 3
    elif length == 'long':
        min_len, max_len, sumy_sent = 75, 200, 7
    else:
        min_len, max_len, sumy_sent = 50, 150, 5

    cache_key_base = f"{input_text}_{selected_model}_{length}"
    cache_key = hashlib.sha256(cache_key_base.encode('utf-8')).hexdigest()
    if cache_key in summary_cache:
        log_request(client_ip, f"Cache hit for key: {cache_key}")
        return jsonify({"summary": summary_cache[cache_key]})

    try:
        if selected_model == 'sumy':
            summary = summarize_with_sumy(input_text, sumy_sent)
        else:
            inputs = tokenizer.batch_encode_plus([input_text], max_length=1024, truncation=True, return_tensors='pt')
            with torch.no_grad():
                summary_ids = model.generate(
                    inputs['input_ids'],
                    attention_mask=inputs['attention_mask'],
                    max_length=max_len,
                    min_length=min_len,
                    length_penalty=2.0,
                    num_beams=4,
                    early_stopping=True
                )
            summary = tokenizer.decode(summary_ids[0], skip_special_tokens=True)
        summary_cache[cache_key] = summary

        log_request(client_ip, f"Summary generated successfully for key: {cache_key}")

        return jsonify({"summary": summary})

    except Exception as e:
        logging.error(f"Error generating summary: {str(e)}", exc_info=True)
        return jsonify({"error": "Failed to generate summary. Please try again later."}), 500


if __name__ == '__main__':
    app.run(debug=True)
