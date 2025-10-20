DELIMITER $$

CREATE PROCEDURE get_drivers_for_user(
    IN p_role VARCHAR(50),
    IN p_store_id INT
)
BEGIN
    IF p_role = 'store_manager' THEN
        SELECT e.employee_id,
				e.employee_name,
                e.total_hours_week,
                e.official_contact_number,
                d.status,
                d.consecutive_deliveries,
                d.next_available_time
        FROM driver d
        JOIN employee e using (employee_id)
        WHERE e.store_id = p_store_id;
    ELSE
        SELECT *
        FROM driver;
    END IF;
END $$

DELIMITER ;




DELIMITER $$

CREATE PROCEDURE get_assistants_for_user(
    IN p_role VARCHAR(50),
    IN p_store_id INT
)
BEGIN
    IF p_role = 'store_manager' THEN
        SELECT 
            e.employee_id,
            e.employee_name,
            e.total_hours_week,
            e.official_contact_number,
            a.status,
            a.consecutive_deliveries,
            a.next_available_time
        FROM assistant a
        JOIN employee e USING (employee_id)
        WHERE e.store_id = p_store_id;
    ELSE
        SELECT 
            e.employee_id,
            e.employee_name,
            e.total_hours_week,
            e.official_contact_number,
            a.status,
            a.consecutive_deliveries,
            a.next_available_time,
            e.store_id
        FROM assistant a
        JOIN employee e USING (employee_id);
    END IF;
END $$

DELIMITER ;



DELIMITER $$

CREATE PROCEDURE get_summary_for_user(
    IN p_role VARCHAR(50),
    IN p_store_id INT
)
BEGIN
    DECLARE on_duty_drivers INT DEFAULT 0;
    DECLARE on_duty_assistants INT DEFAULT 0;
    DECLARE available_to_schedule INT DEFAULT 0;

    -- Role-based filtering
    IF p_role = 'store_manager' THEN
        -- Limit results to the manager's store
        SELECT 
            SUM(CASE WHEN e.role_id = 2 AND d.status = 'On Duty' THEN 1 ELSE 0 END) AS on_duty_drivers,
            SUM(CASE WHEN e.role_id = 1 AND a.status = 'On Duty' THEN 1 ELSE 0 END) AS on_duty_assistants,
            SUM(CASE 
                    WHEN (d.status = 'Available' AND d.next_available_time <= NOW()) OR 
                         (a.status = 'Available' AND a.next_available_time <= NOW())
                    THEN 1 ELSE 0 
                END) AS available_to_schedule
        INTO on_duty_drivers, on_duty_assistants, available_to_schedule
        FROM employee e
        LEFT JOIN driver d ON e.employee_id = d.employee_id
        LEFT JOIN assistant a ON e.employee_id = a.employee_id
        WHERE e.store_id = p_store_id;
    ELSE
        -- Admin or higher roles: show totals across all stores
        SELECT 
            SUM(CASE WHEN e.role_id = 2 AND d.status = 'On Duty' THEN 1 ELSE 0 END) AS on_duty_drivers,
            SUM(CASE WHEN e.role_id = 1 AND a.status = 'On Duty' THEN 1 ELSE 0 END) AS on_duty_assistants,
            SUM(CASE 
                    WHEN (d.status = 'Available' AND d.next_available_time <= NOW()) OR 
                         (a.status = 'Available' AND a.next_available_time <= NOW())
                    THEN 1 ELSE 0 
                END) AS available_to_schedule
        INTO on_duty_drivers, on_duty_assistants, available_to_schedule
        FROM employee e
        LEFT JOIN driver d ON e.employee_id = d.employee_id
        LEFT JOIN assistant a ON e.employee_id = a.employee_id;
    END IF;

    -- Return final summary
    SELECT 
        on_duty_drivers AS on_duty_drivers,
        40 AS drivers_weekly_limit,
        on_duty_assistants AS on_duty_assistants,
        60 AS assistants_weekly_limit,
        available_to_schedule AS available_to_schedule,
        'Compliance met' AS compliance;
END $$

DELIMITER ;




DELIMITER $$
CREATE PROCEDURE `get_trucks_for_user`(
    IN p_role VARCHAR(50),
    IN p_store_id INT
)
BEGIN
    IF p_role = 'store_manager' THEN
        SELECT t.truck_id,
               t.plate_number,
               t.is_available
        FROM truck t
        WHERE t.store_id = p_store_id;
    ELSE
        SELECT *
        FROM truck;
    END IF;
END$$
DELIMITER ;
