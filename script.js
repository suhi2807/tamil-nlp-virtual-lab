let dataset = {};

// ===== NLP FUNCTIONS =====

const tamilStopWords = [
    "ஒரு", "இந்த", "அந்த", "மற்றும்", "என்று", "உம்", "இல்"
];

function posTag(word) {
    if (word.endsWith("கள்")) return "Noun (Plural)";
    if (word.endsWith("ம்")) return "Noun";
    if (word.endsWith("கிறது") || word.endsWith("வான்")) return "Verb";
    return "Unknown";
}

function removePunctuation(word) {
    return word.replace(/[.,!?;:'"()]/g, "");
}

function removeStopWord(word) {
    return tamilStopWords.includes(word) ? "Removed" : word;
}

function stemWord(word) {
    const suffixes = ["கள்", "ங்கள்", "வுகள்", "ம்", "இல்", "ஐ"];
    for (let suf of suffixes) {
        if (word.endsWith(suf)) {
            return word.slice(0, -suf.length);
        }
    }
    return word;
}

const lemmaDict = {
    "மரங்கள்": "மரம்",
    "மரத்தில்": "மரம்",
    "சென்றான்": "செல்",
    "வந்தாள்": "வா"
};

function lemmatize(word) {
    return lemmaDict[word] || stemWord(word);
}

// ================= LOAD DATASET =================
fetch("Tamil_Word_Analysis_Dataset.json")
    .then(res => res.json())
    .then(data => {
        const datalist = document.getElementById("word-list");

        data.forEach(item => {
            const wordKey = item["Word (English)"].toLowerCase();
            dataset[wordKey] = {
                root: item["Root (Tamil)"],
                category: item["Category"],
                gender: item["Gender"],
                number: item["Number"],
                person: item["Person"],
                case: item["Case"],
                tense: item["Tense"],
                tamilMeaning: item["Meaning (Tamil)"],
                englishMeaning: item["Meaning (English)"],
                workflow: item["NLP_Workflow"] || [],
                note: item["Note"]
            };

            let option = document.createElement("option");
            option.value = item["Word (English)"];
            datalist.appendChild(option);
        });

        console.log("✅ Dataset loaded & Dropdown populated");
    })
    .catch(err => console.error("❌ Dataset load error:", err));


// ================= CHECK ANSWER =================
document.getElementById("check-btn").addEventListener("click", () => {
    const word = document.getElementById("word-input").value.trim().toLowerCase();
    const result = document.getElementById("result");

    if (!dataset[word]) {
        result.textContent = "❌ Word not found in dataset";
        result.className = "result-box incorrect";
        return;
    }

    const d = dataset[word];

    const correct =
        document.getElementById("root").value === d.root &&
        document.getElementById("category").value === d.category &&
        document.getElementById("gender").value === d.gender &&
        document.getElementById("number").value === d.number &&
        document.getElementById("person").value === d.person &&
        document.getElementById("case").value === d.case &&
        document.getElementById("tense").value === d.tense;

    result.textContent = correct
        ? "✅ Correct Analysis!"
        : "❌ Some features are incorrect";

    result.className = correct ? "result-box correct" : "result-box incorrect";
});


// ================= SHOW CORRECT ANALYSIS =================
document.getElementById("show-btn").addEventListener("click", () => {
    const word = document.getElementById("word-input").value.trim().toLowerCase();
    const d = dataset[word];
    const result = document.getElementById("result");

    if (!d) return;

    result.className = "result-box show";
    result.innerHTML = `
        <h3>Correct Linguistic Analysis</h3>
        <table class="analysis-table">
            <tr><td>Root</td><td>${d.root}</td></tr>
            <tr><td>Category</td><td>${d.category}</td></tr>
            <tr><td>Gender</td><td>${d.gender}</td></tr>
            <tr><td>Number</td><td>${d.number}</td></tr>
            <tr><td>Person</td><td>${d.person}</td></tr>
            <tr><td>Case</td><td>${d.case}</td></tr>
            <tr><td>Tense</td><td>${d.tense}</td></tr>
            <tr><td>Tamil Meaning</td><td>${d.tamilMeaning}</td></tr>
            <tr><td>English Meaning</td><td>${d.englishMeaning}</td></tr>
        </table>

        <h3 style="margin-top:30px;">🧠 How NLP / LLM Understands This Word</h3>
        <div id="nlp-workflow-horizontal"></div>
    `;

    const container = document.getElementById("nlp-workflow-horizontal");

    d.workflow.forEach((step, index) => {
        setTimeout(() => {
            const div = document.createElement("div");
            div.className = "nlp-step-horizontal animate";
            div.innerHTML = `
                <b>Step ${step.step}</b><br>
                <span class="step-title">${step.title}</span><br>
                <small>${step.detail}</small>
            `;
            container.appendChild(div);
        }, index * 400);
    });
});


// ================= RESET =================
document.getElementById("reset-btn").addEventListener("click", () => {
    document.querySelectorAll("input, select").forEach(e => e.value = "");
    document.getElementById("result").innerHTML = "";
});


// ================= WORD GENERATION =================
document.getElementById("generate-btn").addEventListener("click", () => {
    const root = document.getElementById("root").value.trim();
    const category = document.getElementById("category").value;
    const number = document.getElementById("number").value;
    const caseVal = document.getElementById("case").value;
    const tense = document.getElementById("tense").value;
    const result = document.getElementById("result");

    if (!root || !category) {
        result.textContent = "❌ Please enter Root and Category";
        return;
    }

    let generatedWord = "";

    // 🔹 TAMIL NOUN GENERATION
    if (category === "Noun") {
        generatedWord = root;

        if (number === "Plural") {
            generatedWord += "கள்";
        }
        if (caseVal === "Locative") {
            generatedWord += "இல்";
        }
        if (caseVal === "Accusative") {
            generatedWord += "ஐ";
        }
    }

    // 🔹 ENGLISH VERB GENERATION
    if (category === "Verb") {
        if (tense === "Past") {
            generatedWord = (root === "run") ? "ran" : root + "ed";
        } 
        else if (tense === "Present") {
            generatedWord = root;
        } 
        else if (tense === "Future") {
            generatedWord = "will " + root;
        }
    }

    if (generatedWord) {
        result.innerHTML = `⚙️ Generated Word: <b>${generatedWord}</b>`;
        result.className = "result-box correct";
    } else {
        result.textContent = "❌ Cannot generate word for given features";
        result.className = "result-box incorrect";
    }
// ===== NLP AUTO RUN (ADD ONLY) =====
document.getElementById("check-btn").addEventListener("click", () => {

    const word = document.getElementById("word-input").value.trim();
    if (!word) return;

    const clean = removePunctuation(word);

    document.getElementById("pos").value = posTag(clean);
    document.getElementById("punctuation").value = clean;
    document.getElementById("stopword").value = removeStopWord(clean);
    document.getElementById("stem").value = stemWord(clean);
    document.getElementById("lemma").value = lemmatize(clean);
});

});
