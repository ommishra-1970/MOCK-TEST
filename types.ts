export enum Subject {
  PhysicalScience = "Physical Science",
  LifeScience = "Life Science"
}

export enum QuestionType {
  MCQ = "MCQ",
  Subjective = "Subjective"
}

export interface MCQOption {
  label: string; // A, B, C, D
  text: string;
}

export interface MCQQuestion {
  id: string;
  questionNumber: number;
  questionText: string;
  options: MCQOption[];
  correctOption: string; // For answer key
  subject: Subject;
}

export interface SubjectiveQuestion {
  id: string;
  questionNumber: number;
  questionText: string;
  marks: number;
  hasInternalChoice: boolean;
  alternativeQuestionText?: string; // The "OR" question
  subject: Subject;
}

export interface QuestionPaper {
  title: string;
  year: string;
  set: string;
  fullMarks: number;
  time: string;
  sectionA: {
    physicalScience: MCQQuestion[];
    lifeScience: MCQQuestion[];
  };
  sectionB: {
    physicalScience: SubjectiveQuestion[];
    lifeScience: SubjectiveQuestion[];
  };
}

export interface GeneratorConfig {
  difficultyDistribution: {
    easy: number;
    moderate: number;
    difficult: number;
  };
  bloomDistribution: {
    knowledge: number;
    comprehension: number;
    application: number;
    evaluation: number;
  };
}