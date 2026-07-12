// Static UI config for the practice/question views.
// Live question data is fetched in QuestionExplorer via GET /api/problems/all.

export const QUESTION_TABS = ["All"];

export const DIFFICULTY_OPTIONS = ["All", "easy", "medium", "hard"];
export const STATUS_OPTIONS = ["All", "Solved", "Unsolved"];
export const DATASET_OPTIONS = ["All"];

export const SOLVED_EXAMPLES = [
  { icon: "Database", tint: "bg-violet-100 text-brand", title: "Nth Highest Salary", sub: "Window Functions", time: "12 min" },
  { icon: "Settings", tint: "bg-emerald-100 text-emerald-600", title: "Find Duplicate Records", sub: "Self Join", time: "8 min" },
  { icon: "MessageSquare", tint: "bg-sky-100 text-sky-600", title: "Running Total by Date", sub: "Window Functions", time: "10 min" },
  { icon: "Star", tint: "bg-orange-100 text-carrot", title: "Customers With No Orders", sub: "Joins", time: "9 min" },
];
