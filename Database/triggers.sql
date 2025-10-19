DELIMITER //

CREATE TRIGGER check_consecutive_driver_deliveries
BEFORE INSERT ON truckemployeeassignment
FOR EACH ROW
BEGIN
    DECLARE role_name VARCHAR(20);
    DECLARE last_delivery_time DATETIME;
    DECLARE new_delivery_time DATETIME;

    -- Get the role of the employee
    SELECT r.role_name 
    INTO role_name
    FROM employee e
    JOIN roles r ON e.role_id = r.role_id
    WHERE e.employee_id = NEW.employee_id;

    -- Proceed only if driver
    IF role_name = 'Driver' THEN

        -- Get scheduled departure time for the new delivery
        SELECT td.scheduled_departure 
        INTO new_delivery_time
        FROM truckdelivery td
        WHERE td.delivery_id = NEW.truck_delivery_id;

        -- Get the most recent delivery assigned to this driver
        SELECT td.scheduled_departure
        INTO last_delivery_time
        FROM truckemployeeassignment tea
        JOIN truckdelivery td ON tea.truck_delivery_id = td.delivery_id
        WHERE tea.employee_id = NEW.employee_id
        ORDER BY td.scheduled_departure DESC
        LIMIT 1;

        -- Check if there’s less than 4 hours between last and new deliveries
        IF last_delivery_time IS NOT NULL 
           AND ABS(TIMESTAMPDIFF(HOUR, last_delivery_time, new_delivery_time)) < 4 THEN
            SIGNAL SQLSTATE '45000'
                SET MESSAGE_TEXT = 'Driver cannot be assigned to consecutive deliveries without rest period.';
        END IF;

    END IF;
END;
//

DELIMITER ;