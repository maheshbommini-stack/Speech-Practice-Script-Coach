from flask import Flask, render_template, request, jsonify
import re
from collections import Counter

app = Flask(__name__)

STOP_WORDS = {
    "the", "a", "an", "and", "or", "but", "is", "are",
    "was", "were", "to", "of", "in", "on", "for", "with",
    "this", "that", "it", "as", "at", "by", "from", "be",
    "will", "can", "we", "our", "you", "your", "i", "my",
    "they", "their", "he", "she", "his", "her", "have",
    "has", "had", "do", "does", "did", "not", "about",
    "into", "than", "then", "also"
}

FILLER_WORDS = [
    "um",
    "uh",
    "like",
    "basically",
    "actually",
    "literally",
    "you know",
    "i mean"
]


def get_words(text):
    return re.findall(r"\b[a-zA-Z']+\b", text.lower())


def get_sentences(text):
    sentences = re.split(r"[.!?]+", text)

    return [
        sentence.strip()
        for sentence in sentences
        if sentence.strip()
    ]


def count_filler_words(text):
    text = text.lower()
    total = 0

    for filler in FILLER_WORDS:
        pattern = r"\b" + re.escape(filler) + r"\b"
        total += len(re.findall(pattern, text))

    return total


def get_keywords(words):
    useful_words = [
        word for word in words
        if len(word) > 3 and word not in STOP_WORDS
    ]

    frequency = Counter(useful_words)

    return [
        {
            "word": word,
            "count": count
        }
        for word, count in frequency.most_common(8)
    ]


def analyze_speech(text):

    words = get_words(text)
    sentences = get_sentences(text)

    total_words = len(words)
    total_sentences = len(sentences)

    filler_count = count_filler_words(text)

    if total_sentences > 0:
        average_sentence_length = round(
            total_words / total_sentences, 1
        )
    else:
        average_sentence_length = 0

    # Approximate presentation speed
    WPM = 150

    estimated_seconds = round(
        (total_words / WPM) * 60
    )

    minutes = estimated_seconds // 60
    seconds = estimated_seconds % 60

    if minutes > 0:
        estimated_time = f"{minutes} min {seconds} sec"
    else:
        estimated_time = f"{seconds} sec"

    long_sentences = []

    for sentence in sentences:

        sentence_word_count = len(get_words(sentence))

        if sentence_word_count > 25:

            long_sentences.append({
                "text": sentence,
                "words": sentence_word_count
            })

    if filler_count == 0:
        filler_status = "Excellent"
    elif filler_count <= 3:
        filler_status = "Low"
    elif filler_count <= 7:
        filler_status = "Moderate"
    else:
        filler_status = "High"

    feedback = []

    if total_words < 50:
        feedback.append(
            "Your speech is quite short. Consider adding more explanation."
        )
    elif total_words > 1000:
        feedback.append(
            "Your speech is long. Consider removing repeated ideas."
        )
    else:
        feedback.append(
            "Your speech has a reasonable amount of content."
        )

    if average_sentence_length > 25:
        feedback.append(
            "Some sentences are long. Try splitting them into shorter sentences."
        )
    else:
        feedback.append(
            "Your sentence length is suitable for spoken delivery."
        )

    if filler_count == 0:
        feedback.append(
            "No common filler words were detected."
        )
    else:
        feedback.append(
            "Practice pausing instead of using filler words."
        )

    feedback.append(
        "Read the speech aloud once before presenting."
    )

    return {
        "word_count": total_words,
        "sentence_count": total_sentences,
        "estimated_time": estimated_time,
        "average_sentence_length": average_sentence_length,
        "filler_count": filler_count,
        "filler_status": filler_status,
        "speaking_speed": WPM,
        "keywords": get_keywords(words),
        "long_sentences": long_sentences,
        "feedback": feedback
    }


@app.route("/")
def home():
    return render_template("index.html")


@app.route("/analyze", methods=["POST"])
def analyze():

    data = request.get_json()

    text = data.get("text", "").strip()

    if not text:
        return jsonify({
            "error": "Please enter a speech."
        }), 400

    result = analyze_speech(text)

    return jsonify(result)


if __name__ == "__main__":
    app.run(debug=True)
