document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('add-student-form');
    const studentListBody = document.getElementById('student-list-body');
    const totalStudentsEl = document.getElementById('total-students');
    
    // โหลดข้อมูลล่าสุดจาก localStorage (ถ้ามี)
    let students = JSON.parse(localStorage.getItem('gradeTracker_students')) || [];

    // เรียก Render แสดงผลเมื่อโหลดหน้าเว็บ
    renderStudents();

    // ฟังชั่นเพิ่มนักเรียนใหม่
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const idInput = document.getElementById('student-id');
        const nameInput = document.getElementById('student-name');
        
        const newStudent = {
            id: idInput.value,
            name: nameInput.value,
            scores: {
                math: '',
                science: '',
                english: ''
            }
        };
        
        students.push(newStudent);
        saveData();
        renderStudents();
        
        // รีเซตฟอร์มแล้วเอา Focus กลับไปที่รหัส
        form.reset();
        idInput.focus();
    });

    // ฟังชั่นคำนวณคะแนนรวม
    function calculateTotal(scores) {
        return (Number(scores.math) || 0) + (Number(scores.science) || 0) + (Number(scores.english) || 0);
    }

    // ฟังชั่นคำนวณเกรด
    function calculateGrade(total) {
        const percentage = total / 3; // คะแนนเต็มช่องละ 100 รวม 300 ทำให้การหาเปอร์เซ็นคือหาร 3
        
        if (total === 0) return { text: '-', class: 'grade-pending' };
        if (percentage >= 80) return { text: '4 (A)', class: 'grade-a' };
        if (percentage >= 70) return { text: '3 (B)', class: 'grade-b' };
        if (percentage >= 60) return { text: '2 (C)', class: 'grade-c' };
        if (percentage >= 50) return { text: '1 (D)', class: 'grade-d' };
        return { text: '0 (F)', class: 'grade-f' };
    }

    // ฟังชั่นบันทึกข้อมูล
    function saveData() {
        localStorage.setItem('gradeTracker_students', JSON.stringify(students));
        totalStudentsEl.textContent = `จำนวนนักเรียน: ${students.length} คน`;
    }

    // ฟังชั่นแสดงผลตารางนักเรียน
    function renderStudents() {
        studentListBody.innerHTML = '';
        
        if (students.length === 0) {
            studentListBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; color: var(--text-secondary); padding: 3rem;">
                        ยังไม่มีข้อมูลนักเรียน 🚀 กรุณาเพิ่มนักเรียนที่แบบฟอร์มด้านบน
                    </td>
                </tr>
            `;
            return;
        }

        students.forEach((student, index) => {
            const tr = document.createElement('tr');
            tr.style.animation = `slideIn 0.4s ease-out ${index * 0.05}s backwards`;
            
            const total = calculateTotal(student.scores);
            const grade = calculateGrade(total);
            
            tr.innerHTML = `
                <td>${student.id}</td>
                <td style="font-weight: 500; color: white;">${student.name}</td>
                <td>
                    <input type="number" class="score-input math-input" value="${student.scores.math}" min="0" max="100" placeholder="0" data-index="${index}">
                </td>
                <td>
                    <input type="number" class="score-input sci-input" value="${student.scores.science}" min="0" max="100" placeholder="0" data-index="${index}">
                </td>
                <td>
                    <input type="number" class="score-input eng-input" value="${student.scores.english}" min="0" max="100" placeholder="0" data-index="${index}">
                </td>
                <td class="text-center total-score">${total}</td>
                <td class="text-center"><span class="grade-badge ${grade.class}">${grade.text}</span></td>
                <td>
                    <button class="btn-delete" data-index="${index}" title="ลบข้อมูล">
                        <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </button>
                </td>
            `;
            studentListBody.appendChild(tr);
        });

        // ผูก Event Listener ให้กับ Input ทุกช่อง
        document.querySelectorAll('.score-input').forEach(input => {
            input.addEventListener('input', (e) => {
                const index = e.target.getAttribute('data-index');
                
                // ควบคุมคะแนนไม่ให้เกิน 100 และไม่ต่ำกว่า 0
                if(e.target.value > 100) e.target.value = 100;
                if(e.target.value < 0) e.target.value = 0;

                const actualVal = e.target.value;

                if (e.target.classList.contains('math-input')) students[index].scores.math = actualVal;
                if (e.target.classList.contains('sci-input')) students[index].scores.science = actualVal;
                if (e.target.classList.contains('eng-input')) students[index].scores.english = actualVal;
                
                saveData();
                
                // อัปเดตคะแนนรวมแบบเรียลไทม์โดยที่ไม่ต้องโหลดแถวใหม่ (ป้องกันเสียการโฟกัสบน Input)
                const row = e.target.closest('tr');
                const total = calculateTotal(students[index].scores);
                const grade = calculateGrade(total);
                
                row.querySelector('.total-score').textContent = total;
                const badge = row.querySelector('.grade-badge');
                badge.className = `grade-badge ${grade.class}`;
                badge.textContent = grade.text;
            });
        });

        // ผูก Event Listener ให้กับปุ่มลบ
        document.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = e.currentTarget.getAttribute('data-index');
                if (confirm('คุณต้องการลบข้อมูลนักเรียนคนนี้ใช่หรือไม่? 🗑️')) {
                    students.splice(index, 1);
                    saveData();
                    renderStudents();
                }
            });
        });

        saveData();
    }
});
