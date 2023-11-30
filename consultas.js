//Qual estudante fez qual disciplina do próprio orientador. Retorne apenas o nome do estudante, do professor e da disciplina.

db.students.aggregate([
    {
        $lookup: {
            from: "advisor",
            localField: "id",
            foreignField: "s_id",
            as: "advisor_info"
        }
    },
    { $unwind: "$advisor_info" },
    {
        $lookup: {
            from: "instructor",
            localField: "advisor_info.i_id",
            foreignField: "id",
            as: "instructor_info"
        }
    },
    { $unwind: "$instructor_info" },
    {
        $lookup: {
            from: "teaches",
            localField: "advisor_info.i_id",
            foreignField: "id",
            as: "teaches_info"
        }
    },
    { $unwind: "$teaches_info" },
    {
        $lookup: {
            from: "takes",
            localField: "id",
            foreignField: "id",
            as: "takes_info"
        }
    },
    { $unwind: "$takes_info" },
    {
        $match: {
            $expr: {
                $and: [
                    { $eq: ["$takes_info.course_id", "$teaches_info.course_id"] },
                    { $eq: ["$advisor_info.i_id", "$teaches_info.id"] }
                ]
            }
        }
    },
    {
        $project: {
            _id: 0,
            student_name: "$name",
            instructor_name: "$instructor_info.name",
            course_id: "$takes_info.course_id"
        }
    }
]);

//Escreva uma query que retorna qual sala (prédio e número) que cada professor dá aula

db.instructor.aggregate([
    {
        $lookup: {
            from: "section",
            localField: "id",
            foreignField: "instructor_id", // Assumindo que 'instructor_id' é um campo em 'section'
            as: "sections"
        }
    },
    { $unwind: "$sections" },
    {
        $group: {
            _id: {
                instructor_id: "$id",
                instructor_name: "$name"
            },
            classrooms: {
                $addToSet: {
                    building: "$sections.building",
                    room_number: "$sections.room_number"
                }
            }
        }
    },
    {
        $project: {
            _id: 0,
            instructor_id: "$_id.instructor_id",
            instructor_name: "$_id.instructor_name",
            classrooms: 1
        }
    }
]);

//Escreva uma query que retorna o nome, orçamento, total de alunos e salário médio de cada departamento

db.department.aggregate([
    {
        $lookup: {
            from: "instructor",
            localField: "dept_name",
            foreignField: "dept_name",
            as: "instructor_info"
        }
    },
    {
        $lookup: {
            from: "student",
            localField: "dept_name",
            foreignField: "dept_name",
            as: "student_info"
        }
    },
    {
        $project: {
            dept_name: 1,
            budget: 1,
            total_students: { $size: "$student_info" },
            avg_salary: { $avg: "$instructor_info.salary" }
        }
    }
]);
