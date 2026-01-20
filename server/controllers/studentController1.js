const fs = require("fs");
const path = require("path");
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
      formsStatus,
      schoolName,
      createdBy: req.user._id,
      admissionNumber,
      caseNumber,
      studentType,
      alternateContact,
      currentClass,
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

// @desc    Approve Student Admission (President/Secretary/Treasurer)
// @route   PUT /api/students/:id/approve
const approveStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    const { role } = req.user;
    const { status, remark } = req.body;

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    if (role === "president" || role === "admin") {
      student.approvals.president = { status, date: Date.now(), remark };
    } else if (role === "secretary") {
      student.approvals.secretary = { status, date: Date.now(), remark };
    } else if (role === "treasurer") {
      student.approvals.treasurer = { status, date: Date.now(), remark };
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
const getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate(
      "sponsor",
      "donorName donorEmail",
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

// @desc    Update Student Details (Profile, Alumni Request, etc.)
// @route   PUT /api/students/:id
const updateStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // =========================================================
    // 1. NEW LOGIC: ALUMNI EXIT REQUEST (Starts 3-Tier Flow)
    // =========================================================
    if (req.body.action === "request_exit") {
      if (student.admissionStatus !== "Active") {
        return res
          .status(400)
          .json({ message: "Only Active students can be marked for exit." });
      }

      // Change status to Pending and initialize the approval object
      student.admissionStatus = "Exit_Pending";
      student.exitRequest = {
        requestedDate: req.body.exitDate || Date.now(),
        reason: req.body.reason,
        approvals: {
          president: { status: "Pending" },
          secretary: { status: "Pending" },
          treasurer: { status: "Pending" },
        },
      };

      // Save initial alumni contact details if provided
      if (req.body.alumniDetails) {
        student.alumniDetails = req.body.alumniDetails;
      }

      await student.save();
      return res.json(student); // Return immediately
    }

    // =========================================================
    // 2. EXISTING LOGIC: STANDARD UPDATES
    // =========================================================

    // Update Arrays (Education & Health)
    if (req.body.educationHistory) {
      student.educationHistory = req.body.educationHistory;
    }
    if (req.body.healthRecords) {
      student.healthRecords = req.body.healthRecords;
    }

    // Update Activities
    if (req.body.activities) {
      student.activities = req.body.activities;
    }
    if (req.body.newActivityEntry) {
      student.activities.push(req.body.newActivityEntry);
    }

    // Update Sponsor
    if (req.body.sponsor !== undefined) {
      student.sponsor = req.body.sponsor;
    }

    // Update Basic Profile Info
    student.firstName = req.body.firstName || student.firstName;
    student.lastName = req.body.lastName || student.lastName;
    student.guardianName = req.body.guardianName || student.guardianName;
    student.contactNumber = req.body.contactNumber || student.contactNumber;
    student.address = req.body.address || student.address;
    student.dob = req.body.dob || student.dob;

    // Update Official Schema Fields
    student.admissionNumber =
      req.body.admissionNumber || student.admissionNumber;
    student.caseNumber = req.body.caseNumber || student.caseNumber;
    student.studentType = req.body.studentType || student.studentType;
    student.alternateContact =
      req.body.alternateContact || student.alternateContact;
    student.currentClass = req.body.currentClass || student.currentClass;

    // Update Expenses
    if (req.body.newExpense) {
      student.expenses.push(req.body.newExpense);
    }

    // Direct Status Update (Manual Override)
    if (req.body.admissionStatus) {
      student.admissionStatus = req.body.admissionStatus;
    }
    if (req.body.alumniDetails) {
      student.alumniDetails = req.body.alumniDetails;
    }

    const updatedStudent = await student.save();
    res.json(updatedStudent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Approve Alumni Exit (3-Tier)
// @route   PUT /api/students/:id/approve-exit
const approveAlumniExit = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const { role } = req.user;
    const { status } = req.body; // 'Approved' or 'Rejected'

    // Update specific approval slot
    if (role === "president" || role === "admin") {
      student.exitRequest.approvals.president = { status, date: Date.now() };
    } else if (role === "secretary") {
      student.exitRequest.approvals.secretary = { status, date: Date.now() };
    } else if (role === "treasurer") {
      student.exitRequest.approvals.treasurer = { status, date: Date.now() };
    } else {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Check if ALL 3 Approved
    const p = student.exitRequest.approvals.president.status === "Approved";
    const s = student.exitRequest.approvals.secretary.status === "Approved";
    const t = student.exitRequest.approvals.treasurer.status === "Approved";

    if (p && s && t) {
      student.admissionStatus = "Alumni"; // Final Conversion
    } else if (status === "Rejected") {
      student.admissionStatus = "Active"; // Revert to Active if rejected
    }

    await student.save();
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
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
const uploadDocuments = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const filePaths = req.files.map(
      (file) => `/${file.path.replace(/\\/g, "/")}`,
    );

    student.documents.push(...filePaths);
    await student.save();

    res.json({ message: "Documents uploaded", documents: student.documents });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete Document
const deleteDocument = async (req, res) => {
  try {
    const { filePath } = req.body;
    const student = await Student.findById(req.params.id);

    if (!student) return res.status(404).json({ message: "Student not found" });

    student.documents = student.documents.filter((doc) => doc !== filePath);
    await student.save();

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
const addStudentLeave = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    const { startDate, endDate, reason } = req.body;

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
const updateLeaveStatus = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

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

// @desc    Email Progress Report to Sponsor
const emailProgressReport = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate("sponsor");

    if (!student) return res.status(404).json({ message: "Student not found" });

    if (!student.sponsor || !student.sponsor.donorEmail) {
      return res
        .status(400)
        .json({ message: "No sponsor mapped or sponsor has no email." });
    }

    let buffers = [];
    const pdfPromise = new Promise((resolve) => {
      buildProgressPDF(
        student,
        (chunk) => buffers.push(chunk),
        () => resolve(Buffer.concat(buffers)),
      );
    });
    const pdfBuffer = await pdfPromise;

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
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update Statutory Forms & Inspections
const updateStatutoryInfo = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });

    if (req.body.formsStatus) {
      student.formsStatus = { ...student.formsStatus, ...req.body.formsStatus };
    }

    if (req.body.newInspection) {
      student.inspections.push(req.body.newInspection);
    }

    await student.save();
    res.json(student);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Import Students from CSV
const importStudents = async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "No file uploaded" });

  const results = [];
  const filePath = req.file.path;

  try {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (row) => {
        const getValue = (keywords) => {
          const rowKeys = Object.keys(row);
          const match = rowKeys.find((key) =>
            keywords.some((k) => key.toLowerCase().includes(k.toLowerCase())),
          );
          return match ? row[match] : "";
        };

        let fName = "Unknown",
          lName = ".";
        const rawName = getValue(["LastName", "Name", "StudentName"]);
        if (rawName) {
          const parts = rawName.trim().split(" ");
          lName = parts[0];
          fName = parts.slice(1).join(" ") || parts[0];
        }

        let normalizedBranch = "Headquarters";
        const rawBranch = getValue(["Branch", "branch"]);
        if (rawBranch) {
          if (rawBranch.toLowerCase().includes("sindhu"))
            normalizedBranch = "Karunya Sindu";
          else if (rawBranch.toLowerCase().includes("bharathi"))
            normalizedBranch = "Karunya Bharathi";
        }

        let sType = "General";
        const rawType = getValue(["Student_Type", "StudentType", "RecordType"]);
        if (rawType) {
          const tLower = rawType.toLowerCase();
          if (tLower.includes("semi")) sType = "Semi_Orphan";
          else if (tLower.includes("orphan")) sType = "Orphan";
          else if (tLower.includes("bpl")) sType = "BPL";
        }

        let birthDate = new Date();
        const rawDOB = getValue(["Birth", "DOB"]);
        if (rawDOB) {
          const parsed = new Date(rawDOB);
          if (!isNaN(parsed)) birthDate = parsed;
        }

        const adminNo = getValue(["CCI_Admin", "Admin_No"]);
        const caseNo = getValue(["Case_Profile", "CaseProfile"]);
        const mobile = getValue(["PersonMobile", "MobilePhone", "Contact"]);
        const altMobile = getValue(["KSS_Mobile", "Mobile_2"]);
        const cls = getValue(["class", "std", "grade"]);

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
            guardianName: "Legacy Record",
            address: "Imported Data",
            gender: "Male",
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

module.exports = {
  createStudent,
  getStudents,
  approveStudent,
  getStudentById,
  updateStudent, // <--- MERGED VERSION
  approveAlumniExit, // <--- NEW FUNCTION
  deleteStudent,
  uploadDocuments,
  deleteDocument,
  addStudentLeave,
  updateLeaveStatus,
  emailProgressReport,
  updateStatutoryInfo,
  importStudents,
};
