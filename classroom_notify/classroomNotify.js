// Supabase ライブラリをインポート
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Supabase 設定
const supabaseUrl = "https://mgsbwkidyxmicbacqeeh.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nc2J3a2lkeXhtaWNiYWNxZWVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5NDA0MjIsImV4cCI6MjA1NTUxNjQyMn0.fNkFQykD9ezBirtJM_fOB7XEIlGU1ZFoejCgrYObElg";

const supabase = createClient(supabaseUrl, supabaseKey);

// Supabase からデータを取得して表に表示
async function loadTasks() {
    const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", {ascending : false})

    if (error) {
        console.error("データ取得エラー:", error);
        return;
    }

    const container = document.getElementById("notifyContainer");
    container.innerHTML = ""; // 既存のデータをクリア

    for (const task of data) {
        const createdAt = new Date(task.created_at).toLocaleString("ja-JP", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            second: "2-digit",
            hour12: false, // 24時間表記
        }).replace(/\//g, "-").replace(" ", " ");

        const formattedAnnouncement = task.announcement.replace(/。/g, "。<br>");

        const row = document.createElement("div");
        row.innerHTML = `<h2>${task.course_Name}</h2>
                         <small>${createdAt}</small>
                         <p>${formattedAnnouncement}</p>`;
        
        container.appendChild(row); // `tableBody` の代わりに `container` を使用
    }
}

loadTasks();
