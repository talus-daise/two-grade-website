function showCustomAlert(message, button) {
    const existingAlert = document.getElementById("custom-alert");
    if (existingAlert) existingAlert.remove();

    // カスタムアラートのコンテナ作成
    const alertContainer = document.createElement("div");
    Object.assign(alertContainer.style, {
        position: "fixed",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        padding: "20px",
        background: "#abc3ff",
        border: "2px solid #00134c",
        zIndex: "1000",
        boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
        borderRadius: "8px",
        textAlign: "center",
        opacity: "0",
        transition: "opacity 0.5s ease-in-out"
    });
    alertContainer.id = "custom-alert";

    // メッセージ表示用要素
    const messageElem = document.createElement("p");
    messageElem.innerText = message;
    messageElem.style.marginBottom = "15px";

    // OKボタン作成
    if (button) {
        const closeButton = document.createElement("button");
        Object.assign(closeButton.style, {
            padding: "5px 15px",
            cursor: "pointer",
            border: "1px solid #00134c",
            background: "#5787ff",
            color: "#00134c",
            borderRadius: "5px",
            boxShadow: "0px 0px 5px 1px rgba(0, 0, 0, 0.6)"
        });
        closeButton.innerText = "OK";
        closeButton.onclick = () => {
            alertContainer.style.opacity = "0";
            setTimeout(() => alertContainer.remove(), 500);
        };
    }

    // 要素を組み立てて追加
    alertContainer.append(messageElem, closeButton);
    document.body.appendChild(alertContainer);

    // 少し遅れてフェードイン
    setTimeout(() => alertContainer.style.opacity = "1", 10);
}

// **グローバルスコープに登録**
window.showCustomAlert = showCustomAlert;