// =====================================
// CLINICBOOK - MAIN JAVASCRIPT FILE
// This file controls login, bookings and all dashboards.
// =====================================

// 1. BASIC DATA

const STORAGE_KEY = "mediqueData";

const doctors = [
    {
        doctorId: "D001",
        name: "Dr. Ananya Sharma",
        specialty: "Cardiology",
        hospital: "Bloom Care Clinic",
        distance: "1.2 km"
    },
    {
        doctorId: "D002",
        name: "Dr. Rohan Mehta",
        specialty: "General Physician",
        hospital: "Willow Health Centre",
        distance: "2.0 km"
    },
    {
        doctorId: "D003",
        name: "Dr. Mira Kapoor",
        specialty: "Dermatology",
        hospital: "Petal Multispeciality",
        distance: "2.6 km"
    },
    {
        doctorId: "D004",
        name: "Dr. Neha Iyer",
        specialty: "Pediatrics",
        hospital: "Little Steps Clinic",
        distance: "3.1 km"
    },
    {
        doctorId: "D005",
        name: "Dr. Kabir Rao",
        specialty: "Orthopedics",
        hospital: "Bloom Care Clinic",
        distance: "3.8 km"
    },
    {
        doctorId: "D006",
        name: "Dr. Sara Thomas",
        specialty: "ENT",
        hospital: "Willow Health Centre",
        distance: "4.2 km"
    }
];

let currentRole = "patient";
let currentPatientName = "Aarav Nair";
let currentDoctorId = "D001";
let selectedDoctorId = "";
let toastInstance;


// 2. SMALL HELPER FUNCTIONS

function getTodayDate() {
    const today = new Date();
    const timezoneOffset = today.getTimezoneOffset();
    const localTime = new Date(today.getTime() - timezoneOffset * 60000);

    return localTime.toISOString().split("T")[0];
}

function addDays(dateString, numberOfDays) {
    const date = new Date(dateString + "T12:00:00");
    date.setDate(date.getDate() + numberOfDays);

    const timezoneOffset = date.getTimezoneOffset();
    const localTime = new Date(date.getTime() - timezoneOffset * 60000);

    return localTime.toISOString().split("T")[0];
}

function timeToMinutes(time) {
    const parts = time.split(":");
    const hours = Number(parts[0]);
    const minutes = Number(parts[1]);

    return hours * 60 + minutes;
}

function makeId(prefix) {
    return prefix + Date.now() + Math.floor(Math.random() * 1000);
}

function getDoctor(doctorId) {
    for (let i = 0; i < doctors.length; i++) {
        if (doctors[i].doctorId === doctorId) {
            return doctors[i];
        }
    }

    return null;
}

function getSlot(data, slotId) {
    for (let i = 0; i < data.slots.length; i++) {
        if (data.slots[i].slotId === slotId) {
            return data.slots[i];
        }
    }

    return null;
}

function getPatientId(name) {
    return name.trim().toLowerCase().replace(/\s+/g, " ");
}

function escapeHTML(text) {
    return String(text).replace(/[&<>"']/g, function (character) {
        if (character === "&") return "&amp;";
        if (character === "<") return "&lt;";
        if (character === ">") return "&gt;";
        if (character === '"') return "&quot;";
        return "&#39;";
    });
}

function showToast(message) {
    document.getElementById("toastMessage").textContent = message;

    if (!toastInstance) {
        toastInstance = new bootstrap.Toast(
            document.getElementById("appToast"),
            { delay: 2600 }
        );
    }

    toastInstance.show();
}

function statusBadge(status) {
    return '<span class="status status-' + status.toLowerCase() + '">' +
        escapeHTML(status) +
        '</span>';
}

function getAppointmentDate(data, appointment) {
    const slot = getSlot(data, appointment.slotId);

    if (slot) {
        return slot.date;
    }

    return "";
}

function getAppointmentTime(data, appointment) {
    const slot = getSlot(data, appointment.slotId);

    if (!slot) {
        return "-";
    }

    return slot.startTime + " - " + slot.endTime;
}


// 3. LOCAL STORAGE AND SAMPLE DATA

function createSampleSlots() {
    const slots = [];
    const today = getTodayDate();

    const timings = [
        ["09:00", "09:30"],
        ["10:00", "10:30"],
        ["11:00", "11:30"],
        ["14:00", "14:30"],
        ["15:00", "15:30"]
    ];

    for (let i = 0; i < doctors.length; i++) {
        for (let day = 0; day < 7; day++) {
            const date = addDays(today, day);

            for (let j = 0; j < timings.length; j++) {
                const startTime = timings[j][0];
                const endTime = timings[j][1];
                const currentTime = new Date().toTimeString().slice(0, 5);

                if (date !== today || startTime > currentTime) {
                    slots.push({
                        slotId: makeId("S"),
                        doctorId: doctors[i].doctorId,
                        date: date,
                        startTime: startTime,
                        endTime: endTime
                    });
                }
            }
        }
    }

    return slots;
}

function createInitialData() {
    const slots = createSampleSlots();

    const appointments = [
        {
            appointmentId: "A001",
            slotId: slots[0].slotId,
            doctorId: slots[0].doctorId,
            patientId: "aarav nair",
            patientName: "Aarav Nair",
            reason: "General consultation",
            status: "Booked"
        },
        {
            appointmentId: "A002",
            slotId: slots[1].slotId,
            doctorId: slots[1].doctorId,
            patientId: "riya sen",
            patientName: "Riya Sen",
            reason: "Routine check-up",
            status: "Booked"
        }
    ];

    return {
        slots: slots,
        appointments: appointments,
        patients: [
            { patientId: "aarav nair", name: "Aarav Nair", email: "aarav@example.com", phone: "9876543210", age: 25, gender: "Male" },
            { patientId: "riya sen", name: "Riya Sen", email: "riya@example.com", phone: "9876501234", age: 29, gender: "Female" }
        ]
    };
}

function getData() {
    let data = null;

    try {
        data = JSON.parse(localStorage.getItem(STORAGE_KEY));
    } catch (error) {
        data = null;
    }

    if (!data || !Array.isArray(data.slots) || !Array.isArray(data.appointments)) {
        data = createInitialData();
    }

    if (!Array.isArray(data.patients)) {
        data.patients = [];
    }

    for (let i = 0; i < data.appointments.length; i++) {
        const appointment = data.appointments[i];

        if (appointment.patientName) {
            appointment.patientId = getPatientId(appointment.patientName);
        }
    }

    for (let i = 0; i < doctors.length; i++) {
        let hasFutureSlots = false;

        for (let j = 0; j < data.slots.length; j++) {
            if (data.slots[j].doctorId === doctors[i].doctorId &&
                data.slots[j].date >= getTodayDate()) {
                hasFutureSlots = true;
                break;
            }
        }

        if (!hasFutureSlots) {
            const newSlots = createSampleSlots();

            for (let j = 0; j < newSlots.length; j++) {
                if (newSlots[j].doctorId === doctors[i].doctorId) {
                    data.slots.push(newSlots[j]);
                }
            }
        }
    }

    saveData(data);
    return data;
}

function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function isSlotBooked(data, slotId) {
    for (let i = 0; i < data.appointments.length; i++) {
        const appointment = data.appointments[i];

        if (appointment.slotId === slotId && appointment.status === "Booked") {
            return true;
        }
    }

    return false;
}


// 4. LOGIN AND ROLE SELECTION

function populateLoginDoctors() {
    const doctorDropdown = document.getElementById("loginDoctor");
    let options = "";

    for (let i = 0; i < doctors.length; i++) {
        options += '<option value="' + doctors[i].doctorId + '">' +
            escapeHTML(doctors[i].name) + " - " +
            escapeHTML(doctors[i].specialty) +
            "</option>";
    }

    doctorDropdown.innerHTML = options;
}

function findPatientByEmail(email) {
    const data = getData();
    const normalizedEmail = email.trim().toLowerCase();

    for (let i = 0; i < data.patients.length; i++) {
        if (data.patients[i].email.toLowerCase() === normalizedEmail) {
            return data.patients[i];
        }
    }

    return null;
}

function loadPatientProfile() {
    const email = document.getElementById("loginPatientEmail").value.trim();
    const note = document.getElementById("patientProfileNote");

    if (!email || !email.includes("@")) {
        note.textContent = "Enter your details once. Next time, use the same email to load your saved profile.";
        return;
    }

    const patient = findPatientByEmail(email);

    if (patient) {
        document.getElementById("loginPatientName").value = patient.name;
        document.getElementById("loginPatientPhone").value = patient.phone;
        document.getElementById("loginPatientAge").value = patient.age;
        document.getElementById("loginPatientGender").value = patient.gender;
        note.textContent = "Welcome back! Your saved details have been loaded.";
    } else {
        note.textContent = "New patient? Please enter your details to create your profile.";
    }
}

function updateLoginFields() {
    const role = document.getElementById("loginRole").value;

    document.getElementById("patientLoginField").classList.toggle("d-none", role !== "patient");
    document.getElementById("doctorLoginField").classList.toggle("d-none", role !== "doctor");
    document.getElementById("receptionistLoginField").classList.toggle("d-none", role !== "receptionist");

    const patientFields = ["loginPatientName", "loginPatientEmail", "loginPatientPhone", "loginPatientAge", "loginPatientGender"];

    for (let i = 0; i < patientFields.length; i++) {
        document.getElementById(patientFields[i]).required = role === "patient";
    }
}

function enterApp(role, patientName, doctorId) {
    currentRole = role;
    currentPatientName = patientName || "Aarav Nair";
    currentDoctorId = doctorId || "D001";

    if (role !== "patient") {
        window.currentPatientProfile = null;
    }

    document.getElementById("loginPage").classList.add("d-none");
    document.getElementById("appPage").classList.remove("d-none");

    document.getElementById("currentRoleLabel").textContent =
        role.charAt(0).toUpperCase() + role.slice(1);

    if (role === "patient") {
        document.getElementById("currentUserLabel").textContent = currentPatientName;
    } else if (role === "doctor") {
        document.getElementById("currentUserLabel").textContent = getDoctor(currentDoctorId).name;
    } else {
        document.getElementById("currentUserLabel").textContent = "Front desk";
    }

    document.getElementById("patientDashboard").classList.add("d-none");
    document.getElementById("doctorDashboard").classList.add("d-none");
    document.getElementById("receptionistDashboard").classList.add("d-none");

    if (role === "patient") {
        document.getElementById("patientDashboard").classList.remove("d-none");
        initPatientDashboard();
    }

    if (role === "doctor") {
        document.getElementById("doctorDashboard").classList.remove("d-none");
        initDoctorDashboard();
    }

    if (role === "receptionist") {
        document.getElementById("receptionistDashboard").classList.remove("d-none");
        initReceptionDashboard();
    }
}

document.getElementById("loginRole").addEventListener("change", updateLoginFields);
document.getElementById("loginPatientEmail").addEventListener("change", loadPatientProfile);
document.getElementById("loginPatientEmail").addEventListener("blur", loadPatientProfile);

document.getElementById("loginForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const role = document.getElementById("loginRole").value;
    const patientName = document.getElementById("loginPatientName").value.trim();
    const doctorId = document.getElementById("loginDoctor").value;

    if (role === "patient") {
        const email = document.getElementById("loginPatientEmail").value.trim().toLowerCase();
        const phone = document.getElementById("loginPatientPhone").value.trim();
        const age = Number(document.getElementById("loginPatientAge").value);
        const gender = document.getElementById("loginPatientGender").value;

        if (!patientName || !email || !phone || !age || !gender) {
            alert("Please complete all patient details.");
            return;
        }

        if (!/^[0-9]{10}$/.test(phone)) {
            alert("Please enter a valid 10-digit phone number.");
            return;
        }

        if (age < 1 || age > 120) {
            alert("Please enter a valid age.");
            return;
        }

        const data = getData();
        const patientId = email;
        let existingPatient = null;

        for (let i = 0; i < data.patients.length; i++) {
            if (data.patients[i].email.toLowerCase() === email) {
                existingPatient = data.patients[i];
                break;
            }
        }

        const patientProfile = {
            patientId: patientId,
            name: patientName,
            email: email,
            phone: phone,
            age: age,
            gender: gender
        };

        if (existingPatient) {
            Object.assign(existingPatient, patientProfile);
        } else {
            data.patients.push(patientProfile);
        }

        saveData(data);
        currentPatientName = patientName;
        window.currentPatientProfile = patientProfile;
    }

    enterApp(role, patientName, doctorId);
});

document.getElementById("logoutButton").addEventListener("click", function () {
    document.getElementById("appPage").classList.add("d-none");
    document.getElementById("loginPage").classList.remove("d-none");
});

document.getElementById("brandHome").addEventListener("click", function (event) {
    event.preventDefault();

    if (currentRole === "patient") {
        window.scrollTo({ top: 0, behavior: "smooth" });
    }
});


// 5. COMMON APPOINTMENT FUNCTIONS

function validateBooking(data, slot, patientName) {
    if (!slot) {
        return "Please choose a valid time slot.";
    }

    const today = getTodayDate();
    const currentTime = new Date().toTimeString().slice(0, 5);

    if (slot.date < today || (slot.date === today && slot.startTime <= currentTime)) {
        return "You cannot book a slot in the past.";
    }

    if (isSlotBooked(data, slot.slotId)) {
        return "This slot has already been booked.";
    }

    const patientId = getPatientId(patientName);
    const newStart = timeToMinutes(slot.startTime);
    const newEnd = timeToMinutes(slot.endTime);

    for (let i = 0; i < data.appointments.length; i++) {
        const appointment = data.appointments[i];

        if (appointment.patientId !== patientId || appointment.status !== "Booked") {
            continue;
        }

        const oldSlot = getSlot(data, appointment.slotId);

        if (!oldSlot || oldSlot.date !== slot.date) {
            continue;
        }

        const oldStart = timeToMinutes(oldSlot.startTime);
        const oldEnd = timeToMinutes(oldSlot.endTime);

        if (newStart < oldEnd && newEnd > oldStart) {
            return "This patient already has an overlapping appointment.";
        }
    }

    return "";
}

function bookAppointment(slotId, patientName, reason) {
    const data = getData();
    const slot = getSlot(data, slotId);
    const errorMessage = validateBooking(data, slot, patientName);

    if (errorMessage !== "") {
        showToast(errorMessage);
        return false;
    }

    const profile = window.currentPatientProfile || null;

    const newAppointment = {
        appointmentId: makeId("A"),
        slotId: slotId,
        doctorId: slot.doctorId,
        patientId: getPatientId(patientName),
        patientName: patientName.trim(),
        patientEmail: profile ? profile.email : "",
        patientPhone: profile ? profile.phone : "",
        patientAge: profile ? profile.age : "",
        patientGender: profile ? profile.gender : "",
        reason: reason.trim() || "Consultation",
        status: "Booked"
    };

    data.appointments.push(newAppointment);
    saveData(data);

    return true;
}

function cancelAppointment(appointmentId) {
    const data = getData();
    let appointment = null;

    for (let i = 0; i < data.appointments.length; i++) {
        if (data.appointments[i].appointmentId === appointmentId) {
            appointment = data.appointments[i];
            break;
        }
    }

    if (!appointment || appointment.status !== "Booked") {
        showToast("Only booked appointments can be cancelled.");
        return;
    }

    appointment.status = "Cancelled";
    saveData(data);
    refreshCurrentDashboard();
    showToast("Appointment cancelled. The slot is available again.");
}

function completeAppointment(appointmentId) {
    const data = getData();
    let appointment = null;

    for (let i = 0; i < data.appointments.length; i++) {
        if (data.appointments[i].appointmentId === appointmentId) {
            appointment = data.appointments[i];
            break;
        }
    }

    if (!appointment || appointment.status !== "Booked") {
        showToast("Only booked appointments can be completed.");
        return;
    }

    appointment.status = "Completed";
    saveData(data);
    refreshCurrentDashboard();
    showToast("Appointment marked as completed.");
}

function refreshCurrentDashboard() {
    if (currentRole === "patient") {
        renderPatientDashboard();
    }

    if (currentRole === "doctor") {
        renderDoctorDashboard();
    }

    if (currentRole === "receptionist") {
        renderReceptionDashboard();
    }
}


// 6. PATIENT DASHBOARD

function initPatientDashboard() {
    const specialtyDropdown = document.getElementById("patientSpecialty");
    let options = '<option value="all">All specialties</option>';

    for (let i = 0; i < doctors.length; i++) {
        let alreadyAdded = false;

        for (let j = 0; j < i; j++) {
            if (doctors[j].specialty === doctors[i].specialty) {
                alreadyAdded = true;
            }
        }

        if (!alreadyAdded) {
            options += '<option value="' + doctors[i].specialty + '">' +
                doctors[i].specialty + '</option>';
        }
    }

    specialtyDropdown.innerHTML = options;

    document.getElementById("patientDate").min = getTodayDate();
    document.getElementById("patientDate").value = getTodayDate();

    document.getElementById("patientSearch").oninput = renderDoctorDirectory;
    specialtyDropdown.onchange = renderDoctorDirectory;
    document.getElementById("patientDate").onchange = renderPatientSlots;

    renderPatientDashboard();
}

function renderPatientDashboard() {
    renderDoctorDirectory();
    renderPatientSlots();
    renderPatientAppointments();

    const data = getData();
    let total = 0;
    let upcoming = 0;
    let completed = 0;

    for (let i = 0; i < data.appointments.length; i++) {
        const appointment = data.appointments[i];

        if (appointment.patientId === getPatientId(currentPatientName)) {
            total++;

            if (appointment.status === "Booked") {
                upcoming++;
            }

            if (appointment.status === "Completed") {
                completed++;
            }
        }
    }

    document.getElementById("patientTotal").textContent = total;
    document.getElementById("patientUpcoming").textContent = upcoming;
    document.getElementById("patientCompleted").textContent = completed;
}

function renderDoctorDirectory() {
    const searchText = document.getElementById("patientSearch").value.toLowerCase().trim();
    const selectedSpecialty = document.getElementById("patientSpecialty").value;
    const directory = document.getElementById("doctorDirectory");
    let doctorCards = "";

    for (let i = 0; i < doctors.length; i++) {
        const doctor = doctors[i];
        const doctorDetails = (doctor.name + " " + doctor.specialty + " " + doctor.hospital).toLowerCase();
        const matchesSearch = doctorDetails.includes(searchText);
        const matchesSpecialty = selectedSpecialty === "all" || doctor.specialty === selectedSpecialty;

        if (matchesSearch && matchesSpecialty) {
            const initials = doctor.name.replace("Dr. ", "").split(" ");
            const avatarText = initials[0][0] + initials[1][0];

            doctorCards += `
                <article class="doctor-card">
                    <div class="doctor-avatar">${escapeHTML(avatarText)}</div>
                    <div>
                        <h3>${escapeHTML(doctor.name)}</h3>
                        <div class="doctor-specialty">${escapeHTML(doctor.specialty)}</div>
                    </div>
                    <div class="doctor-meta">
                        ${escapeHTML(doctor.hospital)} · ${escapeHTML(doctor.distance)}
                    </div>
                    <button class="btn btn-primary-soft btn-sm" onclick="selectDoctor('${doctor.doctorId}')">
                        View available slots
                    </button>
                </article>
            `;
        }
    }

    if (doctorCards === "") {
        doctorCards = '<div class="empty-state">No doctors match your search.</div>';
    }

    directory.innerHTML = doctorCards;
}

function selectDoctor(doctorId) {
    selectedDoctorId = doctorId;
    const doctor = getDoctor(doctorId);

    document.getElementById("bookingTitle").textContent =
        "Available appointments with " + doctor.name;

    document.getElementById("bookingSubtitle").textContent =
        doctor.specialty + " · " + doctor.hospital;

    renderPatientSlots();
    document.getElementById("bookingSection").scrollIntoView({ behavior: "smooth" });
}

function renderPatientSlots() {
    const container = document.getElementById("patientSlots");

    if (selectedDoctorId === "") {
        container.className = "slot-grid empty-state";
        container.textContent = "Select a doctor to view available slots.";
        return;
    }

    const data = getData();
    const selectedDate = document.getElementById("patientDate").value;
    let slotButtons = "";

    for (let i = 0; i < data.slots.length; i++) {
        const slot = data.slots[i];

        if (slot.doctorId === selectedDoctorId && slot.date === selectedDate && !isSlotBooked(data, slot.slotId)) {
            const errorMessage = validateBooking(data, slot, currentPatientName);

            if (errorMessage === "") {
                slotButtons += `
                    <button class="slot-button" onclick="patientBook('${slot.slotId}')">
                        ${slot.startTime} - ${slot.endTime}
                    </button>
                `;
            }
        }
    }

    container.className = "slot-grid";

    if (slotButtons === "") {
        container.innerHTML = '<div class="empty-state">No available slots for this date. Try another date.</div>';
    } else {
        container.innerHTML = slotButtons;
    }
}

function patientBook(slotId) {
    const reason = document.getElementById("patientReason").value.trim();

    if (bookAppointment(slotId, currentPatientName, reason)) {
        showToast("Your appointment has been booked!");
        renderPatientDashboard();
    }
}

function renderPatientAppointments() {
    const data = getData();
    const table = document.getElementById("patientAppointments");
    let rows = "";

    for (let i = 0; i < data.appointments.length; i++) {
        const appointment = data.appointments[i];

        if (appointment.patientId === getPatientId(currentPatientName)) {
            const doctor = getDoctor(appointment.doctorId);
            const doctorName = doctor ? doctor.name : "Doctor";
            let actionButton = "-";

            if (appointment.status === "Booked") {
                actionButton = `<button class="btn-table danger" onclick="cancelAppointment('${appointment.appointmentId}')">Cancel</button>`;
            }

            rows += `
                <tr>
                    <td>${escapeHTML(doctorName)}</td>
                    <td>${getAppointmentDate(data, appointment)}</td>
                    <td>${getAppointmentTime(data, appointment)}</td>
                    <td>${escapeHTML(appointment.reason)}</td>
                    <td>${statusBadge(appointment.status)}</td>
                    <td>${actionButton}</td>
                </tr>
            `;
        }
    }

    if (rows === "") {
        rows = '<tr><td colspan="6" class="text-center text-muted py-4">You have no appointments yet.</td></tr>';
    }

    table.innerHTML = rows;
}


// 7. DOCTOR DASHBOARD

function initDoctorDashboard() {
    const doctor = getDoctor(currentDoctorId);

    document.getElementById("doctorGreeting").textContent = doctor.name.replace("Dr. ", "");
    document.getElementById("doctorAppointmentDate").value = getTodayDate();
    document.getElementById("doctorAppointmentDate").min = getTodayDate();
    document.getElementById("doctorSlotDate").min = getTodayDate();

    document.getElementById("doctorAppointmentDate").onchange = renderDoctorDashboard;

    document.getElementById("doctorProfile").innerHTML = `
        <div class="profile-item">
            <span>Name</span>
            <strong>${escapeHTML(doctor.name)}</strong>
        </div>
        <div class="profile-item">
            <span>Specialty</span>
            <strong>${escapeHTML(doctor.specialty)}</strong>
        </div>
        <div class="profile-item">
            <span>Doctor ID</span>
            <strong>${doctor.doctorId}</strong>
        </div>
    `;

    renderDoctorDashboard();
}

function renderDoctorDashboard() {
    const data = getData();
    const selectedDate = document.getElementById("doctorAppointmentDate").value;
    let total = 0;
    let booked = 0;
    let completed = 0;
    let appointmentRows = "";
    let slotRows = "";

    for (let i = 0; i < data.appointments.length; i++) {
        const appointment = data.appointments[i];

        if (appointment.doctorId === currentDoctorId) {
            if (appointment.status !== "Cancelled") total++;
            if (appointment.status === "Booked") booked++;
            if (appointment.status === "Completed") completed++;

            if (getAppointmentDate(data, appointment) === selectedDate) {
                let actionButton = "-";

                if (appointment.status === "Booked") {
                    actionButton = `<button class="btn-table" onclick="completeAppointment('${appointment.appointmentId}')">Complete</button>`;
                }

                appointmentRows += `
                    <tr>
                        <td>${escapeHTML(appointment.patientName)}</td>
                        <td>${escapeHTML(appointment.patientPhone || "Not provided")}<br><small>${escapeHTML(appointment.patientEmail || "")}</small></td>
                        <td>${appointment.patientAge ? escapeHTML(appointment.patientAge) + " / " + escapeHTML(appointment.patientGender) : "Not provided"}</td>
                        <td>${getAppointmentTime(data, appointment)}</td>
                        <td>${escapeHTML(appointment.reason)}</td>
                        <td>${statusBadge(appointment.status)}</td>
                        <td>${actionButton}</td>
                    </tr>
                `;
            }
        }
    }

    document.getElementById("doctorTotal").textContent = total;
    document.getElementById("doctorBooked").textContent = booked;
    document.getElementById("doctorCompleted").textContent = completed;

    if (appointmentRows === "") {
        appointmentRows = '<tr><td colspan="7" class="text-center text-muted py-4">No appointments for this date.</td></tr>';
    }

    document.getElementById("doctorAppointments").innerHTML = appointmentRows;

    for (let i = 0; i < data.slots.length; i++) {
        const slot = data.slots[i];

        if (slot.doctorId === currentDoctorId) {
            let slotStatus = "Available";
            let actionButton = `<button class="btn-table danger" onclick="removeDoctorSlot('${slot.slotId}')">Remove</button>`;

            if (isSlotBooked(data, slot.slotId)) {
                slotStatus = "Booked";
                actionButton = "-";
            }

            slotRows += `
                <tr>
                    <td>${slot.date}</td>
                    <td>${slot.startTime}</td>
                    <td>${slot.endTime}</td>
                    <td>${statusBadge(slotStatus)}</td>
                    <td>${actionButton}</td>
                </tr>
            `;
        }
    }

    if (slotRows === "") {
        slotRows = '<tr><td colspan="5" class="text-center text-muted py-4">No slots added yet.</td></tr>';
    }

    document.getElementById("doctorSlots").innerHTML = slotRows;
}

document.getElementById("doctorSlotForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const date = document.getElementById("doctorSlotDate").value;
    const startTime = document.getElementById("doctorSlotStart").value;
    const endTime = document.getElementById("doctorSlotEnd").value;
    const today = getTodayDate();
    const currentTime = new Date().toTimeString().slice(0, 5);

    if (date < today || (date === today && startTime <= currentTime)) {
        showToast("Choose a future date and time.");
        return;
    }

    if (timeToMinutes(startTime) >= timeToMinutes(endTime)) {
        showToast("End time must be after start time.");
        return;
    }

    const data = getData();

    for (let i = 0; i < data.slots.length; i++) {
        const oldSlot = data.slots[i];

        if (oldSlot.doctorId === currentDoctorId && oldSlot.date === date) {
            const oldStart = timeToMinutes(oldSlot.startTime);
            const oldEnd = timeToMinutes(oldSlot.endTime);
            const newStart = timeToMinutes(startTime);
            const newEnd = timeToMinutes(endTime);

            if (newStart < oldEnd && newEnd > oldStart) {
                showToast("This slot overlaps with an existing slot.");
                return;
            }
        }
    }

    data.slots.push({
        slotId: makeId("S"),
        doctorId: currentDoctorId,
        date: date,
        startTime: startTime,
        endTime: endTime
    });

    saveData(data);
    event.target.reset();
    document.getElementById("doctorSlotDate").min = getTodayDate();
    renderDoctorDashboard();
    showToast("New slot added successfully.");
});

function removeDoctorSlot(slotId) {
    const data = getData();

    if (isSlotBooked(data, slotId)) {
        showToast("Booked slots cannot be removed.");
        return;
    }

    const remainingSlots = [];

    for (let i = 0; i < data.slots.length; i++) {
        if (data.slots[i].slotId !== slotId) {
            remainingSlots.push(data.slots[i]);
        }
    }

    data.slots = remainingSlots;
    saveData(data);
    renderDoctorDashboard();
    showToast("Slot removed.");
}


// 8. RECEPTIONIST DASHBOARD

function initReceptionDashboard() {
    const doctorDropdown = document.getElementById("receptionDoctor");
    let options = "";

    for (let i = 0; i < doctors.length; i++) {
        options += '<option value="' + doctors[i].doctorId + '">' +
            escapeHTML(doctors[i].name) + " - " +
            escapeHTML(doctors[i].specialty) +
            "</option>";
    }

    doctorDropdown.innerHTML = options;

    document.getElementById("receptionDate").min = getTodayDate();
    document.getElementById("receptionDate").value = getTodayDate();

    doctorDropdown.onchange = renderReceptionSlots;
    document.getElementById("receptionDate").onchange = renderReceptionSlots;
    document.getElementById("receptionSearch").oninput = renderReceptionAppointments;

    renderReceptionDashboard();
}

function renderReceptionSlots() {
    const data = getData();
    const doctorId = document.getElementById("receptionDoctor").value;
    const date = document.getElementById("receptionDate").value;
    const slotDropdown = document.getElementById("receptionSlot");
    let options = '<option value="">Choose a time</option>';

    for (let i = 0; i < data.slots.length; i++) {
        const slot = data.slots[i];
        const today = getTodayDate();
        const currentTime = new Date().toTimeString().slice(0, 5);
        const isFutureSlot = slot.date > today || (slot.date === today && slot.startTime > currentTime);

        if (slot.doctorId === doctorId && slot.date === date &&
            !isSlotBooked(data, slot.slotId) && isFutureSlot) {
            options += '<option value="' + slot.slotId + '">' +
                slot.startTime + " - " + slot.endTime +
                "</option>";
        }
    }

    if (options === '<option value="">Choose a time</option>') {
        options = '<option value="">No available slots</option>';
    }

    slotDropdown.innerHTML = options;
}

function renderReceptionDashboard() {
    const data = getData();
    let bookedCount = 0;

    for (let i = 0; i < data.appointments.length; i++) {
        if (data.appointments[i].status === "Booked") {
            bookedCount++;
        }
    }

    document.getElementById("receptionTotal").textContent = data.appointments.length;
    document.getElementById("receptionBooked").textContent = bookedCount;
    document.getElementById("receptionDoctors").textContent = doctors.length;

    renderReceptionSlots();
    renderReceptionAppointments();
}

function renderReceptionAppointments() {
    const data = getData();
    const searchText = document.getElementById("receptionSearch").value.toLowerCase().trim();
    const table = document.getElementById("receptionAppointments");
    let rows = "";

    for (let i = 0; i < data.appointments.length; i++) {
        const appointment = data.appointments[i];
        const doctor = getDoctor(appointment.doctorId);
        let doctorName = "Doctor";

        if (doctor) {
            doctorName = doctor.name;
        }

        const appointmentDetails = (
            appointment.patientName + " " + doctorName + " " + appointment.reason
        ).toLowerCase();

        if (appointmentDetails.includes(searchText)) {
            let actionButton = "-";

            if (appointment.status === "Booked") {
                actionButton = `<button class="btn-table danger" onclick="cancelAppointment('${appointment.appointmentId}')">Cancel</button>`;
            }

            rows += `
                <tr>
                    <td>${escapeHTML(appointment.patientName)}</td>
                    <td>${escapeHTML(doctorName)}</td>
                    <td>${getAppointmentDate(data, appointment)}</td>
                    <td>${getAppointmentTime(data, appointment)}</td>
                    <td>${escapeHTML(appointment.reason)}</td>
                    <td>${statusBadge(appointment.status)}</td>
                    <td>${actionButton}</td>
                </tr>
            `;
        }
    }

    if (rows === "") {
        rows = '<tr><td colspan="7" class="text-center text-muted py-4">No appointments found.</td></tr>';
    }

    table.innerHTML = rows;
}

document.getElementById("receptionForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const patientName = document.getElementById("receptionPatientName").value.trim();
    const slotId = document.getElementById("receptionSlot").value;
    const reason = document.getElementById("receptionReason").value.trim();

    if (patientName === "" || slotId === "") {
        showToast("Enter a patient name and choose an available slot.");
        return;
    }

    if (bookAppointment(slotId, patientName, reason)) {
        event.target.reset();
        document.getElementById("receptionDate").value = getTodayDate();
        renderReceptionDashboard();
        showToast("Appointment booked for the patient.");
    }
});


// 9. START THE PROJECT

window.addEventListener("storage", refreshCurrentDashboard);

populateLoginDoctors();
updateLoginFields();
getData();


