const express = require('express');
const cors = require('cors');
const app = express();
const Customer = require('./CustomerSchema.js');
const Order = require('./Order.js');
const MenuItem = require('./Menu.js'); 
const EmployeeUser = require('./EmployeeUserSchema.js');
const Schedule = require('./ScheduleSchema.js');
const jwt = require("jsonwebtoken");
const router = express.Router();

app.use(express.json());
app.use(cors())
app.listen(9000, ()=> {
    console.log(`Server Started at ${9000}`);
})

const mongoose = require('mongoose');
const mongoString = 'mongodb+srv://cgranda:plvkgRjC9IqqzoVn@lab418y.dvp8m.mongodb.net/CoffeeShop?retryWrites=true&w=majority';
mongoose.connect(mongoString)
const database = mongoose.connection

database.on('error', (error) => console.log(error))

database.once('connected', () => console.log('Databased Connected'))
app.post("/api/customers/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        // Check if user exists with the given username and password
        const user = await Customer.findOne({ username, password });

        if (!user) {
            // If user doesn't exist, send an unauthorized response
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { userId: user._id, username: user.username }, // Payload with user details
            "your_jwt_secret", // Replace with your secure secret key
            { expiresIn: "1h" } // Token expires in 1 hour
        );

        // Respond with the token
        res.status(200).json({ token });
    } catch (err) {
        console.error("Error during login:", err);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.post("/api/employees/login", async (req, res) => {
      const { username, password } = req.body;
  
      try {
          // Check if user exists with the given username and password
          const user = await EmployeeUser.findOne({ username, password });
  
          if (!user) {
              // If user doesn't exist, send an unauthorized response
              return res.status(401).json({ message: "Invalid credentials" });
          }
  
          // Generate a JWT token
          const token = jwt.sign(
              { userId: user._id, username: user.username, manager: user.manager }, // Payload with user details
              "your_jwt_secret", // Replace with your secure secret key
              { expiresIn: "1h" } // Token expires in 1 hour
          );
  
          // Respond with the token
          res.status(200).json({ token });
      } catch (err) {
          console.error("Error during login:", err);
          res.status(500).json({ message: "Internal server error" });
      }
  });


app.post('/createCustomer', async (req, res) => {
    console.log(`SERVER: CREATE USER REQ BODY: ${req.body.username} ${req.body.firstName} ${req.body.lastName}`)
    const un = req.body.username
    try {
        //Check if username already exists in database
        Customer.exists({username: un}).then(result => {
            if(Object.is(result, null)) {
                const user = new Customer(req.body);
                user.save()
                console.log(`User created! ${user}`)
                res.send(user)
            }
            else {
                console.log("Username already exists")
                res.status(500).send("Username already exists")
            }
        })
    }
    catch (error){
        res.status(500).send(error)
    }
})
// API Route to fetch data based on user type
router.get('/home', async (req, res) => {
  try {
    const { userId } = req.query; // Get userId from the request query
    // Check if the user is a Customer
    const customer = await Customer.findById(userId).populate('orders.orderId');
    
    if (customer) {
      // Respond with customer data if found
      return res.status(200).json({
        userType: 'customer', // Add userType to distinguish between employee and customer
        name: `${customer.firstName} ${customer.lastName}`,
        points: customer.points,
        orders: customer.orders,
      });
    }

    // Check if the user is an Employee
    const employee = await EmployeeUser.findById(userId);
    
    if (employee) {
      // Respond with employee data if found
      return res.status(200).json({
        userType: 'employee', // Add userType to distinguish between employee and customer
        name: `${employee.firstName} ${employee.lastName}`,
        manager: employee.manager,
        username: employee.username,
      });
    }

    // If neither customer nor employee is found, return 404
    return res.status(404).json({ message: 'User not found' });
  } catch (error) {
    console.error('Error fetching user data:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = router;

  app.get('/api/customers/home', async (req, res) => {
    const { userId } = req.query;
  
    try {
      const customer = await Customer.findById(userId).populate('orders.orderId');
      if (!customer) {
        console.log('Customer not found');
        return res.status(404).json({ message: 'Customer not found' });
      }
  
      res.status(200).json({
        name: `${customer.firstName} ${customer.lastName}`,
        points: customer.points,
        orders: customer.orders,
      });
    } catch (error) {
      console.error('Error fetching customer data:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

app.post('/api/orders', async (req, res) => {
    const { customerId, items, total } = req.body;
  
    try {
      // Validate that each item has a productId
      for (const item of items) {
        if (!item.productId || !item.itemName) {
          return res.status(400).json({ message: 'Each item must have a productId and itemName!' });
        }
      }
  
      // Create the new order
      const newOrder = new Order({ customerId, items, total });
      await newOrder.save();
  
      // Update the customer's orders array
      const customer = await Customer.findById(customerId);
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
  
      customer.orders.push({ orderId: newOrder._id, status: 'Pending' }); // Add orderId and status
      await customer.save();
  
      res.status(201).json({ message: 'Order placed successfully', order: newOrder });
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

app.get('/api/orders/get', async (req, res) => {
  try{
    const orders = await Order.find({status: "Confirmed"}).populate("items");
    
    res.status(200).json(orders);
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.put('/api/orders/:orderId', async (req, res) => {
    const { orderId } = req.params;
  
    try {
      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { status: 'Confirmed' },
        { new: true }
      );
      if (!updatedOrder) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      res.status(200).json({ message: 'Order confirmed', order: updatedOrder });
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  app.get('/api/orders/:orderId', async (req, res) => {
    const { orderId } = req.params;
  
    try {
      const order = await Order.findById(orderId).populate('items.productId'); // Populates MenuItem details
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      res.status(200).json(order);
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
// Fulfill an order and remove it from the database
app.put('/api/orders/fulfill/:orderId', async (req, res) => {
      const { orderId } = req.params;
    
      try {
        const deletedOrder = await Order.findByIdAndDelete(orderId);
        if (!deletedOrder) {
          console.log(orderId);
          return res.status(500).json({ message: 'Order not found' });
        }
    
        res.status(200).json({ message: 'Order fulfilled', order: deletedOrder });
      } catch (error) {
        console.error('Error updating order status:', error);
        res.status(500).json({ message: 'Internal server error' });
      }
    });
  
  
  
//add menu item
app.post('/api/menu', async (req, res) => {
    const { name, price, description, addOns } = req.body;
  
    try {
      const newItem = new MenuItem({ name, price, description, addOns });
      await newItem.save();
  
      res.status(201).json({ message: 'Menu item created successfully', item: newItem });
    } catch (error) {
      console.error('Error creating menu item:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  
  //get all menu items
  app.get('/api/menu', async (req, res) => {
    try {
      const items = await MenuItem.find();
      res.status(200).json(items);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  //delete menu item
  app.delete('/api/menu/:id', async (req, res) => {
    const { id } = req.params;
  
    try {
      await MenuItem.findByIdAndDelete(id);
      res.status(200).json({ message: 'Menu item deleted successfully' });
    } catch (error) {
      console.error('Error deleting menu item:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  //update a menu item
  app.put('/api/menu/:id', async (req, res) => {
    const { id } = req.params;
    const { name, price, description } = req.body;
  
    try {
      const updatedItem = await MenuItem.findByIdAndUpdate(
        id,
        { name, price, description },
        { new: true }
      );
      res.status(200).json({ message: 'Menu item updated successfully', item: updatedItem });
    } catch (error) {
      console.error('Error updating menu item:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  app.post('/api/orders/:orderId/pay', async (req, res) => {
    const { orderId } = req.params;
    const { points } = req.body;
  
    try {
      // Find the order
      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }
  
      // Update order status to "Confirmed"
      order.status = 'Confirmed';
      await order.save();
  
      // Update customer points
      const customer = await Customer.findById(order.customerId);
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }
  
      // Deduct points if applicable
      const discountPoints = customer.points >= 500 ? 500 : 0;
      customer.points = customer.points - discountPoints + points; // Deduct 500 points and add new points
      await customer.save();
  
      res.status(200).json({ message: 'Payment successful', updatedPoints: customer.points });
    } catch (error) {
      console.error('Error processing payment:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

//Employee-----------------------------------------------------------------==============

const bcrypt = require('bcrypt');

// Employee Signup API
app.post('/api/employees/signup', async (req, res) => {
  const { firstName, lastName, username, password, role, manager } = req.body;

  console.log(`SERVER: CREATE EMPLOYEE REQUEST - Username: ${username}, Name: ${firstName} ${lastName}`);

  try {
    // Check if the username already exists
    const existingEmployee = await EmployeeUser.findOne({ username });
    if (existingEmployee) {
      console.log('Username already exists');
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Create a new employee
    const newEmployee = new EmployeeUser({
      firstName,
      lastName,
      username,
      password, // Ensure password is hashed if needed
      role,     // Employee-specific role
      manager,  // Optional: Manager field for the employee
    });

    await newEmployee.save();
    console.log(`Employee created successfully: ${newEmployee}`);
    res.status(201).json({ message: 'Employee created successfully', employee: newEmployee });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Employee Login Route
app.post('/api/employee/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find employee user by username
    const employee = await EmployeeUser.findOne({ username });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });

    // Compare password using bcrypt
    const isPasswordValid = await bcrypt.compare(password, employee.password);
    if (!isPasswordValid) return res.status(401).json({ message: 'Invalid credentials' });

    // Generate JWT token
    const token = jwt.sign(
      { userId: employee._id, username: employee.username }, // Include userId and username in the token
      'your_jwt_secret', // Replace with your actual JWT secret
      { expiresIn: '1h' }
    );

    res.status(200).json({ token });
  } catch (err) {
    console.error('Error logging in employee:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});

module.exports = app;


  // Employee Home Route
  app.get('/api/employees/home', async (req, res) => {
    const { userId } = req.query;
  
    try {
      const employee = await EmployeeUser.findById(userId);
      if (!employee) {
        console.log('Employee not found');
        return res.status(404).json({ message: 'Employee not found' });
      }
  
      res.status(200).json({
        name: `${employee.firstName} ${employee.lastName}`,
        manager: employee.manager, // Assuming 'manager' is part of the employee schema
        role: employee.role,       // Assuming 'role' exists for the employee
      });
    } catch (error) {
      console.error('Error fetching employee data:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  


  //customer
app.post('/api/customers/signup', async (req, res) => {
  const { firstName, lastName, username, password } = req.body;

  console.log(`SERVER: CREATE CUSTOMER REQUEST - Username: ${username}, Name: ${firstName} ${lastName}`);

  try {
      // Check if the username already exists
      const existingCustomer = await Customer.findOne({ username });
      if (existingCustomer) {
          console.log('Username already exists');
          return res.status(400).json({ message: 'Username already exists' });
      }

      // Create a new customer
      const newCustomer = new Customer({
          firstName,
          lastName,
          username,
          password, // If you want to hash passwords, ensure the schema does it with a pre-save hook
      });

      await newCustomer.save();
      console.log(`Customer created successfully: ${newCustomer}`);
      res.status(201).json({ message: 'Customer created successfully', customer: newCustomer });
  } catch (error) {
      console.error('Error creating customer:', error);
      res.status(500).json({ message: 'Internal server error' });
  }
});

//======================Shifts==============================================================================


app.get('/api/employees/shifts', async (req, res) => {

  try {
    const schedules = await Schedule.find();

    res.status(200).json(schedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ message: 'Internal server error' });
  }

})

app.get('/api/employees/shifts/:employee_id', async (req, res) => {

  try {
    const employeeId = req.params.employee_id;

    const schedules = await Schedule.find({employeeId: employeeId});

    res.status(200).json(schedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ message: 'Internal server error' });
  }

})

app.get('/api/employees/shifts/breaks/unapproved', async (req, res) => {

  try {
    const schedules = await Schedule.find({scheduleType: 'Break', approved: false});

    res.status(200).json(schedules);
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({ message: 'Internal server error' });
  }

})

app.post('/api/employees/shifts', async (req, res) => {

  try {
    const schedule = new Schedule(req.body);

    if(schedule.scheduleType === 'Shift'){
      schedule.approved = true;
    }
    else{
      schedule.approved = false;
    }

    await schedule.save();

    console.log('New Shift Created: ', schedule);
  } catch (error) {
    console.error('Error creating new shift:', error);
    res.status(500).json({ message: 'Internal server error' });
  }

})

app.patch('/api/breaks/approve/:breakId', async (req, res) => {
  try {
    const breakId = req.params.breakId;

    const schedule = await Schedule.findByIdAndUpdate(breakId, { approved: true});

    console.log('Break Approved: ' + schedule)
  } catch (error ) {
    console.error('Error approving shift: ', error);
    res.status(500).json({ message: 'Internal server error' });
  }
})

app.delete('/api/employees/shifts/:shiftId', async (req, res) => {

  try {
    const shiftId = req.params.shiftId;

    const schedule = await Schedule.findByIdAndDelete(shiftId);

    console.log('Deleting Shift: ', schedule);
  } catch (error) {
    console.error('Error creating new shift:', error);
    res.status(500).json({ message: 'Internal server error' });
  }

})

//======================Inventory==============================================================================

const Inventory = require('./Inventory');
//Get All Inventory Items
app.get('/api/inventory', async (req, res) => {
  try {
    const inventoryItems = await Inventory.find();
    res.status(200).json(inventoryItems);
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

//Add Inventory Item
app.post('/api/inventory', async (req, res) => {
  const { name, currentQuantity } = req.body;

  try {
    const stockStatus = currentQuantity < 10 ? 'Low' : 'Good';
    const newItem = new Inventory({ name, currentQuantity, stockStatus });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (error) {
    console.error('Error adding inventory item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Delete Inventory Item
app.delete('/api/inventory/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedItem = await Inventory.findByIdAndDelete(id);
    if (!deletedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(200).json({ message: 'Item deleted', item: deletedItem });
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


//Automatically update the stockStatus based on the currentQuantity.
app.put('/api/inventory/:id', async (req, res) => {
  const { id } = req.params;
  const { currentQuantity } = req.body;

  try {
    const stockStatus = currentQuantity < 10 ? 'Low' : 'Good';
    const updatedItem = await Inventory.findByIdAndUpdate(
      id,
      { currentQuantity, stockStatus },
      { new: true }
    );
    if (!updatedItem) {
      return res.status(404).json({ message: 'Item not found' });
    }
    res.status(200).json(updatedItem);
  } catch (error) {
    console.error('Error updating inventory:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});
