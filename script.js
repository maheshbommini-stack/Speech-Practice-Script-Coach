const speechText = document.getElementById("speechText");

const analyzeBtn = document.getElementById("analyzeBtn");
const sampleBtn = document.getElementById("sampleBtn");

const liveWords = document.getElementById("liveWords");

const wordCount = document.getElementById("wordCount");
const speechTime = document.getElementById("speechTime");
const sentenceCount = document.getElementById("sentenceCount");
const fillerCount = document.getElementById("fillerCount");

const averageSentence =
    document.getElementById("averageSentence");

const fillerStatus =
    document.getElementById("fillerStatus");

const speakingSpeed =
    document.getElementById("speakingSpeed");

const keywords =
    document.getElementById("keywords");

const feedback =
    document.getElementById("feedback");

const longSentences =
    document.getElementById("longSentences");


function updateWordCounter() {

    const text = speechText.value.trim();

    if (!text) {
        liveWords.textContent = "0 words";
        return;
    }

    const words = text.match(/\b[\w']+\b/g) || [];

    liveWords.textContent =
        `${words.length} words`;
}


speechText.addEventListener(
    "input",
    updateWordCounter
);


analyzeBtn.addEventListener(
    "click",
    analyzeSpeech
);


async function analyzeSpeech() {

    const text = speechText.value.trim();

    if (!text) {

        alert(
            "Please enter your speech before analyzing."
        );

        return;
    }


    analyzeBtn.disabled = true;

    analyzeBtn.textContent =
        "Analyzing...";


    try {

        const response = await fetch(
            "/analyze",
            {
                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({
                    text: text
                })
            }
        );


        const data = await response.json();


        if (!response.ok) {

            throw new Error(
                data.error || "Analysis failed"
            );

        }


        displayResults(data);

    }

    catch (error) {

        alert(
            "Unable to analyze the speech. " +
            error.message
        );

    }

    finally {

        analyzeBtn.disabled = false;

        analyzeBtn.textContent =
            "Analyze Speech →";
    }
}


function displayResults(data) {

    wordCount.textContent =
        data.word_count;

    speechTime.textContent =
        data.estimated_time;

    sentenceCount.textContent =
        data.sentence_count;

    fillerCount.textContent =
        data.filler_count;

    averageSentence.textContent =
        data.average_sentence_length;

    fillerStatus.textContent =
        data.filler_status;

    speakingSpeed.textContent =
        data.speaking_speed + " WPM";


    displayKeywords(
        data.keywords
    );


    displayFeedback(
        data.feedback
    );


    displayLongSentences(
        data.long_sentences
    );
}


function displayKeywords(list) {

    keywords.innerHTML = "";


    if (!list.length) {

        keywords.innerHTML =
            '<p class="empty">No keywords found.</p>';

        return;
    }


    list.forEach(item => {

        const element =
            document.createElement("span");

        element.className =
            "keyword";

        element.textContent =
            `${item.word} × ${item.count}`;

        keywords.appendChild(element);
    });
}


function displayFeedback(list) {

    feedback.innerHTML = "";


    list.forEach(message => {

        const element =
            document.createElement("div");

        element.className =
            "feedback-item";

        element.textContent =
            "✓ " + message;

        feedback.appendChild(element);
    });
}


function displayLongSentences(list) {

    longSentences.innerHTML = "";


    if (!list.length) {

        longSentences.innerHTML =
            '<p class="empty">✓ No unusually long sentences detected.</p>';

        return;
    }


    list.forEach(item => {

        const element =
            document.createElement("div");

        element.className =
            "long-sentence";

        element.textContent =
            `${item.text} (${item.words} words)`;

        longSentences.appendChild(element);
    });
}


sampleBtn.addEventListener(
    "click",
    () => {

        speechText.value =
`Good morning everyone. Today I am going to talk about the importance of artificial intelligence in education.

Artificial intelligence can help students learn more effectively by providing personalized learning experiences.

It can also help teachers identify areas where students need additional support.

Another important application is intelligent educational software. These systems can provide practice questions, explanations and feedback based on student performance.

However, artificial intelligence should be used responsibly.

In conclusion, artificial intelligence has the potential to improve education when it is designed and used carefully.`;

        updateWordCounter();

        analyzeSpeech();
    }
);
