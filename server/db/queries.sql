-- SELECT * FROM services;

-- JOIN manager ON employees.manager = employees.employee_id;
-- SELECT concat(first_name, ' ', last_name) AS "Name", departments.department_name AS "Department"
-- FROM employees 
-- JOIN departments ON employees.department_id = departments.department_id
-- WHERE employees.alignment_id = 0
-- ;

-- SELECT concat(first_name, ' ', last_name) AS "Employee", roles.title AS "Role"
-- FROM employees 
-- JOIN departments ON employees.department_id = departments.department_id
-- JOIN roles ON employees.role_id = roles.role_id 
-- WHERE employees.department_id = 50
-- ;

-- SELECT departments.department_name AS "Department", SUM(roles.salary) AS "Budget (in cubits)"
-- FROM employees
-- JOIN departments ON employees.department_id = departments.department_id
-- JOIN roles ON departments.department_id = departments.department_id
-- GROUP BY departments.department_name;

-- select array_to_json(array_agg(row_to_json(t)))
-- from (
-- SELECT employee_id, first_name, last_name, roles.role_id, departments.department_id, manager
-- FROM employees
-- JOIN departments ON employees.department_id = departments.department_id
-- JOIN roles ON employees.role_id = roles.role_id
-- ) t;