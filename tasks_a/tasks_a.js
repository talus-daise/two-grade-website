// Supabase ライブラリをインポート
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Supabase 設定
const supabaseUrl = "https://mgsbwkidyxmicbacqeeh.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1nc2J3a2lkeXhtaWNiYWNxZWVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk5NDA0MjIsImV4cCI6MjA1NTUxNjQyMn0.fNkFQykD9ezBirtJM_fOB7XEIlGU1ZFoejCgrYObElg";

const supabase = createClient(supabaseUrl, supabaseKey);

// フォーム送信処理
document.getElementById("taskForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const title = document.getElementById("title").value;
    const deadline = document.getElementById("deadline").value;
    const description = document.getElementById("description").value;
    const notes = document.getElementById("notes").value;

    const { error } = await supabase.from("tasks-a").insert([{ title, deadline, description, notes }]);

    if (error) {
        console.error("データ送信エラー:", error);
        return;
    }

    document.getElementById("taskForm").reset();
    loadTasks();
});

// Supabase からデータを取得して表に表示
async function loadTasks() {
    const { data, error } = await supabase
        .from("tasks-a")
        .select("*, id")
        .order("deadline", { ascending: true });

    if (error) {
        console.error("データ取得エラー:", error);
        return;
    }

    const tableBody = document.getElementById("taskTable");
    tableBody.innerHTML = "";
    const now = new Date();
    
    for (const task of data) {
        const deadlineDate = new Date(task.deadline);
        const row = document.createElement("tr");
        row.innerHTML = `<td>${task.title}</td>
                         <td>${task.deadline}</td>
                         <td>${task.description}</td>
                         <td>${task.notes}</td>`;
        
        // 期限切れのタスクは赤くする
        if (deadlineDate < now) {
            row.style.color = "red";
        }
        
        tableBody.appendChild(row);

        // 期限が1週間以上過ぎたタスクを削除
        if ((now - deadlineDate) / (1000 * 60 * 60 * 24) > 7) {
            await supabase.from("tasks-a").delete().eq("id", task.id);
        }
    }
}

loadTasks();

window.addEventListener('beforeunload', function (event) {
    event.preventDefault() // (1)
    event.returnValue = '' // (2)
  })
  