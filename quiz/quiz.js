// スクリプトタグから値を取得
const scriptTag = document.currentScript;
const subject = scriptTag.getAttribute('data-subject');

let allData;

// 教科ごとの設定キー
const settingsKey = `quizSettings_${subject}`;

// クイズデータを取得またはlocalStorageから読み込む
function loadQuizData() {
    fetch(`./${subject}.json`)
        .then((response) => response.json())
        .then((data) => {
            allData = data;
            console.log('クイズデータ:', allData);
            localStorage.setItem('quizData_' + subject, JSON.stringify(allData)); // データをlocalStorageに保存
            setupQuizSettings(allData);
        })
        .catch((error) => console.error('クイズデータの読み込みに失敗しました:', error));
}

loadQuizData();

// 配列をランダムにシャッフルするユーティリティ関数
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

let restartData;

// ジャンル選択と問題数設定を同じ画面で表示
function setupQuizSettings(quizData) {
    const quizContainer = document.getElementById('quiz-container');
    const genres = quizData.map((quiz) => quiz.genre);

    quizContainer.innerHTML = `
        <h2>クイズの設定</h2>
        <form id="quiz-settings-form">
            <h3>ジャンルを選択してください</h3>
            ${genres
            .map(
                (genre, index) => `
                <label>
                    <input type="radio" name="genre" value="${genre}" ${index === 0 ? 'checked' : ''}>
                    ${genre}
                </label><br>
            `
            )
            .join('')}
            <h3>質問数を選択してください</h3>
            <label for="question-count">質問数:</label><br>
            <input type="range" id="question-count" min="1" value="1">
            <span id="question-count-display">1</span> 問<br>

            <h3>回答形式を選択してください</h3>
            <label>
                <input type="radio" name="answer-type" value="select" checked>
                選択式
            </label>
            <label>
                <input type="radio" name="answer-type" value="input">
                入力式
            </label><br>

            <button type="button" id="start-quiz-button">[enter] クイズを開始</button>
        </form>
    `;

    const questionCountInput = document.getElementById('question-count');
    const questionCountDisplay = document.getElementById('question-count-display');
    const startButton = document.getElementById('start-quiz-button');
    const genreRadios = document.querySelectorAll('input[name="genre"]');
    const answerTypeRadios = document.querySelectorAll('input[name="answer-type"]');

    // 設定を localStorage から読み込む
    const savedSettings = JSON.parse(localStorage.getItem(settingsKey));
    if (savedSettings) {
        // ジャンル
        const savedGenre = savedSettings.genre;
        if (savedGenre) {
            const genreRadio = [...genreRadios].find((radio) => radio.value === savedGenre);
            if (genreRadio) genreRadio.checked = true;
        }

        // 質問数
        if (savedSettings.questionCount) {
            questionCountInput.value = savedSettings.questionCount;
            questionCountDisplay.textContent = savedSettings.questionCount;
        }

        // 回答形式
        const savedAnswerType = savedSettings.answerType;
        if (savedAnswerType) {
            const answerTypeRadio = [...answerTypeRadios].find((radio) => radio.value === savedAnswerType);
            if (answerTypeRadio) answerTypeRadio.checked = true;
        }
    }

    // 質問数の表示を更新
    questionCountInput.addEventListener('input', () => {
        questionCountDisplay.textContent = questionCountInput.value;
    });

    // ジャンル選択時にスライダーの最大値を更新
    genreRadios.forEach((radio) => {
        radio.addEventListener('change', rangeInputReset);
    });

    function rangeInputReset() {
        const selectedGenre = document.querySelector('input[name="genre"]:checked').value;
        const selectedQuizData = quizData.find((quiz) => quiz.genre === selectedGenre);

        if (selectedQuizData && selectedQuizData.list) {
            const maxQuestions = selectedQuizData.list.length;
            questionCountInput.max = maxQuestions;

            // スライダーの現在の値が最大値を超えている場合、最大値にリセット
            if (parseInt(questionCountInput.value, 10) > maxQuestions) {
                questionCountInput.value = maxQuestions;
            }

            questionCountDisplay.textContent = questionCountInput.value;
        } else {
            // selectedQuizData.list が存在しない場合のエラーハンドリング
            console.error('選択されたジャンルの問題リストが見つかりません');
            questionCountInput.max = 10; // デフォルト値
            questionCountDisplay.textContent = 10;
        }
    }

    function startHundleKeyPress(event) {
        if (event.key === 'Enter') {
            startButton.click();
        }
    }

    // Enterキーでクイズ開始
    document.addEventListener('keydown', startHundleKeyPress);

    // クイズ開始ボタンのクリックイベント
    startButton.addEventListener('click', () => {
        const selectedGenre = document.querySelector('input[name="genre"]:checked').value;
        const answerType = document.querySelector('input[name="answer-type"]:checked').value;
        let selectedQuizData = quizData.find((quiz) => quiz.genre === selectedGenre);

        if (!selectedQuizData || !selectedQuizData.list) {
            console.error('指定されたジャンルのクイズデータが見つかりません');
            // 数学の場合、または selectedQuizData がない場合に空のリストを初期化
            if (subject === 'math') {
                selectedQuizData = { list: [] }; // 空のリストで初期化
            } else {
                return;
            }
        }

        const questionCount = parseInt(questionCountInput.value, 10);

        let limitedQuizData;
        if (subject === 'math') {
            // 数学の場合、指定された問題数だけ問題を生成
            const generatedQuestions = [];
            for (let i = 0; i < questionCount; i++) {
                generatedQuestions.push(generateQuestion(selectedGenre));
            }
            limitedQuizData = { list: generatedQuestions };
        } else {
            // 数学以外の場合、既存のロジックを使用
            const shuffledQuizList = shuffleArray([...selectedQuizData.list]);
            limitedQuizData = {
                list: shuffledQuizList.slice(0, questionCount),
            };
        }

        restartData = {
            quizData: limitedQuizData,
            answerType: answerType,
        };

        // 設定を localStorage に保存
        const settingsToSave = {
            genre: selectedGenre,
            questionCount: questionCount,
            answerType: answerType,
        };
        localStorage.setItem(settingsKey, JSON.stringify(settingsToSave));

        document.removeEventListener('keydown', startHundleKeyPress);
        startQuiz(limitedQuizData, answerType);
    });

    rangeInputReset();
}

// クイズを開始
function startQuiz(quizData, answerType = 'select') {
    const quizContainer = document.getElementById('quiz-container');
    let startTime = Date.now(); // クイズ開始時刻を記録

    quizContainer.innerHTML = `
        <div id="question-container">
            <h2 id="question"></h2>
            <div id="options"></div>
            <p id="result"></p>
            <button id="next-button" style="display: none;">次の質問</button>
        </div>
    `;

    const questionElement = document.getElementById('question');
    const optionsElement = document.getElementById('options');
    const resultElement = document.getElementById('result');
    const nextButton = document.getElementById('next-button');

    let currentQuestionIndex = 0;
    let score = 0;
    let selectedOptionIndex = null; // 現在選択中の選択肢のインデックス
    let answered = false; // 回答済みフラグ

    let inputField; // inputField変数をより広いスコープで宣言

    function showQuestion() {
        answered = false; // 新しい質問を表示する際に回答済みフラグをリセット

        let currentQuestion = quizData.list[currentQuestionIndex];

        const questionText = currentQuestion.question.replace(/\$\$(.*?)\$\$/g, (_, tex) => {
            return `<span class="mathjax">\\(${tex}\\)</span>`;
        });

        questionElement.innerHTML = questionText; // TeX 表記を含む質問を設定
        optionsElement.innerHTML = '';
        selectedOptionIndex = null; // 選択状態をリセット

        if (answerType === 'select') {
            // 選択式の場合
            const shuffledOptions = [...currentQuestion.options].sort(() => Math.random() - 0.5);
            shuffledOptions.forEach((option, index) => {
                const button = document.createElement('button');
                button.textContent = `${index + 1}: ${option}`; // 選択肢に番号を付ける
                button.classList.add('option-button');
                button.style.padding = '10px 20px';
                button.style.fontSize = '1.5rem';
                button.dataset.index = index; // インデックスをデータ属性に保存
                optionsElement.appendChild(button);

                // ボタンのクリックイベント
                button.addEventListener('click', () => {
                    checkAnswer(button, option, currentQuestion.answer);
                });
            });
        } else if (answerType === 'input') {
            // 入力式の場合
            inputField = document.createElement('input'); // ここでinputFieldを初期化
            inputField.type = 'text';
            inputField.id = 'answer-input';
            inputField.style.fontSize = '1.5rem';
            optionsElement.appendChild(inputField);

            inputField.focus(); // 入力フィールドにフォーカスを当てる

            // 入力イベントで正答のみ判定
            const handleInput = () => {
                const userAnswer = inputField.value.trim();
                if (subject === 'math') {
                    MathJax.typesetPromise()
                        .then(() => console.log('MathJax のレンダリングが完了しました'))
                        .catch((err) => console.error('MathJax のレンダリングに失敗しました:', err));
                }
                if (userAnswer === currentQuestion.answer) {
                    checkAnswer(null, userAnswer, currentQuestion.answer);
                    inputField.removeEventListener('input', handleInput); // イベントリスナーを削除
                }
            };

            inputField.addEventListener('input', handleInput);

            if (subject === 'math') {
                showKeyboard(); // キーボードを表示
            }

            // Enterキーで次の質問に進む
            inputField.addEventListener('keydown', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault(); // デフォルトのEnterキーの動作を防止
                    if (nextButton.style.display === 'block') {
                        nextButton.click(); // 次の質問ボタンをクリック
                    }
                }
            });
        }

        // MathJax を再レンダリング
        if (window.MathJax) {
            MathJax.typesetPromise()
                .then(() => console.log('MathJax のレンダリングが完了しました'))
                .catch((err) => console.error('MathJax のレンダリングに失敗しました:', err));
        }

        // キーボードイベントで選択肢を選ぶ
        document.addEventListener('keydown', handleKeyPress);
    }

    function handleKeyPress(event) {
        const optionButtons = document.querySelectorAll('.option-button');
        if (event.key === 'Enter' && answered) {
            nextButton.click(); // 回答済みの場合は次の質問へ
        } else if (answerType === 'select') {
            if (event.key >= '1' && event.key <= String(optionButtons.length)) {
                const index = parseInt(event.key) - 1;
                if (optionButtons[index]) {
                    optionButtons[index].click();
                }
            }
        } else if (event.key === 'Enter' && inputField) {
            checkAnswer(null, inputField.value.trim(), quizData.list[currentQuestionIndex].answer);
        }
    }

    function checkAnswer(selectedButton, selectedOption, correctAnswer) {
        if (answered) return; // すでに回答済みの場合は何もしない
        answered = true; // 回答済みフラグを設定

        let formatAnswer = correctAnswer;

        if (answerType === 'select') {
            selectedButton.style.backgroundColor = '#b64300'; // 選択したボタンの色を変更
            selectedButton.style.color = '#fff'; // 選択したボタンの文字色を変更

            if (selectedOption === correctAnswer) {
                resultElement.textContent = '正解！';
                score++;
                selectedButton.style.backgroundColor = '#4CAF50'; // 正解の色
                selectedButton.style.color = '#fff'; // 正解の文字色
            } else {
                if (subject === 'math') {
                    formatAnswer = formatLatex(correctAnswer);
                }
                resultElement.innerHTML = `不正解。正解は <span style="color: #4CAF50; font-size:1.2rem;" class="mathjax">${formatAnswer}</span> です。`;
            }
            // 選択肢ボタンを無効にする
            document.querySelectorAll('.option-button').forEach(button => {
                button.disabled = true;
            });
        } else if (answerType === 'input') {
            if (selectedOption === correctAnswer) {
                resultElement.textContent = '正解！';
                score++;
            } else {
                if (subject === 'math') {
                    formatAnswer = formatLatex(correctAnswer);
                }
                resultElement.innerHTML = `不正解。正解は <span style="color: #4CAF50; font-size:1.2rem;" class="mathjax">${formatAnswer}</span> です。`;
            }
            // 入力フィールドを無効にする
            if (inputField) {
                inputField.disabled = true;
            }
            if (subject === 'math') {
                MathJax.typesetPromise()
                    .then(() => console.log('MathJax のレンダリングが完了しました'))
                    .catch((err) => console.error('MathJax のレンダリングに失敗しました:', err));

                resultElement.style.display = 'flex';
                hideKeyboard(); // キーボードを非表示
            }
        }

        resultElement.style.display = 'block';
        nextButton.style.display = 'block';
    }

    nextButton.addEventListener('click', () => {
        currentQuestionIndex++;
        if (currentQuestionIndex < quizData.list.length) {
            resultElement.textContent = '';
            nextButton.style.display = 'none';
            showQuestion();
        } else {
            document.removeEventListener('keydown', handleKeyPress); // キーボードイベントを解除

            // クイズ終了時のボタン設定
            const endTime = Date.now(); // クイズ終了時刻を記録
            const elapsedTime = Math.floor((endTime - startTime) / 1000); // 経過時間を秒単位で計算

            // クイズ終了時のボタン設定
            quizContainer.innerHTML = `
                <h2>クイズ終了！</h2>
                <p>あなたのスコアは <span style="color: #b64300; font-size:1.5rem;">${score}</span> 
                <span style="font-size:1.2rem;">/ ${quizData.list.length}</span> です。</p>
                <p>クリア時間: <span style="font-size:1.5rem;">${elapsedTime}秒</span></p>
                <button id="restart-button">[R] もう一度挑戦</button>
                <button id="setting-button">[S] 設定へ戻る</button>
                <button id="back-button">[B] 戻る</button>
            `;

            // スコアに応じて花火を表示
            let confettiInterval;
            if (score === quizData.list.length) {
                const scoreElement = document.querySelector('span[style*="color: #b64300"]');
                if (scoreElement) {
                    const rect = scoreElement.getBoundingClientRect();
                    const origin = {
                        x: (rect.left + rect.width / 2) / window.innerWidth,
                        y: (rect.top + rect.height / 2) / window.innerHeight,
                    };

                    confettiInterval = setInterval(() => {
                        confetti({
                            particleCount: 100,
                            spread: 70,
                            origin: origin,
                        });
                    }, 200);
                    setTimeout(() => {
                        clearInterval(confettiInterval);
                    }, 1000);
                }
            }

            const restartButton = document.getElementById('restart-button');
            const settingButton = document.getElementById('setting-button');
            const backButton = document.getElementById('back-button');

            const handleClick = (button, action) => {
                if (button) {
                    button.addEventListener('click', action);
                }
            };

            handleClick(restartButton, () => {
                if (restartData) {
                    startQuiz(restartData.quizData, restartData.answerType); // 回答形式を渡す
                }
            });
            handleClick(settingButton, () => setupQuizSettings(allData));
            handleClick(backButton, () => window.location.href = `../genre/`);

            function removeResultButtons() {
                if (restartButton) restartButton.remove();
                if (settingButton) settingButton.remove();
                if (backButton) backButton.remove();
                document.removeEventListener('keydown', handleResultKeyPress);
            }

            const handleResultKeyPress = (event) => {
                switch (event.key) {
                    case 'r':
                        restartButton?.click();
                        removeResultButtons();
                        break;
                    case 's':
                        settingButton?.click();
                        removeResultButtons();
                        break;
                    case 'b':
                        backButton?.click();
                        removeResultButtons();
                        break;
                }
            };

            document.addEventListener('keydown', handleResultKeyPress);
        }
    });
    showQuestion();
}