
import { TutorProfile, Subject, DeliveryMode, VerificationStatus, Parent, Lesson, TaskType, Session, SessionStatus, Submission, PerformanceMetric, BlockType, AccountStatus } from './types';

export const MOCK_PARENT: Parent = {
  id: '',
  name: '',
  email: '',
  status: AccountStatus.ACTIVE,
  learners: [], 
  enrollments: []
};

export const MOCK_LEARNERS: any[] = [];

export const MOCK_PERFORMANCE: PerformanceMetric[] = [];

export const MOCK_LESSONS: Lesson[] = [];

export const MOCK_SESSIONS: Session[] = [];

export const MOCK_SUBMISSIONS: Submission[] = [];

export const MOCK_TUTORS: TutorProfile[] = [];

// --- STANDARD ACADEMIC DATA ---

export const STANDARD_GRADES = [
    "Early Years (Pre-Nursery & Nursery)",
    "Reception (Kindergarten)",
    "Grade 1 (Primary 1)",
    "Grade 2 (Primary 2)",
    "Grade 3 (Primary 3)",
    "Grade 4 (Primary 4)",
    "Grade 5 (Primary 5)",
    "Grade 6 (Primary 6)",
    "JSS 1 (Grade 7 / Year 7)",
    "JSS 2 (Grade 8 / Year 8)",
    "JSS 3 (Grade 9 / Year 9)",
    "SSS 1 (Grade 10 / Year 10)",
    "SSS 2 (Grade 11 / Year 11)",
    "SSS 3 (Grade 12 / Year 12)",
    "A-Levels / Foundation",
    "University / Adult"
];

export const STANDARD_TEACHING_STYLES = [
    "Direct Instruction", 
    "Socratic & Inquiry-Based", 
    "Game-Based Learning", 
    "Personalized Coaching", 
    "Project-Based Learning", 
    "Montessori",
    "Reggio Emilia",
    "Waldorf",
    "Harkness Method",
    "Flipped Classroom"
];

export const GLOBAL_CURRICULA = [
    // International
    "General Standard",
    "Cambridge International (CIE / IGCSE / O-Level)",
    "Cambridge International (A-Level)",
    "International Baccalaureate (IB - PYP/MYP/DP)",
    "US Common Core",
    "UK National Curriculum",
    "Montessori Method",
    "STEM / STEAM Focused",
    
    // West Africa
    "West African (WAEC / WASSCE)",
    "Nigeria (NERDC / NECO)",
    "Ghana (GES / NaCCA)",
    "Sierra Leone (NPSW / WASSCE)",
    "The Gambia (GABECE / WASSCE)",
    "Liberia (WAEC)",

    // Southern Africa
    "South Africa (CAPS)",
    "South Africa (IEB)",
    "Zimbabwe (ZIMSEC)",
    "Zambia (ECZ)",
    "Namibia (NSSC)",
    "Botswana (BGCSE)",

    // East Africa
    "Kenya (CBC - Competency Based Curriculum)",
    "Kenya (8-4-4 System)",
    "Uganda (UNEB)",
    "Tanzania (NECTA)",
    "Rwanda (REB)",

    // Other
    "Ethiopia (General Education)",
    "French National (Lycée/Baccalauréat)"
];

export const PRIORITY_SUBJECTS = [
    "Mathematics", "English Language", "Physics", "Chemistry", "Biology", 
    "Coding & Robotics", "Economics", "French", "Kiswahili", "Business Studies"
];

// --- LANGUAGES ---
export const POPULAR_LANGUAGES = [
    // Global / Colonial
    "English", "French", "Portuguese", "Arabic", "Spanish", "German", "Mandarin",
    // West Africa
    "Yoruba", "Igbo", "Hausa", "Pidgin English", "Twi", "Wolof", "Ewe", "Ga",
    // East Africa
    "Swahili", "Amharic", "Somali", "Oromo", "Tigrinya", "Luganda", "Kinyarwanda",
    // South Africa
    "Zulu", "Xhosa", "Afrikaans", "Sotho", "Tswana", "Venda", "Shona"
].sort();

// Subject Lists
const EARLY_YEARS_SUBJECTS = [
    "Numeracy", "Literacy", "Phonics", "Understanding the World", 
    "Expressive Arts & Design", "Social & Emotional Development", 
    "Communication & Language", "Handwriting"
];

const PRIMARY_SUBJECTS = [
    "Mathematics", "English Language", "Basic Science", "Social Studies", 
    "Verbal Reasoning", "Quantitative Reasoning", "Vocational Aptitude",
    "Creative Arts", "ICT / Computer Studies", "French", "Religious Knowledge", 
    "Civic Education", "Home Economics", "Local Language"
];

const JUNIOR_SECONDARY_SUBJECTS = [
    "Mathematics", "English Studies", "Basic Science", "Basic Technology", 
    "Business Studies", "Civic Education", "Social Studies", "Agricultural Science", 
    "Computer Studies", "Home Economics", "French", "Physical & Health Education", 
    "Cultural & Creative Arts", "Religious Studies", "Local Language"
];

const SENIOR_SECONDARY_SUBJECTS = [
    "Mathematics", "English Language", "Physics", "Chemistry", "Biology", 
    "Economics", "Government", "Literature-in-English", "Geography", "History",
    "Financial Accounting", "Commerce", "Further Mathematics", "Technical Drawing", 
    "Agricultural Science", "Food & Nutrition", "Data Processing", 
    "Civic Education", "Fishery", "Marketing", "Christian Religious Studies",
    "Islamic Religious Studies", "Visual Arts"
];

const GENERAL_SUBJECTS = Array.from(new Set([
    ...PRIMARY_SUBJECTS, 
    ...SENIOR_SECONDARY_SUBJECTS,
    "Coding & Robotics", "Music", "Foreign Languages", "Chess", "Entrepreneurship"
])).sort();

export const getSubjectsForGrade = (grade: string): string[] => {
    if (!grade) return GENERAL_SUBJECTS; 
    
    const normalized = grade.toLowerCase();
    
    // Early Years / Kindergarten
    if (normalized.includes('early years') || normalized.includes('nursery') || normalized.includes('kindergarten') || normalized.includes('reception')) {
        return EARLY_YEARS_SUBJECTS;
    }
    
    // Primary (Grades 1-6)
    if (normalized.includes('primary') || normalized.includes('grade 1') || normalized.includes('grade 2') || normalized.includes('grade 3') || normalized.includes('grade 4') || normalized.includes('grade 5') || normalized.includes('grade 6')) {
        return PRIMARY_SUBJECTS;
    }

    // Junior Secondary (JSS 1-3 / Grades 7-9)
    if (normalized.includes('jss') || normalized.includes('grade 7') || normalized.includes('grade 8') || normalized.includes('grade 9') || normalized.includes('year 7') || normalized.includes('year 8') || normalized.includes('year 9')) {
        return JUNIOR_SECONDARY_SUBJECTS;
    }

    // Senior Secondary (SSS 1-3 / Grades 10-12)
    if (normalized.includes('sss') || normalized.includes('grade 10') || normalized.includes('grade 11') || normalized.includes('grade 12') || normalized.includes('year 10') || normalized.includes('year 11') || normalized.includes('year 12')) {
        return SENIOR_SECONDARY_SUBJECTS;
    }

    // Advanced / Other
    return SENIOR_SECONDARY_SUBJECTS; // Default to senior subjects for A-levels/Uni
};
