// questionGenerator.js

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function formatLatex(expr) {
    return "$$" + expr
        .replace(/√(\d+)/g, '\\sqrt{$1}') // √の後に数字が続く場合
        .replace(/\*/g, '\\times')
        .replace(/\//g, '\\div')
        + "$$";
}

function formatFraction(expr) {
    return expr.replace(/(\d+) \/ (\d+)/g, '\\frac{$1}{$2}');
}

function calculate(a, op, b) {
    switch (op) {
        case '+': return a + b;
        case '-': return a - b;
        case '*': return a * b;
        case '/': return a / b;
    }
    throw new Error(`Invalid operator: ${op}`);
}

function generatePosAndNegEazy(patternType) {
    let a, b, c, d;
    let sign = pick(["", "-"]);
    let op1 = pick(["+", "-"]);
    let op2 = pick(["+", "-"]);
    let innerOp = pick(["*", "/"]);
    let left, right, inner;

    switch (patternType) {
        case 1:
            a = randomInt(-9, 9);
            b = randomInt(-9, 9);
            c = randomInt(-9, 9);
            d = randomInt(-9, 9);
            if (b < 0) b = `(${b})`;
            if (c < 0) c = `(${c})`;
            if (d < 0) d = `(${d})`;
            left = `(${a} ${op1} ${b})`;
            right = `(${c} ${op2} ${d})`;
            break;
        case 2:
            a = randomInt(-9, 9);
            b = randomInt(-9, 9);
            c = randomInt(-9, 9);
            d = randomInt(1, 9);
            if (b < 0) b = `(${b})`;
            if (d < 0) d = `(${d})`;
            inner = `(${c} ${innerOp} ${d})`;
            break;
        case 3:
            a = randomInt(-9, 9);
            b = randomInt(1, 9);
            c = randomInt(-9, 9);
            d = randomInt(-9, 9);
            if (b < 0) b = `(${b})`;
            if (c < 0) c = `(${c})`;
            if (d < 0) d = `(${d})`;
            inner = `(${a} ${innerOp} ${b})`;
            break;
    }

    try {
        let result;
        let question;

        if (patternType === 1) {
            const leftVal = calculate(a, op1, b);
            const rightVal = calculate(c, op2, d);
            const mainOp = pick(["*", "/"]);
            if (mainOp === "/" && (rightVal === 0 || leftVal % rightVal !== 0)) throw "invalid";
            result = calculate(sign === "-" ? -leftVal : leftVal, mainOp, rightVal);
            question = `${sign}${left} ${mainOp} ${right}`;
        } else if (patternType === 2) {
            const innerVal = calculate(c, innerOp, d);
            if (innerOp === "/" && c % d !== 0) throw "not int";
            result = calculate(calculate(a, op1, b), op2, innerVal);
            question = `${a} ${op1} ${b} ${op2} ${inner}`;
        } else {
            const innerVal = calculate(a, innerOp, b);
            if (innerOp === "/" && a % b !== 0) throw "not int";
            result = calculate(sign === "-" ? -innerVal : innerVal, op1, calculate(c, op2, d));
            question = `${sign}${inner} ${op1} ${c} ${op2} ${d}`;
        }

        let formatQuestion = formatLatex(question);

        if (!Number.isInteger(result)) throw "not int";

        return {
            question: formatQuestion,
            answer: String(result),
        };
    } catch (e) {
        console.error('問題生成に失敗しました', e);
        let newPatternType = pick([1, 2, 3]);
        return generatePosAndNegEazy(newPatternType);
    }
}

function generateRoot(patternType) {
    let a = randomInt(1, 9);
    let b = randomInt(1, 9);
    let c = randomInt(1, 9);
    let d = randomInt(1, 9);
    let e = randomInt(1, 9);
    let f = randomInt(1, 9);
    let frac1 = `${c} / ${d}`;
    let frac2 = `${e} / ${f}`;

    let sign = pick(["", "-"]);

    try {
        let result;
        let question;

        if (patternType === 1) {
            result = sign === '-' ? `-${a}` : `${a}`;
            question = `${sign}\\sqrt{${a * a}}`;
        } else if (patternType === 2) {
            result = `${sign}√${a * b}`;
            question = `${sign}\\sqrt{${a}} \\times \\sqrt{${b}}`;
        } else {
            result = `${sign}√${c * e} / ${d * f}`;
            question = `${sign}\\sqrt{${formatFraction(frac1)}} \\times \\sqrt{${formatFraction(frac2)}}`
        }

        if (a < 0 || b < 0 || c < 0 || d < 0) throw "not int";

        return {
            question: formatLatex(question),
            answer: String(result),
        };
    } catch (e) {
        console.error('問題生成に失敗しました', e);
        let newPatternType = pick([1, 2, 3]);
        return generateRoot(newPatternType);
    }
}

function generateOption(genre, answer) {
    let correct;
    let options;
    switch (genre) {
        case "正負の数(易)":
            // 従来の回答生成方法
            correct = parseInt(answer);
            options = new Set([correct]);
            while (options.size < 4) {
                options.add(correct + randomInt(-10, 10));
            }
        case "平方根":
            correct = answer;
            options = new Set([correct]);
            while (options.size < 4) {
                options.add(`\\sqrt{${randomInt(1, 30)}}`);
            }
    }

    return options;
}

function generateQuestion(genre) {
    const patternFunc = pick([1, 2, 3]);

    let result;
    let question;
    let answer;

    switch (genre) {
        case "正負の数(易)":
            result = generatePosAndNegEazy(patternFunc);
            question = result.question;
            answer = result.answer;
            break;
        case "平方根":
            result = generateRoot(patternFunc);
            question = result.question;
            answer = result.answer;
            break;
    }

    if (!question || !answer) {
        return {
            question: '問題生成に失敗しました',
            options: [],
            answer: null,
        };
    }

    const options = generateOption(genre, answer);

    const optionsArray = Array.from(options).map(String).sort(() => Math.random() - 0.5);

    return {
        question, options: optionsArray, answer
    };
}