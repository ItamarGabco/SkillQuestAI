"use client";

import { createContext, useContext, useState } from "react";

const ResumeSelectionContext = createContext(null);

export function ResumeSelectionProvider({ skills, children }) {
  const [selectedIds, setSelectedIds] = useState(() =>
    skills
      .filter((skill) => skill.knowledgeLevel !== null)
      .map((skill) => skill.id),
  );

  function toggleSkill(id) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  function selectAll() {
    setSelectedIds(skills.map((skill) => skill.id));
  }

  function clearSelection() {
    setSelectedIds([]);
  }

  return (
    <ResumeSelectionContext.Provider
      value={{
        selectedIds,
        toggleSkill,
        selectAll,
        clearSelection,
      }}
    >
      {children}
    </ResumeSelectionContext.Provider>
  );
}

export function useResumeSelection() {
  const context = useContext(ResumeSelectionContext);

  if (!context) {
    throw new Error(
      "useResumeSelection must be used inside ResumeSelectionProvider",
    );
  }

  return context;
}
