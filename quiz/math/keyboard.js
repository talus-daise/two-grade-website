function showKeyboard() {
    const keyboard = document.createElement("div");
    keyboard.id = "keyboard";
    keyboard.innerHTML = `
        <table>
            <tr>
                <td><button id="key" value="√">√</button></td>
                <td></td>
            </tr>
            <tr>
                <td><button id="key" value="1">1</button></td>
                <td><button id="key" value="2">2</button></td>
                <td><button id="key" value="3">3</button></td>
                <td><button id="key" value="+">+</button></td>
            </tr>
            <tr>
                <td><button id="key" value="4">4</button></td>
                <td><button id="key" value="5">5</button></td>
                <td><button id="key" value="6">6</button></td>
                <td><button id="key" value="-">-</button></td>
            </tr>
            <tr>
                <td><button id="key" value="7">7</button></td>
                <td><button id="key" value="8">8</button></td>
                <td><button id="key" value="9">9</button></td>
                <td><button id="key" value="*">*</button></td>
            </tr>
            <tr>
                <td><button id="key" value="0">0</button></td>
                <td><button id="key" value=".">.</button></td>
                <td><button id="key" value="C">C</button></td>
                <td><button id="key" value="/">/</button></td>
            </tr>
        </table>
            `;
    keyboard.style.position = "absolute";
    keyboard.style.bottom = "0";
    keyboard.style.left = "0";
    keyboard.style.backgroundColor = "#abe4d3";
    keyboard.style.padding = "10px";
    keyboard.style.borderRadius = "10px";
    keyboard.style.boxShadow = "0 0 10px rgba(0, 0, 0, 0.5)";
    keyboard.style.zIndex = "1000";

    document.body.appendChild(keyboard);

    document.querySelectorAll("#key").forEach(button => {
        button.addEventListener("click", keyboardButtonClick);
    });

    document.addEventListener("keydown", keyboardInput);
}

function keyboardButtonClick(event) {
    const value = event.target.value;
    const input = document.getElementById("answer-input");

    if (value === "C") {
        input.value = "";
    } else {
        input.value += value;
    }

    input.focus();
}

function keyboardInput(event) {
    switch (event.key) {
        case "r":
            event.preventDefault();
            keyboardButtonClick({ target: { value: "√" } });
            break;
    }
}

function hideKeyboard() {
    const keyboard = document.getElementById("keyboard");
    if (keyboard) {
        keyboard.remove();
    }
    document.removeEventListener("keydown", keyboardButtonClick);
    document.removeEventListener("keydown", keyboardInput);
}