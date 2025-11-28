import { GoogleGenAI, Type, Schema } from "@google/genai";
import { SYLLABUS_CONTEXT } from "../constants";
import { QuestionPaper } from "../types";

const mcqSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    questionNumber: { type: Type.INTEGER },
    questionText: { type: Type.STRING },
    options: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          label: { type: Type.STRING },
          text: { type: Type.STRING },
        },
      },
    },
    correctOption: { type: Type.STRING },
    subject: { type: Type.STRING, enum: ["Physical Science", "Life Science"] },
  },
  required: ["questionNumber", "questionText", "options", "correctOption", "subject"],
};

const subjectiveSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    id: { type: Type.STRING },
    questionNumber: { type: Type.INTEGER },
    questionText: { type: Type.STRING },
    marks: { type: Type.INTEGER },
    hasInternalChoice: { type: Type.BOOLEAN },
    alternativeQuestionText: { type: Type.STRING },
    subject: { type: Type.STRING, enum: ["Physical Science", "Life Science"] },
  },
  required: ["questionNumber", "questionText", "marks", "hasInternalChoice", "subject"],
};

const paperSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    fullMarks: { type: Type.INTEGER },
    time: { type: Type.STRING },
    sectionA: {
      type: Type.OBJECT,
      properties: {
        physicalScience: {
          type: Type.ARRAY,
          items: mcqSchema,
        },
        lifeScience: {
          type: Type.ARRAY,
          items: mcqSchema,
        },
      },
    },
    sectionB: {
      type: Type.OBJECT,
      properties: {
        physicalScience: {
          type: Type.ARRAY,
          items: subjectiveSchema,
        },
        lifeScience: {
          type: Type.ARRAY,
          items: subjectiveSchema,
        },
      },
    },
  },
};

export const generateMockTest = async (year: string, set: string): Promise<QuestionPaper> => {
  // Initialize inside the function to support dynamic API keys (e.g. from window.aistudio selection)
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key is missing");
  }
  const ai = new GoogleGenAI({ apiKey: apiKey });

  const prompt = `
    ${SYLLABUS_CONTEXT}

    Create a comprehensive Mock Test Question Paper for **Class-X (HSC) Pre-Board Examination**.
    
    Strict Requirements:
    1. **Language**: The entire content MUST be in ODIA language script.
    2. **Year**: The exam year is **${year}**.
    3. **Title**: "Class-X (HSC) Pre-Board Examination".
    4. **Time**: "2 Hours 30 Minutes".
    5. **Section A (Objective)**:
       - Generate exactly 25 MCQs for Physical Science (Q1-Q25).
       - Generate exactly 25 MCQs for Life Science (Q26-Q50).
       - **COMPETENCY RULE**: At least 50% of these questions must be competency-based. These should be longer, scenario-based, or involve critical thinking, not just direct recall. Make the options detailed where necessary.
    6. **Section B (Subjective)**:
       - Physical Science (25 marks):
         * 4 questions of 2 marks each (Internal OR choice).
         * 3 questions of 3 marks each (Internal OR choice).
         * 2 questions of 4 marks each (Internal OR choice).
       - Life Science (25 marks):
         * 4 questions of 2 marks each (Internal OR choice).
         * 3 questions of 3 marks each (Internal OR choice).
         * 2 questions of 4 marks each (Internal OR choice).
       - **MIXED CHAPTER RULE**: For every subjective question with an internal "OR" choice, the alternative question MUST be from a DIFFERENT chapter than the main question to test broader knowledge.
    
    Ensure the difficulty level is balanced as requested (25% Easy, 50% Moderate, 25% Difficult).
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: paperSchema,
        temperature: 0.5, 
      },
    });

    const jsonText = response.text;
    if (!jsonText) throw new Error("No response from AI");
    
    const parsedData = JSON.parse(jsonText);
    // Inject the year and set manually since we control them
    return {
      ...parsedData,
      year: year,
      set: set
    } as QuestionPaper;
  } catch (error) {
    console.error("Error generating question paper:", error);
    throw error;
  }
};