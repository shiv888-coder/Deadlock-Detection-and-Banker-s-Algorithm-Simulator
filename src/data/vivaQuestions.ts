export type VivaCategory =
  | 'All'
  | 'Deadlock'
  | "Banker's Algorithm"
  | 'Resource Allocation'
  | 'Safe Sequence'
  | 'Process Management'
  | 'Prevention & Avoidance'
  | 'Deadlock Detection';

export interface VivaQuestion {
  id: number;
  category: Exclude<VivaCategory, 'All'>;
  question: string;
  answer: string;
  difficulty: 'Core' | 'Intermediate' | 'Exam Favorite';
}

export const VIVA_CATEGORIES: VivaCategory[] = [
  'All',
  'Deadlock',
  "Banker's Algorithm",
  'Resource Allocation',
  'Safe Sequence',
  'Process Management',
  'Prevention & Avoidance',
  'Deadlock Detection',
];

export const VIVA_QUESTIONS: VivaQuestion[] = [
  {
    id: 1,
    category: 'Deadlock',
    difficulty: 'Core',
    question: 'What is a deadlock in an Operating System?',
    answer:
      'A deadlock is a permanent blocking situation in which a set of two or more processes are each waiting for an event or resource that can only be released by another process within the same blocked set. None of the processes can proceed without external intervention.',
  },
  {
    id: 2,
    category: 'Deadlock',
    difficulty: 'Exam Favorite',
    question: 'What are the four necessary conditions (Coffman conditions) for deadlock?',
    answer:
      'The four conditions that must hold simultaneously are: (1) Mutual Exclusion, (2) Hold and Wait, (3) No Preemption, and (4) Circular Wait. If even one condition is prevented from occurring, a deadlock cannot happen.',
  },
  {
    id: 3,
    category: 'Deadlock',
    difficulty: 'Core',
    question: 'What is the difference between deadlock and starvation?',
    answer:
      'In a deadlock, processes wait indefinitely in a circular chain and can never progress. In starvation (indefinite blocking), a process is ready to run or waiting for a resource that keeps getting assigned to higher-priority processes; it may eventually run if scheduling priorities change (e.g., via aging).',
  },
  {
    id: 4,
    category: 'Deadlock',
    difficulty: 'Intermediate',
    question: 'What is a Resource Allocation Graph (RAG), and when does a cycle guarantee deadlock?',
    answer:
      'A Resource Allocation Graph is a directed graph with process vertices, resource vertices, request edges (Pi → Rj), and assignment edges (Rj → Pi). If every resource type has only a single instance, a cycle is both necessary and sufficient for deadlock. If resources have multiple instances, a cycle is necessary but not sufficient.',
  },
  {
    id: 5,
    category: "Banker's Algorithm",
    difficulty: 'Exam Favorite',
    question: 'Who proposed Banker’s Algorithm and why is it named after a banker?',
    answer:
      'Edsger W. Dijkstra proposed Banker’s Algorithm in 1965. It is named after a small-town banker who ensures they never allocate available cash to customers in a way that leaves the bank unable to satisfy the maximum credit line of all customers.',
  },
  {
    id: 6,
    category: "Banker's Algorithm",
    difficulty: 'Core',
    question: 'What data structures are required by Banker’s Algorithm?',
    answer:
      'For n processes and m resource types, Banker’s Algorithm uses four main structures: Available (vector of length m), Max (n × m matrix), Allocation (n × m matrix), and Need (n × m matrix computed as Max − Allocation). During the safety check, it also uses Work (length m) and Finish (boolean array of length n).',
  },
  {
    id: 7,
    category: "Banker's Algorithm",
    difficulty: 'Exam Favorite',
    question: 'How is the Need matrix calculated in Banker’s Algorithm?',
    answer:
      'For every process i and resource type j, Need[i][j] = Max[i][j] − Allocation[i][j]. It represents the maximum additional instances of resource j that process i might still request to complete its execution.',
  },
  {
    id: 8,
    category: "Banker's Algorithm",
    difficulty: 'Intermediate',
    question: 'What are the two sub-algorithms inside Banker’s Algorithm?',
    answer:
      'Banker’s Algorithm consists of (1) the Safety Algorithm, which determines whether a given system state is safe and finds a safe sequence, and (2) the Resource-Request Algorithm, which validates a new request against Need and Available, tentatively allocates it, and calls the Safety Algorithm before committing.',
  },
  {
    id: 9,
    category: "Banker's Algorithm",
    difficulty: 'Exam Favorite',
    question: 'What is the time complexity of Banker’s Safety Algorithm?',
    answer:
      'The Safety Algorithm runs in O(m × n²) time, where n is the number of processes and m is the number of resource types. In the worst case, up to n passes scan n processes, each comparing vectors of length m.',
  },
  {
    id: 10,
    category: "Banker's Algorithm",
    difficulty: 'Intermediate',
    question: 'Why is Banker’s Algorithm rarely used directly in general-purpose operating systems?',
    answer:
      'General-purpose OSes rarely know each process’s maximum resource demand in advance, the number of active processes changes dynamically, hardware resources can go offline, and running O(m × n²) safety checks on every allocation request introduces noticeable overhead.',
  },
  {
    id: 11,
    category: 'Safe Sequence',
    difficulty: 'Core',
    question: 'Define a Safe State and a Safe Sequence.',
    answer:
      'A Safe Sequence is an ordering <P1, P2, ..., Pn> of all processes such that each process Pi’s remaining need can be met by currently available resources plus all resources held by processes before it in the sequence. If at least one such sequence exists, the system is in a Safe State.',
  },
  {
    id: 12,
    category: 'Safe Sequence',
    difficulty: 'Exam Favorite',
    question: 'Can a system have more than one valid safe sequence?',
    answer:
      'Yes. Whenever multiple unfinished processes satisfy Need[i] <= Work at the same step, choosing different eligible processes can yield multiple valid safe sequences. Any single valid safe sequence is sufficient to prove the system is in a safe state.',
  },
  {
    id: 13,
    category: 'Safe Sequence',
    difficulty: 'Exam Favorite',
    question: 'Does an unsafe state always mean the system is currently deadlocked?',
    answer:
      'No. An unsafe state only means the OS cannot guarantee deadlock avoidance if every process demands its declared maximum claim. If processes finish early or request fewer resources than their maximums, the system may still complete without ever hitting deadlock.',
  },
  {
    id: 14,
    category: 'Safe Sequence',
    difficulty: 'Core',
    question: 'What happens to the Work vector when a process finishes in the Safety Algorithm?',
    answer:
      'When an eligible process Pi finishes, it releases all resources it currently holds back to the pool. Therefore, Work is updated as Work = Work + Allocation[i], and Finish[i] is set to true.',
  },
  {
    id: 15,
    category: 'Resource Allocation',
    difficulty: 'Core',
    question: 'What are the three steps a process follows when using a system resource?',
    answer:
      'Under normal operation, a process must: (1) Request the resource (and wait if unavailable), (2) Use the allocated resource, and (3) Release the resource back to the operating system.',
  },
  {
    id: 16,
    category: 'Resource Allocation',
    difficulty: 'Intermediate',
    question: 'Why must Allocation[i][j] never exceed Maximum[i][j]?',
    answer:
      'Maximum[i][j] is the upper bound declared by process Pi for resource Rj. If Allocation[i][j] exceeded Maximum[i][j], Need[i][j] would become negative, violating the contract of Banker’s Algorithm and rendering the safety computation invalid.',
  },
  {
    id: 17,
    category: 'Resource Allocation',
    difficulty: 'Core',
    question: 'How are Total System Resources, Total Allocated, and Available Resources related?',
    answer:
      'For every resource type j: Total Capacity[j] = sum(Allocation[i][j] for all processes i) + Available[j]. Thus, total allocations for any resource can never exceed the system’s physical capacity.',
  },
  {
    id: 18,
    category: 'Resource Allocation',
    difficulty: 'Intermediate',
    question: 'What is the difference between preemptable and non-preemptable resources?',
    answer:
      'A preemptable resource (such as CPU registers or memory pages via swapping) can be taken away from a process without harming its correctness. A non-preemptable resource (such as a printer mid-job or a mutex lock) cannot be forcibly taken without causing failure or inconsistency.',
  },
  {
    id: 19,
    category: 'Process Management',
    difficulty: 'Core',
    question: 'What are the main states in a process life cycle?',
    answer:
      'A process transitions through five standard states: New (being created), Ready (waiting for CPU assignment), Running (executing instructions), Waiting/Blocked (waiting for I/O or a busy resource), and Terminated (finished execution and released all resources).',
  },
  {
    id: 20,
    category: 'Process Management',
    difficulty: 'Core',
    question: 'What information is stored in a Process Control Block (PCB)?',
    answer:
      'A PCB stores the Process ID (PID), process state, program counter, CPU registers, scheduling priority, memory management limits, accounting data, and lists of open files and currently allocated I/O devices.',
  },
  {
    id: 21,
    category: 'Process Management',
    difficulty: 'Intermediate',
    question: 'What happens to a process if its resource request passes Need check but exceeds Available?',
    answer:
      'In Banker’s Resource-Request Algorithm, if Request[i] <= Need[i] but Request[i] > Available, it is not an error condition; the process simply enters the Waiting state until other processes release enough resources.',
  },
  {
    id: 22,
    category: 'Prevention & Avoidance',
    difficulty: 'Exam Favorite',
    question: 'How does Deadlock Prevention differ from Deadlock Avoidance?',
    answer:
      'Deadlock Prevention structurally disables at least one of the four Coffman conditions through strict system rules (e.g., imposing a global resource ordering to prevent circular wait). Deadlock Avoidance allows all four conditions to exist in principle, but inspects each allocation request dynamically using advance Maximum-claim data to stay in a safe state.',
  },
  {
    id: 23,
    category: 'Prevention & Avoidance',
    difficulty: 'Intermediate',
    question: 'How can the Circular Wait condition be prevented in practice?',
    answer:
      'By assigning a unique numerical rank to every resource type and requiring every process to request resources strictly in increasing order of their assigned numbers. This makes forming a closed wait cycle mathematically impossible.',
  },
  {
    id: 24,
    category: 'Prevention & Avoidance',
    difficulty: 'Core',
    question: 'What is the Ostrich Algorithm for handling deadlocks?',
    answer:
      'The Ostrich Algorithm simply ignores the deadlock problem—pretending deadlocks never occur. Many desktop operating systems (like Linux and Windows) adopt this approach for rare user-space deadlocks because the performance cost of constant avoidance outweighs the rarity of deadlocks.',
  },
  {
    id: 25,
    category: 'Deadlock Detection',
    difficulty: 'Exam Favorite',
    question: 'How does the Finish array initialization in Deadlock Detection differ from Banker’s Algorithm?',
    answer:
      'In Banker’s Algorithm, Finish[i] is always initialized to false for every process. In Deadlock Detection, Finish[i] is set to false only if Allocation[i] is non-zero; if a process holds zero resources (Allocation[i] == 0), Finish[i] is initialized to true because it is not holding resources that block others.',
  },
  {
    id: 26,
    category: 'Deadlock Detection',
    difficulty: 'Exam Favorite',
    question: 'Which matrix replaces the Need matrix in the Deadlock Detection Algorithm?',
    answer:
      'The Current Request matrix replaces the Need matrix. Deadlock Detection checks whether Request[i] <= Work (using actual pending requests right now rather than theoretical future maximum claims).',
  },
  {
    id: 27,
    category: 'Deadlock Detection',
    difficulty: 'Intermediate',
    question: 'Once Deadlock Detection identifies deadlocked processes, how can the OS recover?',
    answer:
      'The OS can recover through two primary methods: (1) Process Termination—aborting all deadlocked processes at once or terminating one victim process at a time until the deadlock cycle breaks, or (2) Resource Preemption—selecting a victim, rolling back its state to a safe checkpoint, and reassigning its resources while guarding against starvation.',
  },
  {
    id: 28,
    category: 'Deadlock Detection',
    difficulty: 'Intermediate',
    question: 'How often should an operating system invoke the Deadlock Detection algorithm?',
    answer:
      'Detection frequency depends on how often deadlocks occur and how many processes are affected. It can run every time a resource request cannot be granted immediately (higher overhead, immediate pinpointing) or periodically at fixed time intervals / when CPU utilization drops below a threshold.',
  },
];
