Create database employee_management;
Use employee_management;

CREATE TABLE employee(
employee_id serial primary key,
first_name varchar(255) unique not null,
last_name varchar (255) not null,
age int ,
gender varchar (255)
);

CREATE TABLE employee_salary(
employee_id int primary key,
salary int not null,
foreign key (employee_id) references employee(employee_id)
);

INSERT INTO employee(first_name, last_name, age, gender)
VALUES('John', 'Doe', 30, 'Male'),
('Jane', 'Smith', 25, 'Female'),
('Jim', 'Beam', 40, 'Male');

INSERT INTO employee_salary(employee_id, salary)
VALUES(1, 50000),
(2, 60000),
(3, 70000);

SELECT * FROM employee;
SELECT * FROM employee_salary;

-- Alter table
ALTER TABLE employee
ADD COLUMN department VARCHAR(255);

-- Update table
UPDATE employee
SET department = 'HR'
WHERE employee_id = 1;

UPDATE employee
SET department = 'IT'
WHERE employee_id = 2;

UPDATE employee
SET department = 'Finance'
WHERE employee_id = 3;

-- Drop column
ALTER TABLE employee
DROP COLUMN department;

-- Delete row
DELETE FROM employee
WHERE employee_id = 3;

-- Delete all rows
DELETE FROM employee;

-- Drop table
DROP TABLE employee;

-- Join tables
SELECT e.employee_id, e.first_name, e.last_name, es.salary
FROM employee e
JOIN employee_salary es
ON e.employee_id = es.employee_id;

-- Aggregate Functions
-- Count rows
SELECT COUNT(*) AS total_employees
FROM employee;

-- Average salary
SELECT AVG(salary) AS average_salary
FROM employee_salary;

-- Max salary
SELECT MAX(salary) AS highest_salary
FROM employee_salary;

-- Min salary
SELECT MIN(salary) AS lowest_salary
FROM employee_salary;

-- Sum of salaries
SELECT SUM(salary) AS total_salary
FROM employee_salary;

-- Filter rows
SELECT * FROM employee
WHERE age > 30;

-- Sorting rows
SELECT * FROM employee
ORDER BY age DESC;

-- Limit rows
SELECT * FROM employee
LIMIT 2;

-- Group by
SELECT department, COUNT(*) AS total_employees
FROM employee
GROUP BY department;

-- Having
SELECT department, COUNT(*) AS total_employees
FROM employee
GROUP BY department
HAVING COUNT(*) > 1;

-- UNION (removes duplicates)
SELECT first_name, last_name
FROM employee
UNION
SELECT first_name, last_name
FROM employee;

-- UNION ALL (keeps duplicates)
SELECT first_name, last_name
FROM employee
UNION ALL
SELECT first_name, last_name
FROM employee;

-- INTERSECT (returns common rows)
SELECT employee_id 
FROM employee
INTERSECT
SELECT employee_id
FROM employee_salary;

-- Max()
SELECT first_name, last_name, age
FROM employee
WHERE age = (SELECT MAX(age) FROM employee);

-- Count()
SELECT COUNT(*)
FROM employee
WHERE age > 40;

SELECT CURRENT_DATE;
SELECT CURRENT_TIME;
SELECT CURRENT_TIME(2);

CREATE TABLE log (
    log_id SERIAL PRIMARY KEY,
    message VARCHAR(255) NOT NULL,
    created_at TIME DEFAULT CURRENT_TIME,
    created_on DATE DEFAULT CURRENT_DATE
);
INSERT INTO log( message )
VALUES('Testing the CURRENT_TIME function');

SELECT * FROM log;

SELECT NOW();
SELECT EXTRACT(YEAR FROM TIMESTAMP '2020-12-31 13:30:15');
SELECT EXTRACT(QUARTER FROM TIMESTAMP '2020-12-31 13:30:15');
SELECT EXTRACT(MONTH FROM TIMESTAMP '2020-12-31 13:30:15');
SELECT CONCAT ('Geeks', 'for', 'geeks');
SELECT FORMAT('Hello, %s', 'Geeks!!');
SELECT UPPER('geeksforgeeks');
SELECT LOWER('GEEKSFORGEEKS');
SELECT CAST ('100' AS INTEGER);
SELECT CONVERT('100', SIGNED); -- Convert String to Integer
SELECT REGEXP_MATCHES('ABC', '^(A)(..)$', 'g');
SELECT REGEXP_REPLACE('Hello World', '(.*) (.*)', '\2, \1');
SELECT REGEXP_REPLACE('ABC12345xyz', '[[:alpha:]]', '', 'g');
SELECT REPLACE('Hello World', 'World', 'PostgreSQL') AS replaced_string;

-- If Statement
SELECT 
    employee_id,        
    salary,
    IF(salary >= 70000, 'High',
        IF(salary BETWEEN 60000 AND 69000, 'Medium', 'Low')
    ) AS salary_category
FROM employee_salary;

-- Case Statement
SELECT 
    employee_id,
    salary,
    CASE 
        WHEN salary >= 70000 THEN 'High'
        WHEN salary BETWEEN 60000 AND 69000 THEN 'Medium'
        ELSE 'Low'
    END AS salary_category
FROM employee_salary;

-- Loop
DELIMITER $$

CREATE PROCEDURE number_loop()
BEGIN
    DECLARE n INT DEFAULT 6;
    DECLARE cnt INT DEFAULT 1;

    loop_label: LOOP
        IF cnt = n THEN
            LEAVE loop_label;
        END IF;

        SELECT cnt;
        SET cnt = cnt + 1;
    END LOOP loop_label;
END$$

DELIMITER ;
CALL number_loop();  -- Call the procedure

-- For Loop
DELIMITER $$

CREATE PROCEDURE for_loop_example()
BEGIN
    DECLARE cnt INT DEFAULT 1;

    loop_label: LOOP
        IF cnt > 10 THEN
            LEAVE loop_label;
        END IF;

        SELECT CONCAT('cnt: ', cnt);
        SET cnt = cnt + 1;       --  1,2,3,4,5
    END LOOP loop_label;
END$$

DELIMITER ;

CALL for_loop_example();  -- Call the procedure

-- Exit Statement
DELIMITER $$

CREATE PROCEDURE loop_example()
BEGIN
    DECLARE n INT DEFAULT 8;
    DECLARE cnt INT DEFAULT 1;

    loop_label: LOOP
        IF cnt > 5 THEN
            LEAVE loop_label;
        END IF;

        SELECT cnt;
        SET cnt = cnt + 1;
    END LOOP loop_label;
END$$

DELIMITER ;

CALL loop_example();  -- Call the procedure

-- Continue Statement
DELIMITER $$

CREATE PROCEDURE continue_example()
BEGIN
    DECLARE cnt INT DEFAULT 0;

    loop_label: LOOP
        SET cnt = cnt + 1;

        IF cnt > 10 THEN
            LEAVE loop_label;
        END IF;

        IF MOD(cnt, 2) = 1 THEN
            ITERATE loop_label;   
        END IF;

        SELECT cnt;               -- prints 2,4,6,8,10
    END LOOP loop_label;

END$$

DELIMITER ;

CALL continue_example();  -- Call the procedure

-- Transactions
SET autocommit = 0;
START TRANSACTION;

UPDATE employee_salary
SET salary = salary + 5000
WHERE employee_id = 1;

UPDATE employee_salary
SET salary = salary - 5000
WHERE employee_id = 2;

COMMIT;

-- Final output after COMMIT
SELECT e.employee_id, e.first_name, es.salary
FROM employee_salary es
JOIN employee e ON es.employee_id = e.employee_id;

-- Rollback
START TRANSACTION;

UPDATE employee_salary
SET salary = salary - 5000
WHERE employee_id = 1;

UPDATE employee_salary
SET salary = salary + 5000
WHERE employee_id = 2;

-- Temporary values (before rollback)
SELECT e.employee_id, e.first_name, es.salary
FROM employee_salary es
JOIN employee e ON es.employee_id = e.employee_id;

ROLLBACK;

-- Final output after ROLLBACK (Original values restored)
SELECT e.employee_id, e.first_name, es.salary
FROM employee_salary es
JOIN employee e ON es.employee_id = e.employee_id;

-- Create Procedure
DELIMITER $$

CREATE PROCEDURE transfer_amount(
   IN sender INT,
   IN receiver INT,
   IN amount DECIMAL(10,2)
)
BEGIN
    START TRANSACTION;

    UPDATE employee_salary 
    SET salary = salary - amount 
    WHERE employee_id = sender;

    UPDATE employee_salary 
    SET salary = salary + amount 
    WHERE employee_id = receiver;

    COMMIT;
END $$

DELIMITER ;

-- Call Procedure
CALL transfer_amount(2, 1, 10000);

-- Roles & Permissions
SELECT User, Host FROM mysql.user;

-- Create User
CREATE USER 'hello'@'localhost' IDENTIFIED BY 'mypassword1';

-- Create Admin / Superuser
CREATE USER 'admin'@'localhost' IDENTIFIED BY 'mypassword1';
GRANT ALL PRIVILEGES ON *.* TO 'admin'@'localhost' WITH GRANT OPTION;

-- Create Database Manager
CREATE USER 'dba'@'localhost' IDENTIFIED BY 'Abcd1234';
GRANT CREATE, ALTER, DROP, INDEX ON *.* TO 'dba'@'localhost';

-- Create user with expiration 
CREATE USER 'qqq'@'localhost' IDENTIFIED BY 'securePass1' PASSWORD EXPIRE INTERVAL 180 DAY;

-- Create user with connection limit
CREATE USER 'www'@'localhost' IDENTIFIED BY 'securePass1';
ALTER USER 'www'@'localhost' WITH MAX_USER_CONNECTIONS 1000;

-- Grant permissions to user
GRANT SELECT, INSERT, UPDATE, DELETE ON employee_management.* TO 'hello'@'localhost';

-- Revoke permissions from user
REVOKE INSERT, UPDATE ON employee_management.* FROM 'hello'@'localhost';

-- Alter Role
ALTER ROLE Admin SUPERUSER;

-- Drop User
DROP USER 'admin'@'localhost';

-- Windows Functions
CREATE TABLE test_data (
    new_id INT,
    new_cat VARCHAR(20)
);

INSERT INTO test_data (new_id, new_cat) VALUES
(100, 'Sales'),
(200, 'Sales'),
(200, 'Finance'),
(300, 'Sales'),
(300, 'Finance'),
(400, 'Finance'),
(500, 'Sales');

-- With Aggregate Functions
SELECT 
    new_id, 
    new_cat,
    SUM(new_id) OVER(PARTITION BY new_cat ORDER BY new_id) AS "Total",
    AVG(new_id) OVER(PARTITION BY new_cat ORDER BY new_id) AS "Average",
    COUNT(new_id) OVER(PARTITION BY new_cat ORDER BY new_id) AS "Count",
    MIN(new_id) OVER(PARTITION BY new_cat ORDER BY new_id) AS "Min",
    MAX(new_id) OVER(PARTITION BY new_cat ORDER BY new_id) AS "Max"
FROM test_data;

-- With Ranking Functions
SELECT 
    new_id,
    new_cat,
    ROW_NUMBER() OVER (ORDER BY new_id) AS "ROW_NUMBER",
    RANK()       OVER (ORDER BY new_id) AS "RANK",
    DENSE_RANK() OVER (ORDER BY new_id) AS "DENSE_RANK",
    PERCENT_RANK() OVER (ORDER BY new_id) AS "PERCENT_RANK"
FROM test_data;

-- With Lead & Lag Functions
SELECT 
    new_id,
    new_cat,
    FIRST_VALUE(new_id) OVER (ORDER BY new_id) AS "FIRST_VALUE",
    LAST_VALUE(new_id)  OVER (ORDER BY new_id ROWS BETWEEN UNBOUNDED PRECEDING AND UNBOUNDED FOLLOWING) AS "LAST_VALUE",
    LEAD(new_id) OVER (ORDER BY new_id) AS "LEAD",
    LAG(new_id)  OVER (ORDER BY new_id) AS "LAG"
FROM test_data;

-- Rollup / Cube / Grouping Sets
CREATE TABLE sales (
  region VARCHAR(20),
  product VARCHAR(20),
  amount INT
);

INSERT INTO sales (region, product, amount) VALUES
('East', 'Pen', 100),
('East', 'Pencil', 150),
('West', 'Pen', 200),
('West', 'Pencil', 250);

-- Rollup - Subtotals + Grand Total
SELECT region, product, SUM(amount) AS total_sales
FROM sales
GROUP BY region, product WITH ROLLUP;

-- Cube - Region totlas + Product totals + Grand Total
SELECT region, product, SUM(amount) AS total_sales
FROM sales
GROUP BY region, product WITH CUBE;

-- Grouping Sets - Custom groupings
SELECT region, product, SUM(amount) AS total_sales
FROM sales
GROUP BY GROUPING SETS (
  (region, product),  -- normal group
  (region),           -- subtotal by region
  ()                  -- grand total
);








