import { StudentResult, UniversityDataset } from '../types';

export const SAMPLE_BTECH_STUDENTS: StudentResult[] = [
  {
    enrollment: "220123401",
    name: "Aarav Sharma",
    cgpa: 9.62,
    sgpa: 9.75,
    result: "PASS",
    semester: "VI",
    branch: "Computer Science & Engg",
    subjects: [
      { code: "CS301", name: "Data Structures & Algorithms", grade: "A+" },
      { code: "CS302", name: "Object Oriented Programming", grade: "A+" },
      { code: "CS303", name: "Database Management Systems", grade: "A+" },
      { code: "CS304", name: "Computer Networks", grade: "A" },
      { code: "CS305", name: "Operating Systems", grade: "A+" },
      { code: "CS306", name: "Software Engineering", grade: "A" }
    ]
  },
  {
    enrollment: "220123402",
    name: "Ananya Patel",
    cgpa: 9.48,
    sgpa: 9.50,
    result: "PASS",
    semester: "VI",
    branch: "Computer Science & Engg",
    subjects: [
      { code: "CS301", name: "Data Structures & Algorithms", grade: "A+" },
      { code: "CS302", name: "Object Oriented Programming", grade: "A+" },
      { code: "CS303", name: "Database Management Systems", grade: "A" },
      { code: "CS304", name: "Computer Networks", grade: "A+" },
      { code: "CS305", name: "Operating Systems", grade: "A" },
      { code: "CS306", name: "Software Engineering", grade: "A+" }
    ]
  },
  {
    enrollment: "220123403",
    name: "Rohan Verma",
    cgpa: 9.25,
    sgpa: 9.30,
    result: "PASS",
    semester: "VI",
    branch: "Computer Science & Engg",
    subjects: [
      { code: "CS301", name: "Data Structures & Algorithms", grade: "A+" },
      { code: "CS302", name: "Object Oriented Programming", grade: "A" },
      { code: "CS303", name: "Database Management Systems", grade: "A+" },
      { code: "CS304", name: "Computer Networks", grade: "A" },
      { code: "CS305", name: "Operating Systems", grade: "B+" },
      { code: "CS306", name: "Software Engineering", grade: "A" }
    ]
  },
  {
    enrollment: "220123404",
    name: "Priya Nair",
    cgpa: 9.10,
    sgpa: 9.15,
    result: "PASS",
    semester: "VI",
    branch: "Computer Science & Engg",
    subjects: [
      { code: "CS301", name: "Data Structures & Algorithms", grade: "A" },
      { code: "CS302", name: "Object Oriented Programming", grade: "A+" },
      { code: "CS303", name: "Database Management Systems", grade: "A" },
      { code: "CS304", name: "Computer Networks", grade: "B+" },
      { code: "CS305", name: "Operating Systems", grade: "A" },
      { code: "CS306", name: "Software Engineering", grade: "A+" }
    ]
  },
  {
    enrollment: "220123405",
    name: "Vikram Malhotra",
    cgpa: 8.92,
    sgpa: 9.00,
    result: "PASS",
    semester: "VI",
    branch: "Computer Science & Engg",
    subjects: [
      { code: "CS301", name: "Data Structures & Algorithms", grade: "A" },
      { code: "CS302", name: "Object Oriented Programming", grade: "A" },
      { code: "CS303", name: "Database Management Systems", grade: "B+" },
      { code: "CS304", name: "Computer Networks", grade: "A" },
      { code: "CS305", name: "Operating Systems", grade: "A" },
      { code: "CS306", name: "Software Engineering", grade: "B+" }
    ]
  },
  {
    enrollment: "220123406",
    name: "Diya Chatterjee",
    cgpa: 8.75,
    sgpa: 8.80,
    result: "PASS",
    semester: "VI",
    branch: "Computer Science & Engg",
    subjects: [
      { code: "CS301", name: "Data Structures & Algorithms", grade: "B+" },
      { code: "CS302", name: "Object Oriented Programming", grade: "A" },
      { code: "CS303", name: "Database Management Systems", grade: "A" },
      { code: "CS304", name: "Computer Networks", grade: "B+" },
      { code: "CS305", name: "Operating Systems", grade: "A+" },
      { code: "CS306", name: "Software Engineering", grade: "B+" }
    ]
  },
  {
    enrollment: "220123407",
    name: "Karan Singh",
    cgpa: 8.60,
    sgpa: 8.65,
    result: "PASS",
    semester: "VI",
    branch: "Computer Science & Engg",
    subjects: [
      { code: "CS301", name: "Data Structures & Algorithms", grade: "A" },
      { code: "CS302", name: "Object Oriented Programming", grade: "B+" },
      { code: "CS303", name: "Database Management Systems", grade: "A" },
      { code: "CS304", name: "Computer Networks", grade: "B" },
      { code: "CS305", name: "Operating Systems", grade: "A" },
      { code: "CS306", name: "Software Engineering", grade: "B+" }
    ]
  },
  {
    enrollment: "220123408",
    name: "Sneha Reddy",
    cgpa: 8.45,
    sgpa: 8.50,
    result: "PASS",
    semester: "VI",
    branch: "Computer Science & Engg",
    subjects: [
      { code: "CS301", name: "Data Structures & Algorithms", grade: "B+" },
      { code: "CS302", name: "Object Oriented Programming", grade: "B+" },
      { code: "CS303", name: "Database Management Systems", grade: "A" },
      { code: "CS304", name: "Computer Networks", grade: "B+" },
      { code: "CS305", name: "Operating Systems", grade: "B" },
      { code: "CS306", name: "Software Engineering", grade: "A" }
    ]
  },
  {
    enrollment: "220123409",
    name: "Aditya Gupta",
    cgpa: 8.30,
    sgpa: 8.40,
    result: "PASS",
    semester: "VI",
    branch: "Computer Science & Engg",
    subjects: [
      { code: "CS301", name: "Data Structures & Algorithms", grade: "B+" },
      { code: "CS302", name: "Object Oriented Programming", grade: "B+" },
      { code: "CS303", name: "Database Management Systems", grade: "B+" },
      { code: "CS304", name: "Computer Networks", grade: "B" },
      { code: "CS305", name: "Operating Systems", grade: "A" },
      { code: "CS306", name: "Software Engineering", grade: "B+" }
    ]
  },
  {
    enrollment: "220123410",
    name: "Meera Krishnan",
    cgpa: 8.15,
    sgpa: 8.20,
    result: "PASS",
    semester: "VI",
    branch: "Computer Science & Engg",
    subjects: [
      { code: "CS301", name: "Data Structures & Algorithms", grade: "B" },
      { code: "CS302", name: "Object Oriented Programming", grade: "A" },
      { code: "CS303", name: "Database Management Systems", grade: "B+" },
      { code: "CS304", name: "Computer Networks", grade: "B" },
      { code: "CS305", name: "Operating Systems", grade: "B+" },
      { code: "CS306", name: "Software Engineering", grade: "A" }
    ]
  },
  {
    enrollment: "220123411",
    name: "Arjun Deshmukh",
    cgpa: 7.80,
    sgpa: 7.85,
    result: "PASS",
    semester: "VI",
    branch: "Computer Science & Engg",
    subjects: [
      { code: "CS301", name: "Data Structures & Algorithms", grade: "B" },
      { code: "CS302", name: "Object Oriented Programming", grade: "B+" },
      { code: "CS303", name: "Database Management Systems", grade: "C+" },
      { code: "CS304", name: "Computer Networks", grade: "B" },
      { code: "CS305", name: "Operating Systems", grade: "B" },
      { code: "CS306", name: "Software Engineering", grade: "B+" }
    ]
  },
  {
    enrollment: "220123412",
    name: "Isha Joshi",
    cgpa: 7.50,
    sgpa: 7.60,
    result: "PASS",
    semester: "VI",
    branch: "Computer Science & Engg",
    subjects: [
      { code: "CS301", name: "Data Structures & Algorithms", grade: "C+" },
      { code: "CS302", name: "Object Oriented Programming", grade: "B" },
      { code: "CS303", name: "Database Management Systems", grade: "B" },
      { code: "CS304", name: "Computer Networks", grade: "C+" },
      { code: "CS305", name: "Operating Systems", grade: "B+" },
      { code: "CS306", name: "Software Engineering", grade: "B" }
    ]
  },
  {
    enrollment: "220123413",
    name: "Siddharth Rao",
    cgpa: 7.15,
    sgpa: 7.20,
    result: "PASS",
    semester: "VI",
    branch: "Computer Science & Engg",
    subjects: [
      { code: "CS301", name: "Data Structures & Algorithms", grade: "C+" },
      { code: "CS302", name: "Object Oriented Programming", grade: "C+" },
      { code: "CS303", name: "Database Management Systems", grade: "B" },
      { code: "CS304", name: "Computer Networks", grade: "C" },
      { code: "CS305", name: "Operating Systems", grade: "B" },
      { code: "CS306", name: "Software Engineering", grade: "C+" }
    ]
  },
  {
    enrollment: "220123414",
    name: "Tanya Saxena",
    cgpa: 6.80,
    sgpa: 6.85,
    result: "PASS",
    semester: "VI",
    branch: "Computer Science & Engg",
    subjects: [
      { code: "CS301", name: "Data Structures & Algorithms", grade: "C" },
      { code: "CS302", name: "Object Oriented Programming", grade: "B" },
      { code: "CS303", name: "Database Management Systems", grade: "C+" },
      { code: "CS304", name: "Computer Networks", grade: "D" },
      { code: "CS305", name: "Operating Systems", grade: "C+" },
      { code: "CS306", name: "Software Engineering", grade: "C" }
    ]
  },
  {
    enrollment: "220123415",
    name: "Kabir Roy",
    cgpa: 6.25,
    sgpa: 6.30,
    result: "PASS",
    semester: "VI",
    branch: "Computer Science & Engg",
    subjects: [
      { code: "CS301", name: "Data Structures & Algorithms", grade: "C" },
      { code: "CS302", name: "Object Oriented Programming", grade: "C" },
      { code: "CS303", name: "Database Management Systems", grade: "D" },
      { code: "CS304", name: "Computer Networks", grade: "C+" },
      { code: "CS305", name: "Operating Systems", grade: "C" },
      { code: "CS306", name: "Software Engineering", grade: "D" }
    ]
  },
  {
    enrollment: "220123416",
    name: "Harsh Vardhan",
    cgpa: 5.80,
    sgpa: 5.50,
    result: "FAIL",
    semester: "VI",
    branch: "Computer Science & Engg",
    subjects: [
      { code: "CS301", name: "Data Structures & Algorithms", grade: "F" },
      { code: "CS302", name: "Object Oriented Programming", grade: "C" },
      { code: "CS303", name: "Database Management Systems", grade: "D" },
      { code: "CS304", name: "Computer Networks", grade: "F" },
      { code: "CS305", name: "Operating Systems", grade: "C+" },
      { code: "CS306", name: "Software Engineering", grade: "C" }
    ]
  },
  {
    enrollment: "220123417",
    name: "Neha Choudhury",
    cgpa: 5.40,
    sgpa: 5.10,
    result: "FAIL",
    semester: "VI",
    branch: "Computer Science & Engg",
    subjects: [
      { code: "CS301", name: "Data Structures & Algorithms", grade: "D" },
      { code: "CS302", name: "Object Oriented Programming", grade: "F" },
      { code: "CS303", name: "Database Management Systems", grade: "C" },
      { code: "CS304", name: "Computer Networks", grade: "F" },
      { code: "CS305", name: "Operating Systems", grade: "D" },
      { code: "CS306", name: "Software Engineering", grade: "C" }
    ]
  },
  {
    enrollment: "220123418",
    name: "Gaurav Tripathi",
    cgpa: 4.95,
    sgpa: 4.80,
    result: "FAIL",
    semester: "VI",
    branch: "Computer Science & Engg",
    subjects: [
      { code: "CS301", name: "Data Structures & Algorithms", grade: "F" },
      { code: "CS302", name: "Object Oriented Programming", grade: "F" },
      { code: "CS303", name: "Database Management Systems", grade: "F" },
      { code: "CS304", name: "Computer Networks", grade: "D" },
      { code: "CS305", name: "Operating Systems", grade: "C" },
      { code: "CS306", name: "Software Engineering", grade: "D" }
    ]
  },
  {
    enrollment: "220123419",
    name: "Simran Kapoor",
    cgpa: 7.90,
    sgpa: 8.00,
    result: "PASS",
    semester: "VI",
    branch: "Computer Science & Engg",
    subjects: [
      { code: "CS301", name: "Data Structures & Algorithms", grade: "B+" },
      { code: "CS302", name: "Object Oriented Programming", grade: "A" },
      { code: "CS303", name: "Database Management Systems", grade: "B+" },
      { code: "CS304", name: "Computer Networks", grade: "B" },
      { code: "CS305", name: "Operating Systems", grade: "A" },
      { code: "CS306", name: "Software Engineering", grade: "B+" }
    ]
  },
  {
    enrollment: "220123420",
    name: "Yash Mehta",
    cgpa: 8.20,
    sgpa: 8.30,
    result: "PASS",
    semester: "VI",
    branch: "Computer Science & Engg",
    subjects: [
      { code: "CS301", name: "Data Structures & Algorithms", grade: "A" },
      { code: "CS302", name: "Object Oriented Programming", grade: "B+" },
      { code: "CS303", name: "Database Management Systems", grade: "A" },
      { code: "CS304", name: "Computer Networks", grade: "B+" },
      { code: "CS305", name: "Operating Systems", grade: "B+" },
      { code: "CS306", name: "Software Engineering", grade: "A" }
    ]
  }
];

export const SAMPLE_DATASETS: UniversityDataset[] = [
  {
    id: "dataset-btech-cse-2026",
    title: "B.Tech Computer Science & Engg - End Term Result",
    universityName: "National Institute of Technology & Science",
    department: "Department of Computer Science",
    batch: "2022 - 2026",
    semester: "Semester VI",
    academicYear: "2025-2026",
    uploadDate: "2026-06-15",
    students: SAMPLE_BTECH_STUDENTS,
    fileName: "NIT_CS_Sem6_Result_2026.pdf"
  },
  {
    id: "dataset-mca-2025",
    title: "MCA Master of Computer Applications - Semester IV",
    universityName: "State Technical University",
    department: "School of Information Technology",
    batch: "2023 - 2025",
    semester: "Semester IV",
    academicYear: "2024-2025",
    uploadDate: "2025-12-20",
    students: SAMPLE_BTECH_STUDENTS.slice(0, 15).map((s, idx) => ({
      ...s,
      enrollment: `23MCA00${idx + 1}`,
      semester: "IV",
      branch: "MCA",
      subjects: [
        { code: "MCA401", name: "Cloud Computing & DevOps", grade: idx % 3 === 0 ? "A+" : idx % 2 === 0 ? "A" : "B+" },
        { code: "MCA402", name: "Machine Learning & AI", grade: idx === 13 ? "F" : "A" },
        { code: "MCA403", name: "Cyber Security & Forensics", grade: "B+" },
        { code: "MCA404", name: "Full Stack Web Technologies", grade: "A+" }
      ]
    })),
    fileName: "STU_MCA_Sem4_Result.pdf"
  }
];
