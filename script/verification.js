const names = [
    "相田悠乃介", "石川眞帆", "石田晴大", "石原遼門", "市川聡真", "稲田光孝", "井村百花", "岩田樹弥", "岩淵由真", "岩本祥一郎",
    "薄井圭護", "小曽納璃佳", "河野蒼士", "久保田淳斗", "小泉裕貴", "小林蒼依", "小林史佳", "小林拓海", "坂井敬伍", "佐々木和義",
    "篠崎咲良", "清水玲菜", "白土咲恵", "杉本桔花", "菅田悠暉", "堂田有紗", "飛田愼也", "戸間替咲希", "野尻裕貴", "野中美遥",
    "芳賀かえで", "廣瀬太一", "二川ひなた", "古川陽菜", "星音羽", "松嶋隼士", "松本優菜", "八木優歌", "安川愛菜", "山本朱璃",
    "相田和", "青山ひかり", "有馬暁都", "安藤陸", "飯塚悠仁", "飯村和香", "石川陽菜", "伊藤希", "岩島綾子", "江幡遥人",
    "小國丈太朗", "菊池顕広", "木津碧咲", "木許咲希", "黒澤遼", "西城奈那", "佐川慶一郎", "清水和奏", "志村拓真", "鈴木将弘",
    "田口翔清", "武田証", "田村孝太", "塚田旭", "ドカン", "直井大和", "中里ゆり奈", "坂東すずな", "人見桜子", "福田翼",
    "船尾帆夏", "古川陽菜", "松井由愛", "森啓惺", "森山心愛", "山口陽花", "山下真歩", "山田優希", "山本悠二朗", "渡辺太造"
];

const /script/verificationKey = "/script/verification";

function check/script/verification() {
    const verified = localStorage.getItem(/script/verificationKey) === "true" ? true : false;

    if (verified) return;

    const alertBackground = document.createElement("div");
    alertBackground.id = "custom-alert-background";
    Object.assign(alertBackground.style, {
        position: "fixed", zIndex: "1001", background: "#000", top: "0", left: "0",
        width: "100%", height: "100%", opacity: "0", transition: "opacity 0.5s ease-in-out"
    });

    const alertContainer = document.createElement("div");
    alertContainer.id = "custom-alert";
    Object.assign(alertContainer.style, {
        position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        padding: "20px", background: "#abc3ff", border: "2px solid #00134c", zIndex: "1002",
        boxShadow: "0px 4px 10px rgba(0,0,0,0.2)", borderRadius: "8px", textAlign: "center", opacity: "0",
        transition: "opacity 0.5s ease-in-out"
    });

    const messageHead = document.createElement("h3")
    messageHead.innerText = "認証"

    const messageElem = document.createElement("p");
    messageElem.innerText = "プライバシーの面から名前の入力をお願いします\n一度入力した場合は、もう一度入力してもらい、連絡していただけると助かります。\nなお、違う端末で開いた場合は再度入力になることがあります";
    messageElem.style.marginBottom = "15px";

    const nameBox = document.createElement("input");
    nameBox.id = "question-name";
    nameBox.type = "text";

    const closeButton = document.createElement("button");
    closeButton.innerText = "OK";
    Object.assign(closeButton.style, {
        padding: "5px 15px", cursor: "pointer", border: "1px solid #00134c",
        background: "#5787ff", color: "#00134c", borderRadius: "5px",
        boxShadow: "0px 0px 5px 1px rgba(0, 0, 0, 0.6)"
    });
    closeButton.onclick = () => {
        alertContainer.style.opacity = "0";
        const clientName = nameBox.value;
        const isValid = names.includes(clientName);
        localStorage.removeItem(/script/verificationKey);
        localStorage.setItem(/script/verificationKey, isValid);
        setTimeout(() => alertBackground.remove(), 500);
        let clientUrl = window.location.pathname;
        window.location.pathname = isValid ? clientUrl : "caution.html";
    };

    alertContainer.append(messageHead, messageElem, nameBox, closeButton);
    alertBackground.appendChild(alertContainer);
    document.body.appendChild(alertBackground);

    setTimeout(() => {
        alertBackground.style.opacity = "1";
        alertContainer.style.opacity = "1";
    }, 10);
}

// Call the check/script/verification function
check/script/verification();
