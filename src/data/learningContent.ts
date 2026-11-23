export interface LearningSection {
  id: string;
  number: string;
  title: string;
  summary: string;
  paragraphs: string[];
  keyPoints?: string[];
  formula?: {
    label: string;
    expression: string;
    note: string;
  };
}

export const LEARNING_SECTIONS: LearningSection[] = [
  {
    id: 'operating-system',
    number: '01',
    title: 'What is an Operating System?',
    summary: 'The core system software that manages computer hardware and coordinates shared resources for running programs.',
    paragraphs: [
      'An Operating System (OS) acts as a bridge between computer hardware and user applications. Whenever multiple programs run in a computing laboratory, the OS decides which program gets CPU time, memory space, printers, disk drives, and network access.',
      'Because hardware devices are limited, the operating system must allocate them fairly and safely so programs do not overwrite each other or get stuck waiting forever.',
    ],
    keyPoints: [
      'Manages processes, main memory, files, and input/output devices.',
      'Enforces protection so one program cannot corrupt another.',
      'Acts as a resource allocator and control program for the entire system.',
    ],
  },
  {
    id: 'process',
    number: '02',
    title: 'What is a Process?',
    summary: 'A program in active execution along with its current state, memory allocation, and held devices.',
    paragraphs: [
      'A program stored on disk is passive—it is just a file of instructions. Once the operating system loads that program into memory and starts running it, it becomes an active entity called a process (denoted as P0, P1, P2, etc.).',
      'During its life cycle, a process requests resources (like a printer or memory blocks), uses them to finish its task, and releases them back to the operating system so other waiting processes can continue.',
    ],
    keyPoints: [
      'Standard resource life cycle: Request → Use → Release.',
      'Each process tracks its Current Allocation, Maximum Claim, and Remaining Need.',
      'If a requested resource is busy, the process enters a Waiting state until it becomes free.',
    ],
  },
  {
    id: 'deadlock',
    number: '03',
    title: 'What is Deadlock?',
    summary: 'A permanent standstill where a set of processes each wait for a resource held by another process in the same set.',
    paragraphs: [
      'Deadlock occurs when two or more processes are blocked forever because each process holds at least one resource while waiting for another resource held by a different blocked process.',
      'For example, imagine Process P1 holds the Lab Printer and waits for the Scanner, while Process P2 holds the Scanner and waits for the Lab Printer. Neither process can proceed or release what it holds, bringing both tasks to a permanent halt.',
    ],
    keyPoints: [
      'Deadlocked processes can never finish without outside intervention by the OS or operator.',
      'Common in multiprogramming environments with limited non-shareable hardware.',
      'Handled using four strategies: Prevention, Avoidance (Banker’s Algorithm), Detection & Recovery, or Ignorance.',
    ],
  },
  {
    id: 'four-conditions',
    number: '04',
    title: 'Four Necessary Conditions of Deadlock (Coffman Conditions)',
    summary: 'All four conditions must hold simultaneously for a deadlock to occur. Breaking any single one prevents deadlock.',
    paragraphs: [
      'Edward G. Coffman proved that a deadlock can happen if and only if four specific conditions exist at the exact same time in a system.',
    ],
    keyPoints: [
      'Mutual Exclusion: At least one resource must be non-shareable, meaning only one process can use it at a time.',
      'Hold and Wait: A process is currently holding at least one resource while waiting to acquire additional resources held by others.',
      'No Preemption: Resources cannot be forcibly taken away from a process; they can only be released voluntarily when the process finishes.',
      'Circular Wait: A closed chain of processes (P0 → P1 → ... → Pn → P0) exists where each process waits for a resource held by the next process in the cycle.',
    ],
  },
  {
    id: 'safe-state',
    number: '05',
    title: 'What is a Safe State?',
    summary: 'A system state where the OS can guarantee a valid order (Safe Sequence) in which every process can complete without deadlock.',
    paragraphs: [
      'A system is in a Safe State if there exists at least one sequence of all processes <P_a, P_b, ..., P_n> such that for every process in the sequence, its remaining resource need can be satisfied using the currently Available resources plus all resources held by earlier processes in the sequence.',
      'Even if every process suddenly requests its full declared maximum claim at once, the operating system can still schedule them in the safe sequence so every single process finishes cleanly. A safe state is guaranteed to be deadlock-free.',
    ],
    formula: {
      label: 'Safety Condition for Process Pi',
      expression: 'Need[i] <= Work,  then  Work = Work + Allocation[i]',
      note: 'Where Need[i] = Maximum[i] - Allocation[i], and Work starts equal to Available.',
    },
  },
  {
    id: 'unsafe-state',
    number: '06',
    title: 'What is an Unsafe State?',
    summary: 'A state with no guaranteed safe completion order—meaning deadlock is possible, though not necessarily happening right now.',
    paragraphs: [
      'If the operating system cannot find any safe sequence that allows all processes to satisfy their maximum future claims, the system is in an Unsafe State.',
      'Important distinction: an unsafe state is NOT automatically a deadlock! Processes might still finish if they happen to release resources before requesting their full maximum claim. However, the OS can no longer guarantee safety—if processes request their remaining maximum needs, deadlock will occur.',
    ],
    keyPoints: [
      'Every safe state is deadlock-free.',
      'Every deadlocked state is an unsafe state.',
      'An unsafe state may or may not enter deadlock depending on future requests.',
    ],
  },
  {
    id: 'bankers-algorithm',
    number: '07',
    title: 'What is Banker’s Algorithm?',
    summary: 'Edsger Dijkstra’s classic deadlock avoidance algorithm that tests every allocation before granting it, like a cautious bank.',
    paragraphs: [
      'Proposed by Edsger W. Dijkstra, the Banker’s Algorithm gets its name from a banking system that never lends out cash in a way that would leave it unable to satisfy all customers’ credit lines.',
      'Before any process starts, it must declare the maximum number of instances of each resource type it may ever need. Whenever a process requests resources, the OS temporarily pretends to grant the request and runs the Safety Algorithm. If the resulting state is safe, the request is granted; if unsafe, the process must wait.',
    ],
    formula: {
      label: 'Core Matrix Relation',
      expression: 'Need[i][j] = Maximum[i][j] - Allocation[i][j]',
      note: 'Time complexity of the Safety Check is O(m × n²) for n processes and m resource types.',
    },
  },
  {
    id: 'avoidance-vs-detection',
    number: '08',
    title: 'Difference Between Deadlock Avoidance and Deadlock Detection',
    summary: 'Avoidance prevents unsafe allocations beforehand using Maximum claims; Detection inspects current Requests after allocation.',
    paragraphs: [
      'Deadlock Avoidance (Banker’s Algorithm) is proactive: it requires knowing each process’s Maximum future demand in advance and refuses any allocation that would push the system into an unsafe state.',
      'Deadlock Detection is reactive: it does not require Maximum claims at all. Processes freely request and hold resources, and the OS periodically runs the detection algorithm on the current Allocation and Request matrices. If any processes remain unfinished (Finish[i] = false), an actual deadlock is confirmed and recovery (such as process termination or resource preemption) is triggered.',
    ],
  },
  {
    id: 'pros-cons',
    number: '09',
    title: 'Advantages and Limitations of Banker’s Algorithm',
    summary: 'Strong theoretical safety guarantees balanced against practical real-world constraints.',
    paragraphs: [
      'Banker’s Algorithm is a foundational concept in operating systems because it allows higher resource utilization than strict deadlock prevention while still guaranteeing zero deadlocks.',
    ],
    keyPoints: [
      'Advantage: Guarantees the system never enters a deadlock as long as requests stay within declared maximums.',
      'Advantage: Allows processes to hold resources and wait (unlike strict prevention), improving throughput.',
      'Advantage: Works cleanly for systems with multiple instances of each resource type.',
      'Limitation: Requires processes to declare their maximum resource needs in advance, which is often impossible in dynamic interactive systems.',
      'Limitation: Assumes a fixed number of processes and constant total system resources (devices cannot fail or be hot-plugged mid-run).',
      'Limitation: Running an O(m × n²) safety check on every single resource request adds runtime overhead.',
    ],
  },
];

export const AVOIDANCE_VS_DETECTION_TABLE = [
  {
    aspect: 'Approach',
    avoidance: 'Proactive — checks before granting any resource request.',
    detection: 'Reactive — allows allocations and checks periodically for stuck processes.',
  },
  {
    aspect: 'Input Matrices Required',
    avoidance: 'Allocation, Maximum (to compute Need), and Available.',
    detection: 'Allocation, Current Request, and Available (no Maximum needed).',
  },
  {
    aspect: 'Initial Finish[i] Rule',
    avoidance: 'Finish[i] = false for every process i.',
    detection: 'Finish[i] = false if Allocation[i] ≠ 0; otherwise Finish[i] = true.',
  },
  {
    aspect: 'Eligibility Condition',
    avoidance: 'Need[i] <= Work',
    detection: 'Request[i] <= Work',
  },
  {
    aspect: 'Negative Outcome Meaning',
    avoidance: 'UNSAFE STATE — deadlock is possible in the future.',
    detection: 'DEADLOCK DETECTED — listed processes are actively deadlocked right now.',
  },
  {
    aspect: 'Action Taken on Failure',
    avoidance: 'Deny/defer the resource request so the system remains safe.',
    detection: 'Invoke deadlock recovery (terminate process or preempt resources).',
  },
];
