export default function TodoList({ todos, deleteTodo, toggleStatus }) {
  return (
    <div className="mt-6 space-y-4">
      {todos.map((todo) => (
        <div
          key={todo.id}
          className="flex items-center justify-between p-4 bg-gray-100 rounded-lg shadow-sm"
        >
          <div>
            <h3 className="text-lg font-semibold">{todo.title}</h3>
            <p className="text-sm text-gray-600">{todo.description}</p>
          </div>
          <div className="flex items-center space-x-3">
            <span
              className={`text-sm font-medium px-2 py-1 rounded-lg ${
                todo.status === "Completed"
                  ? "bg-green-200 text-green-800"
                  : "bg-yellow-200 text-yellow-800"
              }`}
            >
              {todo.status}
            </span>
            <button
              onClick={() => toggleStatus(todo.id)}
              className="bg-blue-500 text-white px-3 py-1 rounded-lg hover:bg-blue-600"
            >
              Change Status
            </button>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="text-red-600 font-semibold hover:underline"
            >
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
