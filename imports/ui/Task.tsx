import React from "react";
import { Task as TaskType } from "../shared/types/Task";

type Props = {
  task: TaskType;
  onCheckboxClick: (task: TaskType) => void;
};

export const Task = ({ task, onCheckboxClick, onDeleteClick }: Props) => {
  return (
    <li>
      <input
        type="checkbox"
        checked={!!task.isChecked}
        onClick={() => onCheckboxClick(task)}
        readOnly
      />
      <span> {task.text} </span>
      <button onClick={() => onDeleteClick(task)}>&times;</button>
    </li>
  );
};
