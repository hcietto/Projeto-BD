//Qual estudante fez qual disciplina do próprio orientador. Retorne apenas o nome do estudante, do professor e da disciplina.

db.students.aggregate([
    {
        $lookup: {
            from: "advisor",
            localField: "ID",
            foreignField: "s_id",
            as: "advisor"
        }
    },
    {
        $unwind: "$advisor"
    },
    {
        $lookup: {
            from: "instructor",
            localField: "advisor.i_id",
            foreignField: "id",
            as: "instructor"
        }
    },
    {
        $unwind: "$instructor"
    },
    {
        $lookup: {
            from: "teaches",
            localField: "instructor.id",
            foreignField: "id",
            as: "teaches"
        }
    },
    {
        $unwind: "$teaches"
    },
    {
        $lookup: {
            from: "section",
            localField: "teaches.course_id",
            foreignField: "course_id",
            as: "section"
        }
    },
    {
        $unwind: "$section"
    },
    {
        $lookup: {
            from: "course",
            localField: "section.course_id",
            foreignField: "course_id",
            as: "course"
        }
    },
    {
        $unwind: "$course"
    },
    {
        $project: {
            
            student_name: "$name",
            instructor_name: "$instructor.name",
            course_title: "$course.title"
        }
    }  	
]);

//Escreva uma query que retorna qual sala (prédio e número) que cada professor dá aula

db.instructor.aggregate([
    {
        $lookup: {
            from: "teaches",
            localField: "id",
            foreignField: "id",
            as: "teaches"
        }
    },
    {
        $unwind: "$teaches"
    },
    {
        $lookup: {
            from: "section",
            localField: "teaches.course_id",
            foreignField: "course_id",
            as: "section"
        }
    },
    {
        $unwind: "$section"
    },
    {
        $lookup: {
            from: "classroom",
            localField: "section.building",
            foreignField: "building",
            as: "class"
        }
    },
    {
        $project: {
            _id: 0,
            instructor_name: "$name",
            building: "$class.building",
            room_number: "$class.room_number"
        }
    },
    {
        $group: {
            _id: "$instructor_name",
            building: {  $addToSet: "$building" },
            room_number: { $addToSet: "$room_number" }
        }
    }
]);

//Escreva uma query que retorna o nome, orçamento, total de alunos e salário médio de cada departamento

db.department.aggregate([
    {
        $lookup: {
            from: "student",
            localField: "dept_name",
            foreignField: "dept_name",
            as: "students"
        }
    },
    {
        $unwind: {
            path: "$students"            
        }
    },
    {
        $lookup: {
            from: "instructor",
            localField: "dept_name",
            foreignField: "dept_name",
            as: "instructors"
        }
    },
    {
        $unwind: {
            path: "$instructors",            
        }
    },
    {
        $group: {
            _id: "$dept_name",
            department_name: { $first: "$dept_name" },
            student_count: { $sum: { $cond: { if: { $gt: ["$students", null] }, then: 1, else: 0 } } },
            budget: { $first: "$budget" },
            avg_salary: { $avg: "$instructors.salary" }
        }
    },
    {
        $project: {
            _id: 0,
            department_name: 1,
            student_count: 1,
            budget: 1,
            avg_salary: 1
        }
    }
]);
