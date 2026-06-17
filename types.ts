
export enum UserRole {
  PARENT = 'PARENT',
  TEACHER = 'TEACHER',
  CAREGIVER = 'CAREGIVER',
  ADMIN = 'ADMIN'
}

export enum AccountStatus {
    ACTIVE = 'ACTIVE',
    PENDING_ACTIVATION = 'PENDING_ACTIVATION', 
    SUSPENDED = 'SUSPENDED'
}

export enum Subject {
  MATHEMATICS = 'Mathematics',
  ENGLISH = 'English',
  SCIENCE = 'Science',
  PHYSICS = 'Physics',
  CODING = 'Coding',
  MUSIC = 'Music',
  ART = 'Art',
  ROBOTICS = 'Robotics',
  CHEMISTRY = 'Chemistry'
}

export enum DeliveryMode {
  ONE_ON_ONE = 'One-on-One',
  GROUP = 'Group',
  ONLINE = 'Online',
  IN_PERSON = 'In-Person'
}

export enum VerificationStatus {
  NONE = 'NONE',
  PENDING = 'PENDING',
  VERIFIED = 'VERIFIED'
}

export enum EnrollmentStatus {
  PENDING = 'Pending',
  ACTIVE = 'Active',
  PAUSED = 'Paused',
  CANCELLED = 'Cancelled',
  COMPLETED = 'Completed'
}

export enum TaskType {
  MCQ = 'MCQ',
  SHORT_ANSWER = 'SHORT_ANSWER',
  FILE_UPLOAD = 'FILE_UPLOAD',
  ESSAY = 'ESSAY',
  CODING = 'CODING',
  SCENARIO = 'SCENARIO', 
  PROJECT = 'PROJECT',   
  AUDIO_RESPONSE = 'AUDIO_RESPONSE', 
  VIDEO_RESPONSE = 'VIDEO_RESPONSE', 
  RESEARCH_MISSION = 'RESEARCH_MISSION',
  GROUP_ACTIVITY = 'GROUP_ACTIVITY',
  // New Types for Prescriptions
  MICRO_ENGAGEMENT = 'MICRO_ENGAGEMENT'
}

export enum ExamType {
  GENERAL = 'General Mastery',
  WAEC = 'WAEC (West African)',
  JAMB = 'JAMB (UTME)',
  NECO = 'NECO',
  IGCSE = 'Cambridge IGCSE',
  A_LEVELS = 'Cambridge A-Levels',
  SAT = 'SAT (US)',
  TOEFL = 'TOEFL',
  IELTS = 'IELTS',
  COMMON_ENTRANCE = 'Common Entrance',
  KCSE = 'KCSE (Kenya)',
  KCPE = 'KCPE (Kenya)',
  MATRIC = 'Matric (South Africa)',
  ZIMSEC = 'ZIMSEC (Zimbabwe)',
  UNEB = 'UNEB (Uganda)',
  IB_DIPLOMA = 'IB Diploma',
  GED = 'GED'
}

export enum SkillFocus {
  CONCEPT_MASTERY = 'Concept Mastery',
  PRACTICE_DRILLS = 'Practice Drills',
  CREATIVITY = 'Creativity & Expression',
  PROBLEM_SOLVING = 'Problem Solving',
  COMPREHENSION = 'Comprehension',
  COLLABORATION = 'Collaboration & Teamwork'
}

export enum GradingType {
  AUTO = 'AUTO',
  MANUAL = 'MANUAL',
  HYBRID = 'HYBRID' 
}

export enum TaskStatus {
  TODO = 'TODO',
  SUBMITTED = 'SUBMITTED',
  GRADED = 'GRADED',
  OVERDUE = 'OVERDUE'
}

export enum SessionStatus {
  SCHEDULED = 'SCHEDULED',
  LIVE = 'LIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

export enum SessionType {
    LESSON = 'LESSON',
    REVIEW = 'REVIEW',
    FEEDBACK = 'FEEDBACK',
    PREP = 'PREP',
    CONSULTATION = 'CONSULTATION',
    CLASS_SESSION = 'CLASS_SESSION',
    COLLAB_SESSION = 'COLLAB_SESSION'
}

export enum BlockType {
  TEXT = 'TEXT',
  VIDEO = 'VIDEO',
  IMAGE = 'IMAGE',
  QUIZ = 'QUIZ',
  TIP = 'TIP',
  KNORA_BUDDY = 'KNORA_BUDDY',
  GROUP_PROMPT = 'GROUP_PROMPT',
  PROMPT_ACTIVITY = 'PROMPT_ACTIVITY'
}

// --- DIAGNOSTIC & PRESCRIPTION TYPES ---

export type PrescriptionType = 'QUICK_TASK' | 'MICRO_COURSE' | 'INTERACTIVE_TEST' | 'CONVERSATION_SESSION';

export interface Prescription {
    type: PrescriptionType;
    title: string;
    rationale: string; // Why Knora chose this
    content: any; // The actual payload (questions, script, etc.)
    estimatedDuration: number; // minutes
}

export interface DiagnosticLog {
    id: string;
    learnerId: string;
    tutorId: string;
    timestamp: string;
    triggerContext: string; // What caused the diagnosis (e.g. "Failed Quiz 3")
    rootCauseAnalysis: string; // Knora's diagnosis
    prescription: Prescription;
    status: 'PENDING_APPROVAL' | 'ADMINISTERED' | 'COMPLETED';
}

// --- EXISTING TYPES ---

export type MasteryLevel = 'NOVICE' | 'APPRENTICE' | 'PROFICIENT' | 'MASTER';

export interface MicroSkill {
    id: string;
    name: string; 
    domain: string; 
    subject: string; 
    score: number; 
    level: MasteryLevel;
    lastAssessed: string;
    trend: 'UP' | 'DOWN' | 'STABLE';
    gapDetected: boolean; 
}

export interface MasteryProfile {
    learnerId: string;
    skills: MicroSkill[];
    overallScore: number;
}

export interface ChatMessage {
    id: string;
    role: 'user' | 'model';
    text: string;
    timestamp: Date;
    isTyping?: boolean;
    action?: AgentAction; 
}

export type AgentActionType = 
    'SAVE_ARTIFACT' | 'UPDATE_LEARNER_PROFILE' | 'CREATE_LEARNER_PROFILE' | 'GENERATE_ACTION_PLAN' | 'SITUATION_CLARIFICATION' | 
    'PATTERN_IDENTIFICATION' | 'SPARK_INTERVENTION' | 'FOLLOW_UP' | 'DRAFT_CONTENT' | 'NONE';

export interface AgentAction {
    type: AgentActionType;
    data: any; 
    status: 'PENDING' | 'CONFIRMED' | 'EXECUTED' | 'CANCELLED';
    summary: string; 
}

export interface SparkBreakdown {
    ignite: string; // Meaning/Story
    explore: string; // Interaction
    create: string; // Expression
    reflect: string; // Guided questions
    transfer: string; // Real-world application
}

export interface NnoraArtifact {
    id: string;
    title: string;
    targetLearnerType: string;
    concept: string;
    sparkBreakdown: SparkBreakdown;
    notes: string[];
    createdAt: Date;
}

export interface InteractionEntry {
    date: string;
    whatWasTried: string;
    whatWorked: string;
    whatDidnt: string;
    progressUpdate?: {
        understanding: number; // 1-5
        manipulation: number; // 1-5
        expression: number; // 1-5
    };
}

export interface ObservationMetric {
    category: string;
    level: number; // 1-5
    description: string;
}

export interface AssessmentMetric {
    area: string;
    currentEffort: number; // 1-5
    requiredEffort: number; // 1-5
    predictedOutcome: string;
}

export interface LearnerProfile {
    id: string;
    name: string;
    age?: number;
    ageRange?: string;
    characteristics?: {
        comprehension: 'Emerging' | 'Developing' | 'Strong';
        expression: 'Verbal' | 'Visual' | 'Physical';
        processingSpeed: 'Slow' | 'Moderate' | 'Fast';
        attention: 'Short' | 'Moderate' | 'Sustained';
        supportLevel: 'High' | 'Medium' | 'Low';
    };
    capabilities: {
        understanding: number;
        manipulation: number;
        expression: number;
    };
    keyChallenges: string[]; // Plain language
    strengths: string[];
    interactionHistory: InteractionEntry[];
    observationMetrics?: ObservationMetric[];
    assessmentMetrics?: AssessmentMetric[];
    reportSummary?: string;
}

export interface EverydaySparkActivity {
    id: string;
    targetConcept: string;
    childFixation: string;
    nearbyResources: string;
    setupTime: string;
    storyHook: string;
    playAction: string;
    coolDown: string;
    createdAt: Date;
}

export interface IepTranslation {
    id: string;
    originalText: string;
    translatedJargon: { jargon: string; translation: string }[];
    schoolObjective: string;
    homeActionPlan: string;
    createdAt: Date;
}

export type TriageCategory = 'SENSORY' | 'COGNITIVE' | 'TRANSITION';

export interface TriageCard {
    id: string;
    category: TriageCategory;
    trigger: string;
    steps: string[];
}

export interface WinCard {
    id: string;
    date: Date;
    activityUsed: string;
    outcomeDescr: string;
    childMood: 'HAPPY' | 'CALM' | 'FOCUSED' | 'FRUSTRATED' | 'TIRED' | 'REGULATED';
    createdAt: Date;
}

export type NnoraMode = 'CHAT' | 'ARTIFACTS' | 'LEARNERS' | 'ACADEMICS' | 'STORY_PLAY';

export interface HistoryThread {
    id: string;
    title: string;
    learnerId?: string;
    lastActive: Date;
    messages: ChatMessage[];
    mode: NnoraMode;
    status: 'ACTIVE' | 'ARCHIVED';
}

export interface FollowUpReminder {
    id: string;
    learnerId: string;
    threadId: string;
    scheduledFor: Date;
    prompt: string;
    status: 'PENDING' | 'SENT' | 'DISMISSED';
}

export interface Qualification {
  type: string;
  institution: string;
  year: number;
  verified: boolean;
}

export interface Resource {
  id: string;
  title: string;
  type: 'PDF' | 'VIDEO' | 'LINK' | 'DOC';
  url: string;
}

export interface Question {
  id: string;
  text: string;
  options?: string[]; 
  correctAnswer?: string; 
  explanation?: string; 
  linkedSkillId?: string; 
}

export interface TaskMilestone {
  id: string;
  title: string;
  description: string;
  order: number;
}

export interface ScenarioStep {
  id: string;
  title: string;
  description: string;
  options?: { text: string; consequence: string }[];
}

export interface Task {
  id: string;
  title: string;
  type: TaskType;
  examType?: ExamType;
  instructions: string;
  maxScore: number;
  tags?: string[];
  difficulty?: string;
  estimatedTime?: number;
  rubric?: string;
  questions?: Question[];
  milestones?: TaskMilestone[];
  scenarioSteps?: ScenarioStep[];
  codingConstraints?: string[];
  knoraBuddy?: {
    guidance: string;
    hints: string[];
  };
  gradingType?: GradingType;
  allowedAttempts?: number;
  skillFocus?: SkillFocus;
  dueDate?: string;
  curriculum?: string;
  // If this task is a prescription
  isPrescription?: boolean;
  prescriptionType?: PrescriptionType; 
}

export interface Review {
  id: string;
  authorName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface ProgramMarketingConfig {
    mediaType: 'IMAGE' | 'VIDEO';
    videoUrl?: string;
    seatsLimited: boolean;
    seatsLeft: number;
    showSeatsBadge: boolean;
    countdownActive: boolean;
    discountActive: boolean;
    discountPercent?: number;
    testimonials: { authorName: string; quote: string; rating: number; relation: string; }[];
    published: boolean;
    heroCtaLabel: string;
    guaranteeText?: string;
}

export interface ProgramModule {
    title: string;
    summary: string;
    duration: string;
}

export interface Program {
    id: string;
    tutorId: string;
    title: string;
    headline: string;
    description: string;
    subject: string;
    targetGrades: string;
    mode: DeliveryMode;
    price: number;
    currency: string;
    billingFrequency: 'Monthly' | 'Per Session' | 'Bundle';
    minCommitmentMonths?: number;
    maxCapacity: number;
    currentEnrollment: number;
    learningOutcomes: string[];
    syllabus: ProgramModule[];
    resourcesIncluded: string[];
    faqs: { question: string; answer: string; }[];
    posterUrl?: string;
    marketingConfig?: ProgramMarketingConfig;
    createdAt?: string;
    updatedAt?: string;
    schedule?: string;
}

export enum SubscriptionPlanType {
    FREE_TRIAL = 'FREE_TRIAL',
    BASIC = 'BASIC',
    PRO = 'PRO',
    CUSTOM = 'CUSTOM'
}

export interface SubscriptionInfo {
    planType: SubscriptionPlanType;
    credits: number;
    maxStudents: number;
    startDate: string;
    expiryDate?: string;
    isAutoRenew?: boolean;
}

export interface TutorProfile {
    id: string;
    name: string;
    email: string;
    status: AccountStatus; 
    schoolId?: string;
    headline: string;
    bio: string;
    location: string;
    avatarUrl: string;
    isCenter: boolean;
    centerId?: string;
    verificationStatus: VerificationStatus;
    rating: number;
    reviewCount: number;
    responseRate?: number;
    subjects: string[];
    programs: Program[];
    reviews: Review[];
    experienceYears: number;
    qualifications: Qualification[];
    primaryLanguage?: string;
    languages: string[];
    teachingStyles: string[];
    media?: {
        introVideoUrl?: string;
    };
    contactInfo?: {
        phone?: string;
        whatsapp?: string; 
    };
    subscription?: SubscriptionInfo;
}

export interface Learner {
    id: string;
    parentId?: string;
    centerId?: string;
    schoolId?: string; 
    name: string;
    grade: string;
    age: number;
    interests: string[];
    learningGoals?: string;
    accessCode?: string;
    masteryProfile?: MasteryProfile; 
}

export interface Parent {
    id: string;
    name: string;
    email: string;
    status: AccountStatus; 
    schoolId?: string; 
    avatarUrl?: string;
    learners: Learner[];
    enrollments: Enrollment[];
}

export interface Enrollment {
    id: string;
    programId: string;
    tutorId: string;
    learnerId: string;
    status: EnrollmentStatus;
    startDate: string;
}

export interface Lesson {
    id: string;
    tutorId?: string;
    title: string;
    subject: Subject;
    grade: string;
    topic?: string;
    durationMinutes: number;
    stages: LessonStage[];
    tasks: Task[];
    objectives: string[];
    resources: any[];
    aiGenerated?: boolean;
    curriculum?: string;
    language?: string;
    difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
    targetAge?: string;
}

export interface LessonStage {
    id: string;
    title: string;
    durationMinutes: number;
    objective?: string;
    blocks: LessonBlock[];
}

export interface LessonBlock {
    id: string;
    type: BlockType;
    content: string;
    meta?: {
        question?: string;
        options?: string[];
        correctAnswer?: string;
        explanation?: string;
        triggerText?: string;
        goal?: string;
        milestones?: string[];
        promptText?: string;
        suggestedTool?: 'NOTES' | 'SKETCH' | 'IDE' | 'TOOLS';
    };
}

export interface Session {
    id: string;
    tutorId: string;
    classId?: string; 
    learnerIds: string[];
    title: string;
    startTime: string;
    endTime: string;
    status: SessionStatus;
    type: SessionType;
    meetingUrl?: string;
    durationMinutes?: number; 
    taskId?: string;
}

export interface Annotation {
    type: 'PEN' | 'HIGHLIGHT';
    color: string;
    points: {x: number, y: number}[];
}

export interface RubricScore {
    criteriaId: string;
    points: number;
}

export interface AssessmentEvidence {
    quote: string;
    analysis: string;
    type: 'STRENGTH' | 'GAP';
}

export interface AssessmentBriefing {
    tutorBriefing: {
        analysis: string;
        recommendations: string[];
        suggestedIntervention: string;
    };
    parentBriefing: {
        summary: string;
        milestoneProgress: string;
        homeMissions: string[];
    };
}

export interface Submission {
    id: string;
    taskId: string;
    learnerId: string;
    submittedAt: string;
    status: 'PENDING' | 'GRADED' | 'REVISION_REQUESTED';
    content: string;
    mediaUrl?: string;
    answers?: Record<string, string>;
    score?: number;
    feedback?: string;
    annotations?: Annotation[];
    rubricScores?: RubricScore[];
    audioFeedbackUrl?: string;
    videoFeedbackUrl?: string; 
    skillImpacts?: { skillId: string, delta: number }[]; 
    notejamData?: NotejamData;
    evidence?: AssessmentEvidence[];
    rootCause?: string;
    briefing?: AssessmentBriefing;
}

export interface Assignment {
    id: string;
    taskId: string;
    learnerId: string;
    tutorId: string;
    assignedAt: string;
    dueDate: string;
    status: TaskStatus;
    taskSnapshot: Task;
}

export interface CenterProfile {
    id: string;
    name: string;
    schoolCode: string;
    adminName: string;
    email: string;
    subscriptionPlan: string;
    subscription?: SubscriptionInfo;
    maxTutors: number;
    maxStudents: number;
    schoolType?: string;
    phone?: string;
    logoUrl?: string;
    address?: string;
    website?: string;
    tagline?: string;
    description?: string;
    brandColor?: string;
}

export interface ClassGroup {
    id: string;
    centerId: string;
    name: string;
    tutorId: string;
    learnerIds: string[];
    subject: string;
    schedule: string;
}

export interface LearningPlan {
    id: string;
    tutorId: string;
    assignedLearnerIds: string[];
    title: string;
    goal: string;
    subject: Subject;
    gradeLevel: string;
    totalWeeks: number;
    phases: PlanPhase[];
    createdAt: string;
}

export interface PlanPhase {
    id: string;
    title: string;
    durationWeeks: number;
    description: string;
    color?: string;
    milestones: PlanMilestone[];
}

export interface PlanMilestone {
    id: string;
    title: string;
    weekOffset: number;
    expectedOutcome: string;
}

export enum CenterScope {
    SCHOOL = 'SCHOOL',
    STAFF = 'STAFF',
    CLASS = 'CLASS',
    STUDENT = 'STUDENT'
}

export interface CenterReport {
    scope: CenterScope;
    targetId?: string;
    generatedAt: string;
    executiveSummary: string;
    metrics: { label: string; value: string | number; trend?: 'UP' | 'DOWN' | 'STABLE'; delta?: string }[];
    highlights: string[];
    concerns: string[];
    recommendations: string[];
}

export interface RiskProfile {
    score: number;
    level: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
    factors: string[];
    velocity: 'POSITIVE' | 'FLAT' | 'NEGATIVE';
    engagementIndex: number;
}

export interface MasteryTopic {
    topic: string;
    masteryLevel: number;
    status: 'High' | 'Medium' | 'Low';
    trend: 'UP' | 'DOWN' | 'STABLE';
}

export interface AnalyticsInsight {
    learnerId: string;
    summary: string;
    evidence: string[];
    confidence: string;
    recommendedActions: RecommendedAction[];
}

export interface RecommendedAction {
    type: string;
    label: string;
    description: string;
    impact: string;
    effort: string;
}

export interface Intervention {
    id: string;
    type: string;
    status: string;
}

export interface Thread {
    id: string;
    participants: { id: string; name: string; role: UserRole }[];
    subjectContext?: { learnerId: string; learnerName: string; };
    lastMessageAt: string;
    unreadCount: number;
    messages: Message[];
    type?: 'DIRECT' | 'GROUP' | 'BROADCAST'; 
}

export interface Message {
    id: string;
    senderId: string;
    senderRole: UserRole;
    text: string;
    type: MessageType;
    timestamp: string;
    attachments?: { id: string; type: 'FILE' | 'AUDIO' | 'IMAGE'; url: string }[];
    forwardedData?: any; 
    actionPayload?: {
        type: 'FILE_UPLOAD' | 'SCHEDULE_SYNC' | 'ACKNOWLEDGE';
        label: string;
        status: 'PENDING' | 'COMPLETED';
        data?: any;
    };
    isPinned?: boolean;
}

export type MessageType = 'TEXT' | 'AUDIO' | 'IMAGE' | 'FILE' | 'REPORT' | 'FORWARDED_CREATION' | 'BROADCAST' | 'ACTION_REQUEST';

export enum ArchiveResourceType {
    VIDEO = 'VIDEO',
    IMAGE = 'IMAGE',
    DOCUMENT = 'DOCUMENT',
    PROBLEM_SET = 'PROBLEM_SET'
}

export interface ArchiveResource {
    id: string;
    ownerId: string; // Tutor ID or 'SYSTEM' for shared
    type: ArchiveResourceType;
    title: string;
    url?: string;
    thumbnailUrl?: string;
    content?: string; // For problem sets or descriptions
    subject: Subject;
    level: string; // e.g., 'Primary', 'Secondary'
    tags: string[];
    description?: string;
    usageNote?: string;
    lessonContext?: string; // e.g., 'Introduction', 'Practice'
    difficulty?: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
    duration?: string; // For videos
    isFavorite: boolean;
    isShared: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface ArchiveCollection {
    id: string;
    ownerId: string;
    title: string;
    description?: string;
    resourceIds: string[];
    createdAt: string;
}

export interface NotejamData {
    notes: string; // HTML from Quill
    sketchData?: string; // JSON from Konva
    codeBlocks?: { language: string; code: string }[];
    mathExpressions?: string[];
    toolsData?: {
        calculatorHistory?: string[];
        graphs?: any[];
    };
    promptId?: string;
}

export interface CollabParticipant {
    id: string;
    name: string;
    role: 'TUTOR' | 'LEARNER';
    isOnline: boolean;
}

export interface CollabMessage {
    id: string;
    senderId: string;
    senderName?: string;
    text: string;
    timestamp: Date;
    type: 'TEXT' | 'SYSTEM' | 'IMAGE' | 'FILE';
}

export interface PerformanceMetric {
    subject: string;
    masteryScore: number;
    trend: 'UP' | 'DOWN' | 'STABLE';
}

export interface RubricCriteria {
    id: string;
    label: string;
    maxPoints: number;
}

// --- AFFILIATE SYSTEM TYPES ---

export enum AffiliateProgramStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    PAUSED = 'PAUSED'
}

export interface AffiliateProgram {
    id: string;
    tutorId: string;
    status: AffiliateProgramStatus;
    commissionType: 'PERCENTAGE' | 'FIXED';
    commissionValue: number;
    terms: string;
    createdAt: string;
    updatedAt: string;
}

export interface AffiliatePartner {
    id: string;
    programId: string;
    parentId: string;
    tutorId: string;
    affiliateCode: string;
    status: 'PENDING' | 'ACTIVE' | 'REJECTED';
    joinedAt: string;
    stats: {
        clicks: number;
        referrals: number;
        conversions: number;
        totalEarned: number;
    };
}

export interface AffiliateReferral {
    id: string;
    partnerId: string;
    parentId: string; // The affiliate parent
    tutorId: string;
    referredLearnerId?: string; // If they enrolled
    referredParentId?: string; // The new parent who enrolled
    programId?: string; // The specific program referred (if any)
    status: 'CLICKED' | 'CONVERTED' | 'PAID';
    commissionAmount: number;
    createdAt: string;
    convertedAt?: string;
}
