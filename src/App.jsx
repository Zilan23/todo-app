import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";

import {
  signInWithPopup,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

import { db, auth, provider } from "./firebase";
import "./App.css";

import {
  FaTrash,
  FaEdit,
  FaMoon,
  FaSun,
} from "react-icons/fa";

function App() {
  const [user, setUser] = useState(null);
  const [task, setTask] = useState("");
  const [tasks, setTasks] = useState([]);
  const [filter, setFilter] = useState("all");
  const [editId, setEditId] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  const tasksRef = collection(db, "tasks");

  // 🔐 AUTH
  useEffect(() => {
    return onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  // 🔥 FIRESTORE
  useEffect(() => {
    const unsub = onSnapshot(tasksRef, (snap) => {
      setTasks(
        snap.docs.map((d) => ({ id: d.id, ...d.data() }))
      );
    });

    return () => unsub();
  }, []);

  // 🔐 LOGIN
  async function login() {
    await signInWithPopup(auth, provider);
  }

  // 🚪 LOGOUT
  async function logout() {
    await signOut(auth);
  }

  // ➕ ADD / EDIT
  async function addTask() {
    if (task.trim() === "") return;

    const value = task;
    setTask("");

    if (editId) {
      await updateDoc(doc(db, "tasks", editId), {
        text: value,
      });
      setEditId(null);
    } else {
      await addDoc(tasksRef, {
        text: value,
        completed: false,
        uid: user.uid,
      });
    }
  }

  // ❌ DELETE
  async function deleteTask(id) {
    await deleteDoc(doc(db, "tasks", id));
  }

  // ✔ TOGGLE
  async function toggleComplete(item) {
    await updateDoc(doc(db, "tasks", item.id), {
      completed: !item.completed,
    });
  }

  // ✏ EDIT
  function startEdit(item) {
    setTask(item.text);
    setEditId(item.id);
  }

  // 🔥 USER TASKS
  const userTasks = tasks.filter((t) => t.uid === user?.uid);

  // 🔥 FILTER
  const filteredTasks = userTasks.filter((t) => {
    if (filter === "all") return true;
    if (filter === "active") return !t.completed;
    if (filter === "done") return t.completed;
  });

  // 🔢 COUNTER
  const remaining = userTasks.filter((t) => !t.completed).length;

  // 🔄 DRAG (⬆⬇ swap)
  function move(index, dir) {
    const arr = [...userTasks];
    const target = index + dir;

    if (target < 0 || target >= arr.length) return;

    const temp = arr[index];
    arr[index] = arr[target];
    arr[target] = temp;

    setTasks([
      ...tasks.filter((t) => t.uid !== user.uid),
      ...arr,
    ]);
  }

  return (
    <div className={darkMode ? "container dark" : "container"}>
      <h1>🔥 Firebase Todo App</h1>

      {/* LOGIN */}
      {!user ? (
        <button onClick={login}>🔐 Google Login</button>
      ) : (
        <div>
          <p>👋 {user.displayName}</p>
          <button onClick={logout}>🚪 Logout</button>
        </div>
      )}

      {/* APP */}
      {user && (
        <>
          {/* DARK MODE */}
          <button onClick={() => setDarkMode(!darkMode)}>
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>

          {/* COUNTER */}
          <p>Kalan görev: <b>{remaining}</b></p>

          {/* INPUT */}
          <input
            value={task}
            onChange={(e) => setTask(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTask()}
            placeholder="Görev yaz..."
          />

          <button onClick={addTask}>
            {editId ? "Güncelle" : "Ekle"}
          </button>

          {/* FILTER */}
          <div>
            <button onClick={() => setFilter("all")}>Tümü</button>
            <button onClick={() => setFilter("active")}>Aktif</button>
            <button onClick={() => setFilter("done")}>Tamamlanan</button>
          </div>

          {/* LIST */}
          <ul>
            {filteredTasks.map((item, index) => (
              <li key={item.id} className="task-item">

                <span
                  onClick={() => toggleComplete(item)}
                  style={{
                    textDecoration: item.completed
                      ? "line-through"
                      : "none",
                    cursor: "pointer",
                  }}
                >
                  {item.text}
                </span>

                <div>
                  <button onClick={() => move(index, -1)}>⬆</button>
                  <button onClick={() => move(index, 1)}>⬇</button>

                  <button onClick={() => startEdit(item)}>
                    <FaEdit />
                  </button>

                  <button onClick={() => deleteTask(item.id)}>
                    <FaTrash />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

export default App;