'use client'
import { useState, useEffect } from "react";
import TodoForm from "./todoForm";
import TodoList from "./todoList";

export default function TodoPage() {
  const [todos, setTodos] = useState([]);

  useEffect(() => {
    window.todo.get().then(setTodos);
  }, [])

  const addTodo = async (todo) => {
    const newTodo = await window.todo.create(todo);
    console.log(newTodo)
    setTodos([...todos, newTodo]);
  };

  const deleteTodo = async (id) => {
    await window.todo.delete(id);
    setTodos(todos.filter((todo) => todo.id !== id));
  };

  const toggleStatus = async (id) => {
    const todo = todos.find((tdo) => tdo.id === id);
    todo.status = todo.status === "Pending" ? "Completed" : "Pending"
    const updatedTodo = await window.todo.update(id, todo) 
    setTodos(
      todos.map((todo) =>
        todo.id === id
          ? { ...todo, status: updatedTodo.status }
          : todo
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 p-5">
      <h1 className="text-3xl font-bold text-center mb-6">To-Do App</h1>
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
        <TodoForm addTodo={addTodo} />
        <TodoList todos={todos} deleteTodo={deleteTodo} toggleStatus={toggleStatus} />
      </div>
    </div>
  );
}
