#MenuHub API
- This is a RESTful API for managing hotels menu. It allows users to perform various CRUD operations (Create, Read, Update, Delete), as well as generate QR codes for hotels and upload profile images for hotels, customers. The API is built using Node.js, Express, and Mongoose, and is secured with authentication and authorization middleware.



##Run
- First set enviromental variable for `MenuHub_Private_Key`.
   - Example: `export MenuHub_Private_Key="1234"`
- nodemon or index.js



##Prerequisites
- Before running the API, make sure you have the following dependencies installed:
  - bcrypt
  - body-parser
  - config
  - express
  - express-async-errors
  - g
  - joi
  - jsonwebtoken
  - lodash
  - mongoose
  - multer
  - nodemon
  - qrcode
  - winston
  - winston-mongodb

- You can install these dependencies using npm or yarn by running npm install or yarn install in the project directory.



##Authentication and Authorization
- Some endpoints require authentication and authorization. The authenticate middleware ensures that only authenticated users can access protected routes, while the authorize middleware restricts access to specific user roles (in this case, only users with the role of "Hotel" can access certain routes). You can customize these middlewares to suit your own authentication and authorization requirements.



#API Endpoints
- The API provides the following endpoints:



##Hotel Routes
####GET /api/hotels/ 
- Get all hotels, sorted by name or star rating (with optional query parameters for sorting)
    - sortBy = ['name', 'star']
    - sortOrder = ['asc', 'desc']

####GET /api/hotels/:id 
- Get a specific hotel by ID

####POST /api/hotels/ 
- Create a new hotel

####PUT /api/hotels/:id 
- Update a hotel by ID

####DELETE /api/hotels/:id 
- Delete a hotel by ID

####GET /api/hotels/:id/qr-generator 
- Generate a QR code for a hotel by ID

####POST /api/hotels/:id/profile-image 
- Upload a profile image for a hotel by ID



##Menu Routes
####GET /api/menu/hotel/:id - Retrieves menu items for a specific hotel based on the hotel's ID.
- Query parameters:
    - sortBy (optional): Field to sort the menu items by (default: 'name'). Possible values: 'name', 'price', 'rating'.
    - sortOrder (optional): Sort order for the menu items (default: 'asc'). Possible values: 'asc', 'desc'.
- Returns an array of menu items sorted based on the provided query parameters.

####GET /api/menu/:id 
- Retrieves a menu item based on the menu item's ID.
- Path parameters:
  - id: ID of the menu item to retrieve.
- Returns the retrieved menu item.

####POST /api/menus 
- Creates a new menu item.
- Requires authentication and authorization with the role 'Hotel'.
- Request body should contain the details of the menu item to be created.
- Returns the created menu item.

####PUT /api/menus/:id 
- Updates an existing menu item based on the menu item's ID.
- Requires authentication and authorization with the role 'Hotel'.
- Path parameters:
  - id: ID of the menu item to update.
- Request body should contain the updated details of the menu item.
- Returns the updated menu item.

####DELETE /api/menus/:id
- Deletes a menu item based on the menu item's ID.
- Requires authentication and authorization with the role 'Hotel'.
- Path parameters:
  - id: ID of the menu item to delete.
- Returns the deleted menu item.

####POST /api/menus/:id/images
- Uploads images for a menu item based on the menu item's ID.
- Requires authentication and authorization with the role 'Hotel'.
- Path parameters:
    -id: ID of the menu item to upload images for.
- Request body should contain the images to be uploaded as form-data with key 'images'.
- Returns a success message upon successful image upload.



##Authentication Routes
####GET /api/me
- Retrieves the user's profile information based on their role after authenticating and authorizing the request.
- Authorization: Required
- Role-based Access: Customer, Waiter, Chief, Hotel
- Response: Returns the user's profile information as a JSON object.


####POST /api/auth
- Authenticates the user based on their role, email, and password, and returns a JSON Web Token (JWT) for further authentication.
- Authorization: Not required
- Role-based Access: N/A
- Request Body:
- Example: 
  {
    "email": "<user_email>",
    "role": "<user_role>",
    "password": "<user_password>"
  }

##Customer Routes
####GET /api/customers
- Retrieve all customers.

####GET /api/customers/:id
- Retrieve a customer by ID.

####POST /api/customers
- Create a new customer.

####PUT /api/customers/:id
- Update a customer by ID.

####DELETE /api/customers/:id
- Delete a customer by ID.

####POST /api/customers/:id/profile-image
- Upload a profile image for a customer by ID.



##Chief Routes
####GET /api/chiefs
- This route retrieves all Chief accounts from the database and sends the response as an array of Chief objects (excluding the password field).

####GET /api/chiefs/:id
- This route retrieves a specific Chief account from the database based on the provided id parameter and sends the response as a Chief object (excluding the password field).

####POST /api/chiefs/
- This route creates a new Chief account in the database after validating the request body and checking for authorization. It sends the created Chief object (excluding the password field) and a JWT token in the response header.

####PUT /api/chiefs/:id
- This route updates a specific Chief account in the database based on the provided id parameter after validating the request body and checking for authorization. It sends the updated Chief object (excluding the password field) in the response.

####DELETE /api/chiefs/:id
- This route deletes a specific Chief account from the database based on the provided id parameter after checking for authorization. It sends the deleted Chief object (excluding the password field) in the response.

####POST /api/chiefs/:id/profile-image
- This route uploads a profile image for a specific Chief account based on the provided id parameter after checking for authentication and authorization. It sends a success message in the response.

####POST /api/chiefs/:id/ready
- This route sets an order as ready for a specific Chief account based on the provided id parameter and the order id in the request body after checking for authentication and authorization. It sends the updated order object in the response.



##Waiter Routes
###GET /api/waiters
- This endpoint returns a list of all waiters in the system. It fetches waiter objects from the database and sends them as a response. The password field is excluded from the response.

###GET /api/waiters/:id
- This endpoint returns details of a specific waiter identified by the :id parameter in the URL. It validates if the provided :id is a valid MongoDB ObjectId and fetches the waiter object from the database. If the waiter is found, the details are sent as a response. The password field is excluded from the response.

###POST /api/waiters
- This endpoint allows the registration of a new waiter. It requires authentication and authorization with the role of "Hotel". It validates the request body against a Joi schema and checks if the hotelId provided is valid. It also checks if the email address of the waiter is already registered. If all validations pass, a new waiter object is created and saved to the database with encrypted password. A JSON Web Token (JWT) is generated and sent as a response header along with the waiter object, excluding the password field.

###PUT /api/waiters/:id
- This endpoint allows updating the details of a specific waiter identified by the :id parameter in the URL. It requires authentication and authorization with the role of "Waiter". It validates the request body against a Joi schema, checks if the :id and hotelId provided are valid, and if the hotelId exists in the database. If all validations pass, the waiter object is updated in the database and the updated waiter object (excluding the password field) is sent as a response.

###DELETE /api/waiters/:id
- This endpoint allows deleting a specific waiter identified by the :id parameter in the URL. It requires authentication and authorization with the role of "Hotel". It validates if the :id provided is a valid MongoDB ObjectId, fetches the waiter object from the database, removes the waiter object from the database, and sends the removed waiter object (excluding the password field) as a response.

###POST /api/waiters/:id/profile-image
- This endpoint allows uploading a profile image for a specific waiter identified by the :id parameter in the URL. It requires authentication and authorization with the role of "Waiter". It validates if the :id provided is a valid MongoDB ObjectId, fetches the waiter object from the database, and saves the uploaded image file to the server. The file name is then stored in the waiter object in the database, and a success message is sent as a response.

###POST /api/waiters/:id/confirm
- This endpoint allows confirming an order for a specific waiter identified by the :id parameter in the URL. It requires authentication and authorization with the role of "Waiter". It validates if the :id provided is a valid MongoDB ObjectId, fetches the waiter object from the database, and checks if the orderId provided in the request body is valid and exists in the database. If all validations pass, the status of the order is updated to "Confirmed" in the database, and the updated order object is sent as a response.

###POST /api/waiters/:id/cancel
- This endpoint allows cancelling an order for a specific waiter identified by the :id parameter in the URL. It requires authentication and authorization with the role of "Waiter". It validates if the :id provided is a valid MongoDB



##OrderItem Routes
####GET /api/orderItems
- Description: This route retrieves all order items from the database.
- Authentication: Not required
- Authorization: Not required

####GET /api/orderItems/:id
- Description: This route retrieves a specific order item by its ID from the database.
- Authentication: Not required
- Authorization: Not required

####POST /api/orderItems
- Description: This route creates a new order item in the database.
- Authentication: Required (authenticate middleware)
- Authorization: Required (authorize middleware with roles "Customer" or "Waiter")

####PUT /api/orderItems/:id
- Description: This route updates an existing order item in the database by its ID.
- Authentication: Required (authenticate middleware)
- Authorization: Required (authorize middleware with roles "Customer" or "Waiter")

####DELETE /api/orderItems/:id
- Description: This route deletes an order item from the database by its ID.
- Authentication: Required (authenticate middleware)
- Authorization: Required (authorize middleware with roles "Customer" or "Waiter")



##Order Routes
####GET /api/orders
- Description: This route retrieves all orders from the database.
- Authentication: Required (authenticate middleware)
- Authorization: Required (authorize middleware with roles "Waiter" or "Chef")

####GET  /api/orders/:id
- Description: This route retrieves a specific order from the database by its ID.
- Authentication: Required (authenticate middleware)
- Authorization: Required (authorize middleware with roles "Waiter" or "Chef")

####POST  /api/orders
- Description: This route creates a new order in the database.
- Authentication: Required (authenticate middleware)
- Authorization: Required (authorize middleware with role "Customer")

####PUT  /api/orders/:id
- Description: This route updates a specific order in the database by its ID.
- Authentication: Required (authenticate middleware)
- Authorization: Required (authorize middleware with roles "Waiter" or "Chef")

####DELETE  /api/orders/:id
- Description: This route deletes an order from the database by its ID.
- Authentication: Required (authenticate middleware)
- Authorization: Required (authorize middleware with roles "Customer" or "Waiter")



##Table Routes
####GET /api/hotels/:hotelId/tables/
- Description: Retrieves all tables for a specific hotel.
- Authentication: Required
- Authorization: Required (Role: Hotel)

###GET /api/hotels/:hotelId/tables/:id
- Description: Retrieves a specific table by its ID for a specific hotel.
- Authentication: Required
- Authorization: Required (Role: Hotel)

####POST /api/hotels/:hotelId/tables/
- Description: Creates a new table for a specific hotel.
- Authentication: Required
- Authorization: Required (Role: Hotel)

####PUT /api/hotels/:hotelId/tables/:id
- Description: Updates a specific table by its ID for a specific hotel.
- Authentication: Required
- Authorization: Required (Role: Hotel)

####DELETE /api/hotels/:hotelId/tables/:id
- Description: Deletes a specific table by its ID for a specific hotel.
- Authentication: Required
- Authorization: Required (Role: Hotel)

####GET /api/hotels/:hotelId/tables/:id/qr-generator
- Description: Generates a QR code for a specific table in a specific hotel.
- Authentication: Required
- Authorization: Required (Role: Hotel)

