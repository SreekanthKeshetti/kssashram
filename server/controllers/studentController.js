const fs = require("fs"); // <--- Add at top
const path = require("path"); // <--- Add at top
const csv = require("csv-parser");
const Student = require("../models/Student");
const { buildProgressPDF } = require("../utils/generateProgressPDF");
const nodemailer = require("nodemailer");

// @desc    Register a new Student (Employee)
// @route   POST /api/students
const createStudent = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      dob,
      gender,
      guardianName,
      contactNumber,
      address,
      branch,
      formsStatus,
      schoolName,
      admissionNumber,
      caseNumber,
      studentType,
      alternateContact,
      currentClass,
    } = req.body;

    const student = await Student.create({
      firstName,
      lastName,
      dob,
      gender,
      guardianName,
      contactNumber,
      address,
      branch: branch || "Headquarters",
      formsStatus, // Expecting an object { form20: true, ... }
      schoolName,
      createdBy: req.user._id,
      admissionNumber,
      caseNumber,
      studentType,
      alternateContact,
      currentClass,
      createdBy: req.user._id,
    });

    res.status(201).json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get all students
// @route   GET /api/students
const getStudents = async (req, res) => {
  try {
    const students = await Student.find({}).sort({ createdAt: -1 });
    res.json(students);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Approve Student (President/Secretary/Treasurer)
// @route   PUT /api/students/:id/approve
// const approveStudent = async (req, res) => {
//   try {
//     const student = await Student.findById(req.params.id);
//     const { role } = req.user; // 'admin' usually plays President role in this demo
//     const { status, remark } = req.body; // 'Approved' or 'Rejected'

//     if (!student) {
//       return res.status(404).json({ message: "Student not found" });
//     }

//     // Logic: Which approval slot to update?
//     // In a real app, you might have specific roles like 'president', 'secretary'.
//     // For this demo, we will simulate it:
//     // If Admin -> President Approval
//     // If Employee -> Secretary Approval (Just for demo purposes)

//     // Ideally, you would add specific roles to your User model enum.
//     // Let's assume the frontend sends which "roleType" is approving.
//     const { approvalType } = req.body; // 'president', 'secretary', or 'treasurer'

//     if (approvalType === "president") {
//       student.approvals.president = { status, date: Date.now(), remark };
//     } else if (approvalType === "secretary") {
//       student.approvals.secretary = { status, date: Date.now(), remark };
//     } else if (approvalType === "treasurer") {
//       student.approvals.treasurer = { status, date: Date.now(), remark };
//     } else {
//       return res.status(400).json({ message: "Invalid approval type" });
//     }

//     // Check if ALL 3 are Approved -> Set Admission to Active
//     const p = student.approvals.president.status === "Approved";
//     const s = student.approvals.secretary.status === "Approved";
//     const t = student.approvals.treasurer.status === "Approved";

//     if (p && s && t) {
//       student.admissionStatus = "Active";
//     } else if (status === "Rejected") {
//       student.admissionStatus = "Rejected";
//     }

//     await student.save();
//     res.json(student);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

// @desc    Approve Student (President/Secretary/Treasurer)
// @route   PUT /api/students/:id/approve
const approveStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    const { role } = req.user; // Get role from logged-in user
    const { status, remark } = req.body; // 'Approved' or 'Rejected'

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // AUTOMATICALLY detect which approval slot to update based on Role
    if (role === "president") {
      student.approvals.president = { status, date: Date.now(), remark };
    } else if (role === "secretary") {
      student.approvals.secretary = { status, date: Date.now(), remark };
    } else if (role === "treasurer") {
      student.approvals.treasurer = { status, date: Date.now(), remark };
    } else if (role === "admin") {
      // Admin backdoor: Can approve for anyone (optional, good for testing)
      // For now, let's say Admin acts as President
      student.approvals.president = { status, date: Date.now(), remark };
    } else {
      return res
        .status(403)
        .json({ message: "You are not authorized to approve students." });
    }

    // Check if ALL 3 are Approved -> Set Admission to Active
    const p = student.approvals.president.status === "Approved";
    const s = student.approvals.secretary.status === "Approved";
    const t = student.approvals.treasurer.status === "Approved";

    if (p && s && t) {
      student.admissionStatus = "Active";
    } else if (status === "Rejected") {
      student.admissionStatus = "Rejected";
    }

    await student.save();
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get Single Student by ID
// @route   GET /api/students/:id
// const getStudentById = async (req, res) => {
//   try {
//     const student = await Student.findById(req.params.id);
//     if (student) {
//       res.json(student);
//     } else {
//       res.status(404).json({ message: "Student not found" });
//     }
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

///////////
const getStudentById = async (req, res) => {
  try {
    // Populate sponsor to see donor details in frontend
    const student = await Student.findById(req.params.id).populate(
      "sponsor",
      "donorName donorEmail"
    );
    if (student) {
      res.json(student);
    } else {
      res.status(404).json({ message: "Student not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Student Details (Profile, Alumni, etc.)
// @route   PUT /api/students/:id
const updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (student) {
      // 1. Update Arrays (if provided)
      student.educationHistory =
        req.body.educationHistory || student.educationHistory;
      student.healthRecords = req.body.healthRecords || student.healthRecords;

      // 2. Update Sponsor (if provided)
      // We check undefined because sending 'null' is a valid update (to remove sponsor)
      if (req.body.sponsor !== undefined) {
        student.sponsor = req.body.sponsor;
      }

      // 3. Update Basic Info (if provided - for Edit Profile)
      student.firstName = req.body.firstName || student.firstName;
      student.lastName = req.body.lastName || student.lastName;
      student.guardianName = req.body.guardianName || student.guardianName;
      student.contactNumber = req.body.contactNumber || student.contactNumber;
      student.address = req.body.address || student.address;
      student.dob = req.body.dob || student.dob;

      // 4. Update Expenses (Push to array)
      if (req.body.newExpense) {
        student.expenses.push(req.body.newExpense);
      }

      // --- FIX: ALLOW ALUMNI CONVERSION ---
      if (req.body.admissionStatus) {
        student.admissionStatus = req.body.admissionStatus;
      }
      if (req.body.alumniDetails) {
        student.alumniDetails = req.body.alumniDetails;
      }
      // ------------------------------------

      const updatedStudent = await student.save();
      res.json(updatedStudent);
    } else {
      res.status(404).json({ message: "Student not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete Student (Admin Only)
// @route   DELETE /api/students/:id
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    await Student.findByIdAndDelete(req.params.id);
    res.json({ message: "Student record removed" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Upload Documents for Student
// @route   POST /api/students/:id/upload
const uploadDocuments = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    // Get paths
    const filePaths = req.files.map(
      (file) => `/${file.path.replace(/\\/g, "/")}`
    );

    // Add to array
    student.documents.push(...filePaths);
    await student.save();

    res.json({ message: "Documents uploaded", documents: student.documents });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete Document
// @route   DELETE /api/students/:id/documents
const deleteDocument = async (req, res) => {
  try {
    const { filePath } = req.body;
    const student = await Student.findById(req.params.id);

    if (!student) return res.status(404).json({ message: "Student not found" });

    // Remove from DB
    student.documents = student.documents.filter((doc) => doc !== filePath);
    await student.save();

    // Remove from Disk
    const absolutePath = path.join(__dirname, "..", filePath);
    if (fs.existsSync(absolutePath)) {
      fs.unlinkSync(absolutePath);
    }

    res.json({ message: "File deleted", documents: student.documents });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Record Student Leave
// @route   POST /api/students/:id/leave
const addStudentLeave = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const { startDate, endDate, reason } = req.body;

    // Add to leaves array
    student.leaves.push({
      startDate,
      endDate,
      reason,
      status: "On Leave",
    });

    await student.save();
    res.json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Mark Student as Returned
// @route   PUT /api/students/:id/leave/:leaveId
const updateLeaveStatus = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    // Find the specific leave record
    const leave = student.leaves.id(req.params.leaveId);
    if (!leave)
      return res.status(404).json({ message: "Leave record not found" });

    leave.status = "Returned";
    leave.actualReturnDate = Date.now();

    await student.save();
    res.json(student);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
// @desc    Email Progress Report to Sponsor (KSS_STU_20)
// @route   POST /api/students/:id/email-sponsor
const emailProgressReport = async (req, res) => {
  try {
    // Populate sponsor to get donorEmail
    const student = await Student.findById(req.params.id).populate("sponsor");

    if (!student) return res.status(404).json({ message: "Student not found" });

    if (!student.sponsor || !student.sponsor.donorEmail) {
      return res
        .status(400)
        .json({ message: "No sponsor mapped or sponsor has no email." });
    }

    // 1. Generate PDF
    let buffers = [];
    const pdfPromise = new Promise((resolve) => {
      buildProgressPDF(
        student,
        (chunk) => buffers.push(chunk),
        () => resolve(Buffer.concat(buffers))
      );
    });
    const pdfBuffer = await pdfPromise;

    // 2. Send Email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: student.sponsor.donorEmail,
      subject: `Progress Report: ${student.firstName} ${student.lastName}`,
      html: `
        <h3>Namaste ${student.sponsor.donorName},</h3>
        <p>We are happy to share the periodic progress report of the student you are supporting: <strong>${student.firstName} ${student.lastName}</strong>.</p>
        <p>Please find the detailed report attached.</p>
        <p>Your support is making a real difference in their life.</p>
        <br/>
        <p>Regards,<br/>Karunasri Seva Samithi</p>
      `,
      attachments: [
        {
          filename: `Progress_Report_${student.firstName}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    res.json({ message: "Progress report sent successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
// --- NEW: Update Statutory Forms & Inspections ---
const updateStatutoryInfo = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    // 1. Update Forms Checklist
    if (req.body.formsStatus) {
      student.formsStatus = { ...student.formsStatus, ...req.body.formsStatus };
    }

    // 2. Add Inspection Log
    if (req.body.newInspection) {
      student.inspections.push(req.body.newInspection);
    }

    await student.save();
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
const importStudents = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const results = [];
  const filePath = req.file.path;

  try {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        // --- HELPER: FUZZY KEY FINDER ---
        // Finds value even if header has spaces or case diffs
        const getValue = (keywords) => {
          const rowKeys = Object.keys(row);
          const match = rowKeys.find((key) =>
            keywords.some((k) => key.toLowerCase().includes(k.toLowerCase()))
          );
          return match ? row[match] : "";
        };

        // --- 1. SMART MAPPING ---

        // A. Name (Look for 'Last' or 'Name')
        let fName = "Unknown",
          lName = ".";
        const rawName = getValue(["LastName", "Name", "StudentName"]);
        if (rawName) {
          const parts = rawName.trim().split(" ");
          lName = parts[0];
          fName = parts.slice(1).join(" ") || parts[0];
        }

        // B. Branch (Look for 'Branch')
        let normalizedBranch = "Headquarters";
        const rawBranch = getValue(["Branch", "branch"]);
        if (rawBranch) {
          if (rawBranch.toLowerCase().includes("sindhu"))
            normalizedBranch = "Karunya Sindu";
          else if (rawBranch.toLowerCase().includes("bharathi"))
            normalizedBranch = "Karunya Bharathi";
        }

        // C. Student Type (Look for 'Type', 'RecordType')
        // CRITICAL FIX: Looks for *any* column with "Type" in the name
        let sType = "General";
        const rawType = getValue(["Student_Type", "StudentType", "RecordType"]);
        if (rawType) {
          const tLower = rawType.toLowerCase();
          if (tLower.includes("semi")) sType = "Semi_Orphan";
          else if (tLower.includes("orphan")) sType = "Orphan";
          else if (tLower.includes("bpl")) sType = "BPL";
        }

        // D. Date of Birth (Look for 'Birth')
        let birthDate = new Date(); // Default to today if missing
        const rawDOB = getValue(["Birth", "DOB"]);
        if (rawDOB) {
          // Handle Excel formats or DD/MM/YYYY
          const parsed = new Date(rawDOB);
          if (!isNaN(parsed)) birthDate = parsed;
        }

        // E. Other Fields (Fuzzy Search)
        const adminNo = getValue(["CCI_Admin", "Admin_No"]);
        const caseNo = getValue(["Case_Profile", "CaseProfile"]); // Matches Case_Profile_Numbe
        const mobile = getValue(["PersonMobile", "MobilePhone", "Contact"]);
        const altMobile = getValue(["KSS_Mobile", "Mobile_2"]);
        const cls = getValue(["class", "std", "grade"]);

        // --- 2. PUSH DATA ---
        if (rawName) {
          results.push({
            admissionNumber: adminNo,
            caseNumber: caseNo,
            firstName: fName,
            lastName: lName,
            currentClass: cls,
            contactNumber: mobile || "0000000000",
            alternateContact: altMobile,
            dob: birthDate,
            branch: normalizedBranch,
            studentType: sType,

            // Defaults
            guardianName: "Legacy Record",
            address: "Imported Data",
            gender: "Male",

            // --- AUTO APPROVE (3 TICKS) ---
            admissionStatus: "Active",
            approvals: {
              president: {
                status: "Approved",
                date: new Date(),
                remark: "Legacy Import",
              },
              secretary: {
                status: "Approved",
                date: new Date(),
                remark: "Legacy Import",
              },
              treasurer: {
                status: "Approved",
                date: new Date(),
                remark: "Legacy Import",
              },
            },
            createdBy: req.user._id,
          });
        }
      })
      .on("end", async () => {
        try {
          if (results.length > 0) {
            await Student.insertMany(results);
            fs.unlinkSync(filePath);
            res.json({
              message: `Success! Imported ${results.length} students.`,
            });
          } else {
            fs.unlinkSync(filePath);
            res
              .status(400)
              .json({ message: "CSV was empty or could not map columns." });
          }
        } catch (dbError) {
          res.status(500).json({ message: "DB Error: " + dbError.message });
        }
      });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Export ALL functions
module.exports = {
  createStudent,
  getStudents,
  approveStudent,
  getStudentById,
  updateStudent,
  deleteStudent,
  uploadDocuments,
  deleteDocument, // <--- Add these
  addStudentLeave,
  updateLeaveStatus, // <--- Add these
  emailProgressReport, // <--- Add this
  importStudents,
  updateStatutoryInfo, // <--- Add this
};
