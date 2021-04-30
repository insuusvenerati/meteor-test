import React, { useState } from "react";
import { useTracker } from "meteor/react-meteor-data";
import { Task } from "./Task";
import { TasksCollection } from "../db/TasksCollection";
import { TaskForm } from "./TaskForm";
import { Task as TaskType } from "../shared/types/Task";
import { Meteor } from "meteor/meteor";
import { LoginForm } from "./LoginForm";

const toggleChecked = ({ _id, isChecked }: TaskType) => {
  Meteor.call("tasks.setIsChecked", _id, !isChecked);
};

const deleteTask = ({ _id }: { _id: string }) =>
  Meteor.call("tasks.remove", _id);

export const App = () => {
  const user = useTracker(() => Meteor.user());
  const hideCompletedFilter = { isChecked: { $ne: true } };
  const userFilter = user ? { userId: user._id } : {};
  const pendingOnlyFilter = { ...hideCompletedFilter, ...userFilter };
  const [hideCompleted, setHideCompleted] = useState(false);

  const { tasks, pendingTasksCount, isLoading } = useTracker(() => {
    const noDataAvailable = { tasks: [], pendingTasksCount: 0 };
    if (!Meteor.user()) {
      return noDataAvailable;
    }
    const handler = Meteor.subscribe("tasks");

    if (!handler.ready()) {
      return { ...noDataAvailable, isLoading: true };
    }

    const tasks = TasksCollection.find(
      hideCompleted ? pendingOnlyFilter : userFilter,
      {
        sort: { createdAt: -1 },
      }
    ).fetch();
    const pendingTasksCount = TasksCollection.find(pendingOnlyFilter).count();

    return { tasks, pendingTasksCount };
  });

  const pendingTasksTitle = `${
    pendingTasksCount ? `(${pendingTasksCount})` : ""
  }`;

  const logout = () => Meteor.logout();

  return (
    <div className="app">
      <header>
        <div className="app-bar">
          <div className="app-header">
            <h1>
              📝️ To Do List
              {pendingTasksTitle}
            </h1>
          </div>
        </div>
      </header>

      <div className="main">
        {user ? (
          <>
            <div className="user" onClick={logout}>
              {user.username} 🚪
            </div>

            <TaskForm user={user} />

            <div className="filter">
              <button onClick={() => setHideCompleted(!hideCompleted)}>
                {hideCompleted ? "Show All" : "Hide Completed"}
              </button>
            </div>

            {isLoading && <div className="loading">loading...</div>}

            <ul className="tasks">
              {tasks.map((task) => (
                <Task
                  key={task._id}
                  task={task}
                  onCheckboxClick={toggleChecked}
                  onDeleteClick={deleteTask}
                />
              ))}
            </ul>
          </>
        ) : (
          <LoginForm />
        )}
      </div>
    </div>
  );
};
