const scriptTag = document.currentScript;
const subject = scriptTag.getAttribute('data-subject');
const settingsKey = `quizSettings_${subject}`;
let allData, restartData;

function loadQuizData() {
    fetch(`./${subject}.json`)
        .then((res) => res.json())
        .then((data) => {
            allData = data;
            localStorage.setItem(`quizData_${subject}`, JSON.stringify(allData));
            setupQuizSettings(allData);
        })
        .catch((err) => console.error('クイズデータの読み込みに失敗しました:', err));
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function setupQuizSettings(quizData) {
    const container = document.getElementById('quiz-container');
    const genres = quizData.map(q => q.genre);

    container.innerHTML = `
        <h2>クイズの設定</h2>
        <form id="quiz-settings-form">
            <h3>ジャンルを選択してください</h3>
            ${genres.map((genre, i) => `
                <label>
                    <input type="radio" name="genre" value="${genre}" ${i === 0 ? 'checked' : ''}> ${genre}
                </label><br>`).join('')}
            <h3>質問数を選択してください</h3>
            <input type="range" id="question-count" min="1" value="1">
            <span id="question-count-display">1</span> 問<br>
            <h3>回答形式を選択してください</h3>
            <label><input type="radio" name="answer-type" value="select" id="select-answer" checked> 選択式</label>
            <label><input type="radio" name="answer-type" value="input" id="input-answer"> 入力式</label><br>
            <button type="button" id="start-quiz-button">[enter] クイズを開始</button>
        </form>
    `;

    const questionCountInput = document.getElementById('question-count');
    const questionCountDisplay = document.getElementById('question-count-display');
    const startButton = document.getElementById('start-quiz-button');
    const genreRadios = document.querySelectorAll('input[name="genre"]');
    const answerTypeRadios = document.querySelectorAll('input[name="answer-type"]');
    const selectAnswerRadio = document.getElementById('select-answer');
    const inputAnswerRadio = document.getElementById('input-answer');

    const saved = JSON.parse(localStorage.getItem(settingsKey));
    if (saved) {
        const genreRadio = [...genreRadios].find(r => r.value === saved.genre);
        if (genreRadio) genreRadio.checked = true;
        questionCountInput.value = saved.questionCount || 1;
        questionCountDisplay.textContent = questionCountInput.value;
        const answerTypeRadio = [...answerTypeRadios].find(r => r.value === saved.answerType);
        if (answerTypeRadio) answerTypeRadio.click();
    }

    questionCountInput.addEventListener('input', () => {
        questionCountDisplay.textContent = questionCountInput.value;
    });

    genreRadios.forEach(r => r.addEventListener('change', updateRangeMax));
    updateRangeMax();

    function updateRangeMax() {
        const selectedGenre = document.querySelector('input[name="genre"]:checked').value;
        const data = quizData.find(q => q.genre === selectedGenre);
        const max = data?.list?.length || 10;
        questionCountInput.max = max;
        if (parseInt(questionCountInput.value, 10) > max) {
            questionCountInput.value = max;
        }
        questionCountDisplay.textContent = questionCountInput.value;

        const type = data?.answerType || 'select';
        if (type === 'input') {
            selectAnswerRadio.disabled = true;
            inputAnswerRadio.disabled = false;
            inputAnswerRadio.click();
        } else {
            selectAnswerRadio.disabled = false;
            inputAnswerRadio.disabled = false;
        }
    }

    document.addEventListener('keydown', handleEnterStart);
    startButton.addEventListener('click', () => {
        const selectedGenre = document.querySelector('input[name="genre"]:checked').value;
        const answerType = document.querySelector('input[name="answer-type"]:checked').value;
        const data = quizData.find(q => q.genre === selectedGenre);

        const count = parseInt(questionCountInput.value, 10);
        let quizSubset;

        if (subject === 'math') {
            quizSubset = { list: Array.from({ length: count }, () => generateQuestion(selectedGenre)) };
        } else {
            if (!data?.list) return;
            quizSubset = { list: shuffleArray([...data.list]).slice(0, count) };
        }

        restartData = { quizData: quizSubset, answerType };
        localStorage.setItem(settingsKey, JSON.stringify({ genre: selectedGenre, questionCount: count, answerType }));

        document.removeEventListener('keydown', handleEnterStart);
        startQuiz(quizSubset, answerType);
    });

    function handleEnterStart(e) {
        if (e.key === 'Enter') startButton.click();
    }
}

function startQuiz(quizData, answerType = 'select') {
    const container = document.getElementById('quiz-container');
    container.innerHTML = `
        <div id="question-container">
            <h2 id="question"></h2>
            <div id="options"></div>
            <p id="result"></p>
            <button id="next-button" style="display:none;">次の質問</button>
        </div>
    `;

    const questionEl = document.getElementById('question');
    const optionsEl = document.getElementById('options');
    const resultEl = document.getElementById('result');
    const nextBtn = document.getElementById('next-button');

    let index = 0, score = 0, answered = false, inputField;

    showQuestion();

    function showQuestion() {
        answered = false;
        const q = quizData.list[index];
        questionEl.innerHTML = q.question.replace(/\$\$(.*?)\$\$/g, (_, tex) => `<span class="mathjax">\\(${tex}\\)</span>`).replace('\n', '<br>');
        optionsEl.innerHTML = '';

        if (answerType === 'select') {
            shuffleArray([...q.options]).forEach((opt, i) => {
                const btn = document.createElement('button');
                btn.textContent = `${i + 1}: ${opt}`;
                btn.className = 'option-button';
                btn.style = 'padding:10px 20px;font-size:1.5rem';
                btn.addEventListener('click', () => checkAnswer(btn, opt, q.answer));
                optionsEl.appendChild(btn);
            });
        } else {
            inputField = document.createElement('input');
            inputField.type = 'text';
            inputField.style.fontSize = '1.5rem';
            optionsEl.appendChild(inputField);
            inputField.focus();

            const onInput = () => {
                if (inputField.value.trim() === q.answer) {
                    checkAnswer(null, inputField.value.trim(), q.answer);
                    inputField.removeEventListener('input', onInput);
                }
            };
            inputField.addEventListener('input', onInput);

            inputField.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' && nextBtn.style.display === 'block') {
                    e.preventDefault();
                    nextBtn.click();
                }
            });

            if (subject === 'math' && typeof showKeyboard === 'function') {
                showKeyboard();
            }
        }

        if (window.MathJax) MathJax.typesetPromise().catch(console.error);
    }

    function checkAnswer(button, selected, correct) {
        if (answered) return;
        answered = true;
        const correctText = `正解: ${correct}`;
        resultEl.textContent = selected === correct ? '正解！' : `不正解… ${correctText}`;
        if (selected === correct) score++;
        nextBtn.style.display = 'block';

        nextBtn.onclick = () => {
            index++;
            if (index < quizData.list.length) {
                resultEl.textContent = '';
                nextBtn.style.display = 'none';
                showQuestion();
            } else {
                container.innerHTML = `<h2>終了！ スコア: ${score} / ${quizData.list.length}</h2>`;
            }
        };
    }
}

loadQuizData();