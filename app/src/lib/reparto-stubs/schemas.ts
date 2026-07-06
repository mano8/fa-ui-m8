export type AssignmentProcessStatus =
  | "draft"
  | "ready_for_meeting"
  | "meeting_open"
  | "assigning"
  | "department_proposal"
  | "sent_to_school_leadership"
  | "returned_by_school_leadership"
  | "internal_revision"
  | "final"
  | "reopened"
  | "archived";

export type AssignmentProcessPublic = {
  id: string;
  academic_year_id: string;
  school_id: string;
  department_id: string;
  status: AssignmentProcessStatus;
  created_at: string;
  updated_at: string;
};

export type AssignmentProcessesPublic = {
  data: AssignmentProcessPublic[];
  count: number;
};

export type GlobalBalance = {
  total_required_hours: number;
  total_available_hours: number;
  total_assigned_hours: number;
  pending_required_hours: number;
  availability_difference: number;
  uncovered_requirements: number;
  overloaded_teachers: number;
  state: "balanced" | "pending" | "exceeded" | "warning";
};

export type ProcessSummary = {
  process_id: string;
  global_balance: GlobalBalance;
  validations: unknown[];
  current_turn: unknown | null;
  blocking_validation_count: number;
};

export type ProcessDashboard = ProcessSummary & {
  generated_at: string;
  teacher_balances: unknown[];
  requirement_balances: unknown[];
};

export type MeetingSessionPublic = {
  id: string;
  assignment_process_id: string;
  status: "prepared" | "open" | "selecting" | "paused" | "closed" | "reopened";
  created_at: string;
  updated_at: string;
};

export type MeetingSessionsPublic = {
  data: MeetingSessionPublic[];
  count: number;
};

export type TeacherLanSummary = ProcessSummary & {
  teacher_profile_id: string;
  process_teacher_id: string;
  generated_at: string;
};

export type ProcessVersionPublic = {
  id: string;
  assignment_process_id: string;
  version_number: number;
  status: AssignmentProcessStatus;
  created_at: string;
  updated_at: string;
};

export type ProcessVersionsPublic = {
  data: ProcessVersionPublic[];
  count: number;
};

export type ExportArtifactPublic = {
  id: string;
  assignment_process_id: string;
  export_type: "internal_draft" | "school_leadership" | "final" | "teacher_summary" | "backup";
  format: "pdf" | "csv" | "json";
  checksum: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export type ExportArtifactsPublic = {
  data: ExportArtifactPublic[];
  count: number;
};
