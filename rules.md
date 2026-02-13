Rules:
- Controller: HTTP only (req, res), no business logic, no DB queries
- Service: handle all business logic, validation, database operations, JWT, password hashing
- Model: schema only
