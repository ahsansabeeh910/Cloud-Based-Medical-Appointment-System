"""
Generate the Cloud & Web Services Lab Project Report (.docx).

The document mirrors the formatting of "Cloud Lab Synopsis.docx" (JIIT title
page, team-member table, project outline) and expands it into a full ~11 page
project report. All prose is written specifically for this project's source
code, so the report is original and plagiarism-free.
"""

from docx import Document
from docx.shared import Pt, RGBColor, Inches
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml.ns import qn
from docx.oxml import OxmlElement


# --------------------------------------------------------------------------
# Document + base style
# --------------------------------------------------------------------------
doc = Document()

normal = doc.styles['Normal']
normal.font.name = 'Times New Roman'
normal.font.size = Pt(12)
normal.paragraph_format.space_after = Pt(6)
normal.paragraph_format.line_spacing = 1.15

# 1-inch margins
for section in doc.sections:
    section.top_margin = section.bottom_margin = 1440 * 1 / 1440 * 914400 / 914400 and section.top_margin
# (leave default 1" margins)


def set_cell_bg(cell, hex_color):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = OxmlElement('w:shd')
    shd.set(qn('w:val'), 'clear')
    shd.set(qn('w:color'), 'auto')
    shd.set(qn('w:fill'), hex_color)
    tcPr.append(shd)


def para(text='', size=12, bold=False, italic=False, align=None,
         space_after=6, space_before=0, color=None):
    p = doc.add_paragraph()
    if align is not None:
        p.alignment = align
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.space_before = Pt(space_before)
    if text:
        r = p.add_run(text)
        r.font.size = Pt(size)
        r.bold = bold
        r.italic = italic
        if color:
            r.font.color.rgb = RGBColor(*color)
    return p


def bullet(text, size=12, bold_lead=None):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.space_after = Pt(3)
    if bold_lead:
        r = p.add_run(bold_lead)
        r.bold = True
        r.font.size = Pt(size)
        r2 = p.add_run(text)
        r2.font.size = Pt(size)
    else:
        r = p.add_run(text)
        r.font.size = Pt(size)
    return p


def numbered(text, size=12):
    p = doc.add_paragraph(style='List Number')
    p.paragraph_format.space_after = Pt(3)
    r = p.add_run(text)
    r.font.size = Pt(size)
    return p


def heading(text, size=15):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(10)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.keep_with_next = True
    r = p.add_run(text)
    r.bold = True
    r.font.size = Pt(size)
    r.font.color.rgb = RGBColor(0x1F, 0x38, 0x64)
    # bottom border
    pPr = p._p.get_or_add_pPr()
    pbdr = OxmlElement('w:pBdr')
    bottom = OxmlElement('w:bottom')
    bottom.set(qn('w:val'), 'single')
    bottom.set(qn('w:sz'), '6')
    bottom.set(qn('w:space'), '2')
    bottom.set(qn('w:color'), '1F3864')
    pbdr.append(bottom)
    pPr.append(pbdr)
    return p


def subheading(text, size=13):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.keep_with_next = True
    r = p.add_run(text)
    r.bold = True
    r.font.size = Pt(size)
    r.font.color.rgb = RGBColor(0x2E, 0x54, 0x96)
    return p


def page_break():
    doc.add_page_break()


def add_image(path, width_inches, caption=None):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(6)
    p.paragraph_format.space_after = Pt(2)
    run = p.add_run()
    run.add_picture(path, width=Inches(width_inches))
    if caption:
        para(caption, 10, italic=True, align=WD_ALIGN_PARAGRAPH.CENTER,
             space_after=8, space_before=0)


def styled_table(headers, rows, col_widths=None, header_bg='1F3864',
                 header_color=(255, 255, 255), font_size=10.5):
    table = doc.add_table(rows=1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.style = 'Table Grid'
    hdr = table.rows[0].cells
    for i, h in enumerate(headers):
        hdr[i].text = ''
        p = hdr[i].paragraphs[0]
        r = p.add_run(h)
        r.bold = True
        r.font.size = Pt(font_size)
        r.font.color.rgb = RGBColor(*header_color)
        set_cell_bg(hdr[i], header_bg)
    for ri, row in enumerate(rows):
        cells = table.add_row().cells
        for i, val in enumerate(row):
            cells[i].text = ''
            p = cells[i].paragraphs[0]
            r = p.add_run(str(val))
            r.font.size = Pt(font_size)
            if ri % 2 == 1:
                set_cell_bg(cells[i], 'EEF2F8')
    return table


# ==========================================================================
# TITLE PAGE  (mirrors the synopsis title page)
# ==========================================================================
para("Jaypee Institute of Information Technology", 18, bold=True,
     align=WD_ALIGN_PARAGRAPH.CENTER, space_after=0, space_before=24)
para("Sector 62, Noida", 14, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER,
     space_after=36)

para("Cloud and Web Services Lab [17M15CS121]", 15, bold=True,
     align=WD_ALIGN_PARAGRAPH.CENTER, space_after=0)
para("Project Report", 20, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER,
     space_after=24)

para("Title: “Cloud-Based Medical Appointment System”", 16, bold=True,
     align=WD_ALIGN_PARAGRAPH.CENTER, space_after=6)
para("(MediConnect)", 13, italic=True, align=WD_ALIGN_PARAGRAPH.CENTER,
     space_after=36)

para("Submitted To:", 13, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER,
     space_after=0)
para("Dr. Anil Kumar Mahto", 13, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER,
     space_after=0)
para("Assistant Professor (Senior Grade)", 12,
     align=WD_ALIGN_PARAGRAPH.CENTER, space_after=0)
para("Dept. of CSE, JIIT Sector 62, Noida", 12,
     align=WD_ALIGN_PARAGRAPH.CENTER, space_after=30)

para("TEAM MEMBERS", 14, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER,
     space_after=8)

members = styled_table(
    ["Name", "Enrollment No.", "Batch"],
    [["Sabeeh Ahsan", "22803006", "B12"],
     ["Harleen Kaur", "22803009", "B12"],
     ["Aryan Khanna", "22803028", "B12"]],
    font_size=12,
)
for row in members.rows:
    for cell in row.cells:
        cell.paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER

page_break()

# ==========================================================================
# PROJECT OUTLINE  (Table of Contents)
# ==========================================================================
para("PROJECT OUTLINE", 16, bold=True, align=WD_ALIGN_PARAGRAPH.CENTER,
     space_after=10)

outline = styled_table(
    ["S. No.", "Title", "Page No."],
    [["1", "Abstract", "3"],
     ["2", "Problem Statement", "3"],
     ["3", "Objectives", "4"],
     ["4", "System Architecture & Flowchart", "5"],
     ["5", "Implementation Details", "6"],
     ["6", "Database Design & API Endpoints", "8"],
     ["7", "Cloud Deployment & Security", "9"],
     ["8", "Tools & Technologies Used", "10"],
     ["9", "Results & Outcomes", "10"],
     ["10", "Conclusion & Future Scope", "11"],
     ["11", "References", "12"]],
    font_size=12,
)
for row in outline.rows:
    row.cells[0].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER
    row.cells[2].paragraphs[0].alignment = WD_ALIGN_PARAGRAPH.CENTER

page_break()

# ==========================================================================
# 1. ABSTRACT
# ==========================================================================
heading("1.  Abstract")
para("The management of doctor appointments and patient records is still "
     "handled manually in a large number of clinics and small hospitals. This "
     "leads to overlapping bookings, misplaced prescriptions and long waiting "
     "queues. MediConnect is a cloud-hosted web application that digitises "
     "this entire workflow. It lets patients discover doctors by "
     "specialisation, reserve a free time slot in real time, and later revisit "
     "their consultation history, while doctors manage their own schedule and "
     "issue digital prescriptions that are stored in the cloud.")
para("The application is built on the MERN stack – MongoDB for data, "
     "Express and Node.js for the REST API, and React (bundled with Vite) for "
     "the user interface. Instead of a single machine, the system is deployed "
     "on Amazon Web Services using a two-tier server layout: a public web "
     "server that faces the internet and a private database server that is "
     "reachable only from inside the virtual network. Prescription files are "
     "kept in an Amazon S3 bucket and served back through short-lived signed "
     "links. This report describes the problem being solved, the design of the "
     "system, the concrete implementation of each module, and the cloud "
     "infrastructure that makes the platform secure and reachable from any "
     "device with a browser.")

# ==========================================================================
# 2. PROBLEM STATEMENT
# ==========================================================================
heading("2.  Problem Statement")
para("Booking a medical appointment through a phone call or a walk-in visit is "
     "inefficient for both sides of the counter. Patients have no visibility "
     "into which slots are genuinely free, so they are often turned away or "
     "asked to wait. Clinics maintain appointment diaries and paper "
     "prescriptions that are easy to lose, hard to search, and impossible to "
     "access remotely. When a patient needs an old prescription, retrieving it "
     "means physically returning to the clinic.")
para("The core problems this project targets are:")
bullet("there is no shared, real-time view of a doctor’s availability, "
       "which causes double-booking of the same slot;", bold_lead="No live availability – ")
bullet("prescriptions and reports exist only on paper and are neither "
       "backed up nor accessible online;", bold_lead="Paper records – ")
bullet("patient and doctor identities are not verified, so anyone could view "
       "or alter another person’s data;", bold_lead="Weak access control – ")
bullet("an on-premise system tied to one computer cannot be reached outside "
       "the clinic and fails if that machine goes down.", bold_lead="No remote access – ")
para("MediConnect answers these gaps with a single web platform that keeps "
     "one authoritative copy of every appointment, authenticates each user "
     "before granting access, stores prescriptions durably in the cloud, and "
     "remains available over the public internet.")

# ==========================================================================
# 3. OBJECTIVES
# ==========================================================================
heading("3.  Objectives")
para("The project was carried out with the following concrete objectives:")
numbered("Design a role-aware platform that serves two distinct user types "
         "– patients and doctors – from a single codebase.")
numbered("Implement stateless authentication using JSON Web Tokens (JWT) and "
         "store passwords only in hashed form using bcrypt.")
numbered("Allow patients to search registered doctors by specialisation and "
         "view each doctor’s experience, fee and available days.")
numbered("Provide slot-based booking that rejects a slot the moment it is "
         "taken, preventing two patients from reserving the same time.")
numbered("Give doctors a dashboard to approve, reject, complete or annotate "
         "the appointments assigned to them.")
numbered("Enable secure upload of prescription images/PDFs to Amazon S3 and "
         "return them through expiring pre-signed URLs.")
numbered("Expose all functionality through a clean, versioned REST API "
         "consumed by a React single-page application.")
numbered("Deploy the whole system on AWS with a network design that isolates "
         "the database from the public internet.")

# ==========================================================================
# 4. ARCHITECTURE & FLOWCHART
# ==========================================================================
heading("4.  System Architecture & Flowchart")
subheading("4.1  Two-Tier Cloud Architecture")
para("Rather than running everything on one server, the deployment is split "
     "into two Amazon EC2 instances placed inside the same Virtual Private "
     "Cloud (VPC). This separation limits the damage an attacker can do and "
     "lets each tier be scaled independently.")
bullet("hosts the Node.js/Express API under a PM2 process manager and serves "
       "the compiled React files through Nginx. Nginx also reverse-proxies "
       "every /api request to the backend on port 5000. This instance holds a "
       "public IP and accepts HTTP traffic on port 80.",
       bold_lead="Web Server (public tier) – ")
bullet("runs a self-hosted MongoDB Community instance. Its security group "
       "allows inbound traffic on port 27017 only from the web server’s "
       "private IP, so the database has no exposure to the open internet.",
       bold_lead="Database Server (private tier) – ")
bullet("a managed Amazon S3 bucket stores uploaded prescription files. The "
       "backend writes to it with the AWS SDK and hands clients temporary "
       "signed links instead of making the bucket public.",
       bold_lead="Object Storage – ")

subheading("4.2  Request Flow")
para("A typical request travels through the stack as follows: the browser "
     "loads the React app from Nginx; the app calls a REST endpoint such as "
     "POST /api/appointments; Nginx forwards it to Express; a middleware "
     "verifies the JWT; the controller reads or writes MongoDB over the "
     "private link; and, for file operations, the backend talks to S3. The "
     "textual flowchart below captures the end-to-end journey of a booking.")

flow = styled_table(
    ["Stage", "What happens"],
    [["1. Access", "Patient/doctor registers or logs in → server issues a signed JWT."],
     ["2. Search", "Patient queries doctors by specialisation via GET /api/doctors."],
     ["3. Select", "System fetches the chosen doctor’s free slots for the picked date."],
     ["4. Book", "POST /api/appointments checks for conflicts and stores the booking as 'pending'."],
     ["5. Manage", "Doctor approves / rejects / completes the request from the dashboard."],
     ["6. Prescribe", "Doctor uploads a prescription file → stored in Amazon S3."],
     ["7. Review", "Patient reopens history and views prescriptions through a signed URL."]],
    col_widths=None, font_size=11,
)
para("Figure 1: End-to-end workflow of the Cloud-Based Medical Appointment "
     "System.", 10, italic=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_before=4)

page_break()

# ==========================================================================
# 5. IMPLEMENTATION DETAILS
# ==========================================================================
heading("5.  Implementation Details")
para("The backend follows a layered structure – routes delegate to "
     "controllers, controllers use Mongoose models, and cross-cutting concerns "
     "(authentication, validation, error handling, file upload) live in "
     "dedicated middleware. Each module is described below.")

subheading("5.1  Authentication & Authorisation")
para("Registration accepts a name, email, password and role. The password is "
     "never stored in plain text: a Mongoose pre-save hook runs bcrypt with a "
     "salt factor of 12 before the document is written, and the password "
     "field is excluded from queries by default. On successful login the "
     "server signs a JWT containing the user id with a 30-day expiry. Every "
     "protected route runs an auth middleware that reads the Bearer token, "
     "verifies its signature, loads the matching user and attaches it to the "
     "request. Because the token is self-contained, the server keeps no "
     "session state, which is what allows the API to scale horizontally.")

subheading("5.2  Doctor Discovery")
para("When a user registers as a doctor, a linked Doctor profile is created "
     "holding professional attributes – specialisation, years of "
     "experience, qualification, consultation fee, hospital and weekly "
     "available slots. Patients browse these profiles through the doctors "
     "endpoint, which supports filtering by specialisation so a patient can, "
     "for example, list only cardiologists.")

subheading("5.3  Conflict-Free Appointment Booking")
para("Booking is the most safety-critical operation, so the controller "
     "performs two independent conflict checks before persisting anything. "
     "First it confirms that the requested doctor, date and time slot are not "
     "already reserved by another patient in a pending or approved state. "
     "Second it confirms the requesting patient does not already hold an "
     "appointment in that same slot. Only if both checks pass is the record "
     "created with an initial status of 'pending'. The date is normalised to "
     "the full UTC day so that a slot comparison is not thrown off by time "
     "components, and compound indexes on (doctorId, date, timeSlot) keep "
     "these look-ups fast.")

subheading("5.4  Appointment Lifecycle")
para("An appointment moves through a controlled set of states – pending, "
     "approved, rejected, completed and cancelled. The rules for who may "
     "trigger which transition are enforced on the server, not merely in the "
     "UI:")
bullet("a patient may only cancel their own booking, and only while it is "
       "still pending or approved;")
bullet("a doctor may only approve, reject or complete appointments that "
       "belong to their own profile;")
bullet("once an appointment is completed or cancelled it is locked against "
       "further changes.")
para("Every read endpoint also checks ownership, so one user can never view "
     "or modify another user’s appointment even by guessing its id.")

subheading("5.5  Cloud Prescription Uploads")
para("Doctors attach a prescription to a completed consultation. The file is "
     "received in memory by Multer, then streamed to Amazon S3 through the "
     "AWS SDK v3 with a randomly generated UUID key so filenames never "
     "collide. The bucket itself is kept private; when a patient later opens "
     "a prescription, the backend generates a pre-signed URL that grants read "
     "access for one hour and then expires. This gives the durability of "
     "cloud storage without ever exposing the bucket publicly.")

subheading("5.6  Frontend (React SPA)")
para("The client is a Vite-powered React single-page application. Routing is "
     "handled by React Router, authentication state lives in a React Context "
     "that persists the JWT, and a ProtectedRoute component guards pages that "
     "require a login. A central Axios service attaches the token to every "
     "request and centralises error handling, while toast notifications give "
     "the user immediate feedback. Dedicated pages exist for doctor search, "
     "booking, the patient and doctor dashboards, appointment history and "
     "profile management.")

page_break()

# ==========================================================================
# 6. DATABASE DESIGN & API
# ==========================================================================
heading("6.  Database Design & API Endpoints")
subheading("6.1  Data Model")
para("MongoDB stores four collections. The User collection is common to both "
     "roles; a Doctor document extends a user with professional details; "
     "Appointment and Prescription documents reference users and doctors by "
     "ObjectId.")

styled_table(
    ["Collection", "Key Fields", "Purpose"],
    [["User", "name, email (unique), password (hashed), role, phone",
      "Login identity for patients and doctors."],
     ["Doctor", "userId, specialisation, experience, qualification, fee, availableSlots",
      "Professional profile linked 1-to-1 with a user."],
     ["Appointment", "patientId, doctorId, date, timeSlot, reason, status, notes",
      "A booking and its lifecycle state."],
     ["Prescription", "appointmentId, doctorId, patientId, fileKey, fileUrl",
      "Pointer to the file stored in Amazon S3."]],
    font_size=10.5,
)
para("Figure 2: Core collections and their relationships.", 10, italic=True,
     align=WD_ALIGN_PARAGRAPH.CENTER, space_before=4)

subheading("6.2  REST API Surface")
para("All resources are exposed under a common /api prefix and follow REST "
     "conventions. The main endpoints are summarised below.")

styled_table(
    ["Method & Path", "Access", "Description"],
    [["POST /api/auth/register", "Public", "Create a patient or doctor account."],
     ["POST /api/auth/login", "Public", "Authenticate and receive a JWT."],
     ["GET /api/auth/profile", "Private", "Fetch the logged-in user’s profile."],
     ["GET /api/doctors", "Public", "List / filter doctors by specialisation."],
     ["POST /api/appointments", "Patient", "Book a conflict-checked appointment."],
     ["GET /api/appointments", "Private", "List appointments for the current user."],
     ["PATCH /api/appointments/:id", "Private", "Approve / reject / complete / cancel."],
     ["GET /api/appointments/history", "Private", "Fetch past/closed appointments."],
     ["POST /api/prescriptions", "Doctor", "Upload a prescription file to S3."],
     ["GET /api/health", "Public", "Service health probe."]],
    font_size=10.5,
)
para("Figure 3: Summary of the REST API endpoints.", 10, italic=True,
     align=WD_ALIGN_PARAGRAPH.CENTER, space_before=4)

page_break()

# ==========================================================================
# 7. CLOUD DEPLOYMENT & SECURITY
# ==========================================================================
heading("7.  Cloud Deployment & Security")
subheading("7.1  Provisioning the Infrastructure")
para("Two t3.micro Ubuntu 24.04 instances were launched in the ap-south-1 "
     "(Mumbai) region. Provisioning was scripted with the AWS CLI so the "
     "environment is reproducible: the script reads the running web "
     "server’s VPC, subnet and private IP from the instance metadata "
     "service, creates a dedicated security group for the database, and opens "
     "port 27017 exclusively to the web server’s private address. The "
     "database instance is then launched into the same subnet and its private "
     "IP is recorded for the backend connection string.")

subheading("7.2  Web Tier Configuration")
para("On the web server, Node.js 20, Nginx and PM2 are installed by a setup "
     "script. The React client is built for production and its static files "
     "are copied into the Nginx web root. Nginx serves the single-page app "
     "and proxies /api/ traffic to the Node process on port 5000, while PM2 "
     "keeps the backend alive across crashes and reboots.")

subheading("7.3  Security Measures")
bullet("The database accepts connections only from the web server’s "
       "private IP; it is invisible to the public internet.",
       bold_lead="Network isolation – ")
bullet("Passwords are hashed with bcrypt (cost 12); the raw password is never "
       "stored or logged.", bold_lead="Credential hashing – ")
bullet("Every protected endpoint requires a valid signed JWT, and controllers "
       "additionally verify resource ownership.",
       bold_lead="Token authentication – ")
bullet("The S3 bucket is private; files are reached only through pre-signed "
       "URLs that expire after one hour.", bold_lead="Scoped file access – ")
bullet("express-validator sanitises and validates request bodies to reject "
       "malformed or malicious input.", bold_lead="Input validation – ")

subheading("7.4  AWS Services Used")
styled_table(
    ["AWS Service", "Role in the Project"],
    [["EC2 (Web)", "Runs the Node/Express API and serves the React build via Nginx."],
     ["EC2 (Database)", "Hosts a private, self-managed MongoDB instance."],
     ["S3", "Durable object storage for prescription files."],
     ["IAM", "Programmatic credentials scoped to the S3 bucket for the backend."],
     ["VPC / Security Groups", "Network isolation between the public and private tiers."]],
    font_size=10.5,
)

# ==========================================================================
# 8. TOOLS USED
# ==========================================================================
heading("8.  Tools & Technologies Used")
styled_table(
    ["Layer", "Technologies"],
    [["Frontend", "React 18, Vite, React Router DOM, Axios, React Hot Toast, Vanilla CSS"],
     ["Backend", "Node.js 20, Express.js, Mongoose ODM, JWT, bcryptjs, Multer, express-validator"],
     ["Database", "MongoDB Community Edition (self-hosted on EC2)"],
     ["Cloud", "AWS EC2, AWS S3, AWS IAM, VPC & Security Groups"],
     ["Server Ops", "Nginx (reverse proxy), PM2 (process manager), AWS CLI"],
     ["Tooling", "Visual Studio Code, Git & GitHub, Postman"]],
    font_size=11,
)
para("Figure 4: Technology stack grouped by layer.", 10, italic=True,
     align=WD_ALIGN_PARAGRAPH.CENTER, space_before=4)

# ==========================================================================
# 9. RESULTS & OUTCOMES
# ==========================================================================
heading("9.  Results & Outcomes")
para("The completed system meets each objective set out at the start:")
bullet("Patients and doctors can register, log in and stay authenticated "
       "across sessions through JWT tokens.")
bullet("Doctors are searchable by specialisation, and their availability, fee "
       "and experience are shown before booking.")
bullet("The double-booking guard was verified by attempting to reserve an "
       "already-taken slot; the API correctly rejects it with a clear message.")
bullet("Doctors can drive an appointment through its full lifecycle from the "
       "dashboard, and patients see the updated status immediately.")
bullet("Prescriptions upload successfully to Amazon S3 and open through "
       "time-limited signed links, confirming the storage integration.")
bullet("The application is reachable over the public internet via the web "
       "server’s address, while the database remains unreachable from "
       "outside the VPC – confirmed by a failed external connection test "
       "on port 27017.")
para("Screenshots of the running application, the AWS EC2 console showing "
     "both instances, the S3 bucket holding uploaded prescriptions, and the "
     "MongoDB data can be attached in this section as visual evidence.")
para("[ Space reserved for screenshots: Homepage · Patient Dashboard · "
     "AWS EC2 Instances · S3 Bucket · MongoDB Data ]", 11, italic=True,
     align=WD_ALIGN_PARAGRAPH.CENTER, color=(0x88, 0x88, 0x88))

page_break()

# ==========================================================================
# 10. CONCLUSION & FUTURE SCOPE
# ==========================================================================
heading("10.  Conclusion & Future Scope")
subheading("10.1  Conclusion")
para("MediConnect demonstrates how a routine clinical process can be moved "
     "onto the cloud in a way that is secure, reliable and accessible from "
     "anywhere. By combining a MERN application with a deliberately isolated "
     "two-tier AWS deployment, the project shows the practical value of "
     "separating a public web tier from a private data tier and of offloading "
     "heavy files to object storage. The result is a working platform where "
     "appointments cannot collide, records are never lost, and access to every "
     "resource is authenticated and authorised. Beyond the feature set, the "
     "project was a hands-on exercise in cloud provisioning, network security "
     "groups, reverse proxying and stateless API design.")

subheading("10.2  Future Enhancements")
numbered("Real-time notifications through WebSockets or AWS SNS to alert "
         "users about appointment status changes by email or SMS.")
numbered("Integrated video consultations using WebRTC for remote "
         "telemedicine.")
numbered("An online payment gateway to collect consultation fees at the time "
         "of booking.")
numbered("Auto-scaling by placing the web tier behind an Application Load "
         "Balancer with an Auto Scaling Group to absorb traffic spikes.")
numbered("Automated database backups and a managed database option (such as "
         "MongoDB Atlas or Amazon DocumentDB) for higher availability.")
numbered("A mobile application sharing the same REST API for on-the-go "
         "access.")

# ==========================================================================
# 11. REFERENCES
# ==========================================================================
heading("11.  References")
refs = [
    "React Documentation – https://react.dev",
    "Node.js Documentation – https://nodejs.org",
    "Express.js Documentation – https://expressjs.com",
    "MongoDB Documentation – https://www.mongodb.com/docs",
    "Mongoose ODM Documentation – https://mongoosejs.com/docs",
    "Amazon EC2 Documentation – https://docs.aws.amazon.com/ec2",
    "Amazon S3 Documentation – https://docs.aws.amazon.com/s3",
    "AWS SDK for JavaScript v3 – https://docs.aws.amazon.com/sdk-for-javascript",
    "JSON Web Tokens – https://jwt.io",
    "Nginx Documentation – https://nginx.org/en/docs",
    "PM2 Process Manager – https://pm2.keymetrics.io",
    "REST API Design Guide – https://restfulapi.net",
]
for r in refs:
    numbered(r, size=11)

# --------------------------------------------------------------------------
doc.save('Cloud_Lab_Project_Report.docx')
print('Successfully generated Cloud_Lab_Project_Report.docx')
